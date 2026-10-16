import type { StagedLogRecord, UserPolicyContext } from "@volt/types";

const memoryFallbackCache = new Map<
  string,
  { value: string; expiresAtMs: number }
>();

function getUpstashConfig(): {
  readonly url: string;
  readonly token: string;
} | null {
  const url = process.env["UPSTASH_REDIS_REST_URL"];
  const token = process.env["UPSTASH_REDIS_REST_TOKEN"];
  if (!url || !token || url.includes("example-endpoint")) {
    return null;
  }
  return { url, token };
}

export async function redisGet(key: string): Promise<string | null> {
  const cfg = getUpstashConfig();
  if (!cfg) {
    const entry = memoryFallbackCache.get(key);
    if (!entry) {
      return null;
    }
    if (Date.now() > entry.expiresAtMs) {
      memoryFallbackCache.delete(key);
      return null;
    }
    return entry.value;
  }

  const res = await fetch(`${cfg.url}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${cfg.token}` },
  });
  if (!res.ok) {
    return null;
  }
  const body = (await res.json()) as { result: string | null };
  return body.result;
}

export async function redisSetEx(
  key: string,
  value: string,
  ttlSeconds: number
): Promise<void> {
  const cfg = getUpstashConfig();
  if (!cfg) {
    memoryFallbackCache.set(key, {
      value,
      expiresAtMs: Date.now() + ttlSeconds * 1000,
    });
    return;
  }

  await fetch(
    `${cfg.url}/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}?EX=${ttlSeconds}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${cfg.token}` },
    }
  );
}

export async function redisDel(key: string): Promise<void> {
  const cfg = getUpstashConfig();
  if (!cfg) {
    memoryFallbackCache.delete(key);
    return;
  }

  await fetch(`${cfg.url}/del/${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${cfg.token}` },
  });
}

export async function cacheUserPolicyContext(
  ctx: UserPolicyContext
): Promise<void> {
  await redisSetEx(`volt:pbac:user:${ctx.userId}`, JSON.stringify(ctx), 300);
}

export async function getCachedUserPolicyContext(
  userId: string
): Promise<UserPolicyContext | null> {
  const raw = await redisGet(`volt:pbac:user:${userId}`);
  if (!raw) {
    return null;
  }
  return JSON.parse(raw) as UserPolicyContext;
}

export async function invalidateUserPolicyCache(userId: string): Promise<void> {
  await redisDel(`volt:pbac:user:${userId}`);
}

export async function cacheStagedLogsSnapshot(
  userId: string,
  logs: readonly StagedLogRecord[]
): Promise<void> {
  await redisSetEx(`volt:staged:${userId}`, JSON.stringify(logs), 3600);
}
