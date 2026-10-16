use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use std::env;
use std::fs;
use std::path::PathBuf;
use std::time::Instant;

pub const GLOBAL_HOTKEY_ACCELERATOR: &str = "CommandOrControl+Shift+L";

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OverlayCaptureResult {
    pub client_log_id: String,
    pub raw_text: String,
    pub latency_ms: f64,
    pub total_pending_count: usize,
    pub flushed_to_cloud: bool,
}

pub fn resolve_volt_queue_db_path() -> PathBuf {
    if let Ok(custom) = env::var("VOLT_HOME_DIR") {
        let mut p = PathBuf::from(custom);
        let _ = fs::create_dir_all(&p);
        p.push("queue.sqlite");
        return p;
    }
    let home = env::var("HOME").unwrap_or_else(|_| ".".to_string());
    let mut dir = PathBuf::from(home);
    dir.push(".volt");
    let _ = fs::create_dir_all(&dir);
    dir.push("queue.sqlite");
    dir
}

pub fn init_queue_schema(conn: &Connection) -> Result<(), String> {
    conn.execute_batch(
        "PRAGMA journal_mode = WAL;
         PRAGMA synchronous = NORMAL;
         CREATE TABLE IF NOT EXISTS local_queue (
           id INTEGER PRIMARY KEY AUTOINCREMENT,
           client_log_id TEXT NOT NULL UNIQUE,
           raw_text TEXT NOT NULL,
           source TEXT NOT NULL DEFAULT 'mac_overlay',
           artifact_id TEXT,
           github_pr_url TEXT,
           created_at TEXT NOT NULL,
           synced INTEGER NOT NULL DEFAULT 0,
           synced_at TEXT
         );",
    )
    .map_err(|e| e.to_string())
}

pub fn stage_micro_log_fast(
    client_log_id: &str,
    raw_text: &str,
    github_pr_url: Option<&str>,
    created_at_iso: &str,
) -> Result<OverlayCaptureResult, String> {
    let started = Instant::now();
    let db_path = resolve_volt_queue_db_path();
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    init_queue_schema(&conn)?;

    let trimmed = raw_text.trim();
    conn.execute(
        "INSERT OR IGNORE INTO local_queue (client_log_id, raw_text, source, artifact_id, github_pr_url, created_at, synced)
         VALUES (?1, ?2, 'mac_overlay', NULL, ?3, ?4, 0)",
        params![client_log_id, trimmed, github_pr_url, created_at_iso],
    )
    .map_err(|e| e.to_string())?;

    let pending: usize = conn
        .query_row(
            "SELECT COUNT(*) FROM local_queue WHERE synced = 0",
            [],
            |row| row.get(0),
        )
        .unwrap_or(1);

    let elapsed_ms = started.elapsed().as_secs_f64() * 1000.0;

    Ok(OverlayCaptureResult {
        client_log_id: client_log_id.to_string(),
        raw_text: trimmed.to_string(),
        latency_ms: (elapsed_ms * 100.0).round() / 100.0,
        total_pending_count: pending,
        flushed_to_cloud: false,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn stages_micro_log_into_wal_sqlite_under_50ms() {
        env::set_var("VOLT_HOME_DIR", "/tmp/volt-rust-overlay-test");
        let res = stage_micro_log_fast(
            "019295f4-8c1a-7000-8000-999999999999",
            "Benchmarked Tauri native SQLite WAL bridge",
            Some("https://github.com/hi-ashwinsharma/volt/pull/18"),
            "2026-10-16T12:00:00.000Z",
        )
        .expect("Failed to stage micro-log");

        assert_eq!(res.raw_text, "Benchmarked Tauri native SQLite WAL bridge");
        assert!(res.total_pending_count >= 1);
        assert!(res.latency_ms < 50.0);
    }
}
