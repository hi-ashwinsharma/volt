import type { OverlayCaptureResult } from "./cli.types";

export interface TauriGlobalBridge {
  readonly __TAURI_INTERNALS__?: {
    readonly invoke: (
      cmd: string,
      args?: Readonly<Record<string, string | number | null>>
    ) => Promise<OverlayCaptureResult>;
  };
}

export interface TelegramUpdatePayload {
  readonly update_id: number;
  readonly message?: {
    readonly message_id: number;
    readonly from?: {
      readonly id: number;
      readonly username?: string;
      readonly first_name?: string;
    };
    readonly chat: {
      readonly id: number;
      readonly type: string;
    };
    readonly date: number;
    readonly text?: string;
    readonly voice?: {
      readonly file_id: string;
      readonly file_unique_id: string;
      readonly duration: number;
      readonly mime_type?: string;
    };
  };
}
