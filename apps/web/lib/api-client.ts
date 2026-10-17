import type { ApiRequestOptions } from "@volt/types";

import { readFirebaseIdToken } from "./firebase-client";
import { readStoredApiKey } from "./session-storage";

export const API_BASE_URL = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:8080";

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function buildHeaders(hasBody: boolean, apiKey: string | null): Headers {
  const headers = new Headers();
  if (hasBody) {
    headers.set("Content-Type", "application/json");
  }
  if (apiKey) {
    headers.set("Authorization", `Bearer ${apiKey}`);
  }
  return headers;
}

/** Firebase ID token when signed in with Firebase, otherwise the stored personal API key. */
async function resolveBearer(override?: string): Promise<string | null> {
  if (override) {
    return override;
  }
  return (await readFirebaseIdToken()) ?? readStoredApiKey();
}

async function readErrorMessage(res: Response): Promise<string> {
  try {
    const payload = (await res.json()) as { message?: string; error?: string };
    return payload.message ?? payload.error ?? res.statusText;
  } catch {
    return res.statusText || `Request failed with status ${res.status}`;
  }
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
  apiKeyOverride?: string,
): Promise<T> {
  const apiKey = await resolveBearer(apiKeyOverride);
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers: buildHeaders(options.body !== undefined, apiKey),
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  if (!res.ok) {
    throw new ApiError(res.status, await readErrorMessage(res));
  }
  if (res.status === 204) {
    return {} as T;
  }
  return (await res.json()) as T;
}

export async function apiDownload(path: string, filename: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: buildHeaders(false, await resolveBearer()),
  });
  if (!res.ok) {
    throw new ApiError(res.status, await readErrorMessage(res));
  }
  const url = URL.createObjectURL(await res.blob());
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function errorMessage(error: Error | string): string {
  return typeof error === "string" ? error : error.message;
}
