import {
  closeDbConnection,
  runDatabaseMigrations,
  seedInitialWorkspace,
} from "@volt/db";
import { writeLocalVoltConfig } from "../local-store/sqlite-queue";

export async function runInfraSetupCommand(): Promise<void> {
  console.log("=== VOLT CLOUD-NATIVE INFRASTRUCTURE PROVISIONING ===");

  const dbUrl = process.env["DATABASE_URL"];
  if (!dbUrl || dbUrl.includes("postgres.projectref:password")) {
    console.log(
      "[WARN] Live DATABASE_URL is not yet configured in .env (currently using template value)."
    );
    console.log(
      "To provision against your live Supabase PostgreSQL 16 instance, set DATABASE_URL in .env and re-run `bun run infra:setup`."
    );
    return;
  }

  console.log("[1/4] Applying PostgreSQL 16 DDL migrations & score_audits immutability trigger...");
  await runDatabaseMigrations(dbUrl);
  console.log("      -> Schema and triggers verified.");

  console.log("[2/4] Seeding canonical PBAC Policy Groups, active billing cycle & bootstrap admin...");
  const seeded = await seedInitialWorkspace({ createInitialApiKey: true });
  console.log(`      -> Seeded admin @${seeded.adminHandle} (${seeded.adminUserId}).`);

  if (seeded.initialApiKey) {
    const apiUrl = process.env["API_PUBLIC_URL"] ?? "http://localhost:8080";
    writeLocalVoltConfig({
      apiUrl,
      apiKey: seeded.initialApiKey,
      userHandle: seeded.adminHandle,
      defaultDomain: "engineering",
      updatedAt: new Date().toISOString(),
    });
    console.log("[3/4] Wrote bootstrap Personal API Key to ~/.volt/config.json.");
  }

  const tgToken = process.env["TELEGRAM_BOT_TOKEN"];
  const tgSecret = process.env["TELEGRAM_WEBHOOK_SECRET"];
  const publicApiUrl = process.env["API_PUBLIC_URL"];
  if (
    tgToken &&
    !tgToken.includes("ExampleTelegramBotToken") &&
    publicApiUrl &&
    !publicApiUrl.includes("localhost")
  ) {
    console.log("[4/4] Registering Telegram Bot Webhook...");
    await fetch(`https://api.telegram.org/bot${tgToken}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: `${publicApiUrl}/v1/webhooks/telegram`,
        secret_token: tgSecret,
      }),
    });
    console.log("      -> Telegram webhook registered.");
  } else {
    console.log("[4/4] Skipping live Telegram webhook registration (localhost/template token).");
  }

  await closeDbConnection();
  console.log("=== INFRASTRUCTURE SETUP COMPLETE ===");
}

if (import.meta.main) {
  runInfraSetupCommand().catch(async (err: Error) => {
    console.error("[FATAL] infra:setup failed:", err.message);
    await closeDbConnection();
    process.exit(1);
  });
}
