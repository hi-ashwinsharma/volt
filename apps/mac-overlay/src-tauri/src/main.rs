#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::env;
use volt_mac_overlay_lib::{stage_micro_log_fast, GLOBAL_HOTKEY_ACCELERATOR};

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() >= 3 && args[1] == "--stage" {
        let raw_text = &args[2];
        let id = format!("ovl-{}", std::process::id());
        match stage_micro_log_fast(&id, raw_text, None, "2026-10-16T12:00:00.000Z") {
            Ok(res) => {
                if let Ok(json) = serde_json::to_string(&res) {
                    println!("{}", json);
                }
            }
            Err(err) => {
                eprintln!("[VOLT OVERLAY ERROR] {}", err);
                std::process::exit(1);
            }
        }
        return;
    }

    println!(
        "[VOLT] macOS Spotlight Overlay Active ({})",
        GLOBAL_HOTKEY_ACCELERATOR
    );
}
