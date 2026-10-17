import { z } from "zod";

export const EnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(8080),
  API_PUBLIC_URL: z.string().url().default("http://localhost:8080"),
  WEB_PUBLIC_URL: z.string().url().default("http://localhost:3000"),
  CANONICAL_TIMEZONE: z.string().min(1).default("Asia/Kolkata"),

  DATABASE_URL: z.string().min(1),
  FIREBASE_PROJECT_ID: z.string().min(1).optional(),

  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),

  GEMINI_API_KEY: z.string().min(1).optional(),
  GEMINI_MODEL_ID: z.string().min(1).default("gemini-1.5-flash"),

  GITHUB_APP_ID: z.string().optional(),
  GITHUB_APP_SLUG: z.string().default("volt-impact-engine"),
  GITHUB_APP_CLIENT_ID: z.string().optional(),
  GITHUB_APP_CLIENT_SECRET: z.string().optional(),
  GITHUB_APP_PRIVATE_KEY_BASE64: z.string().optional(),
  GITHUB_APP_WEBHOOK_SECRET: z.string().optional(),
  GITHUB_STATE_SIGNING_SECRET: z
    .string()
    .min(16)
    .default("volt-default-github-state-signing-secret-key"),

  GCP_PROJECT_ID: z.string().optional(),
  GCP_LOCATION: z.string().default("asia-south1"),
  GCP_CLOUD_TASKS_QUEUE: z.string().default("volt-evaluation-queue"),
  GCP_SERVICE_ACCOUNT_EMAIL: z.string().optional(),
  INTERNAL_TASK_SHARED_SECRET: z
    .string()
    .min(16)
    .default("volt-internal-task-shared-secret-key-32b"),

  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_WEBHOOK_SECRET: z.string().optional(),
});

export function parseEnv(
  rawEnv: Readonly<Record<string, string | undefined>>
): z.infer<typeof EnvSchema> {
  return EnvSchema.parse(rawEnv);
}
