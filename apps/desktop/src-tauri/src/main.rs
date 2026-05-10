// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

#[tauri::command]
fn get_app_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

#[tauri::command]
fn get_platform() -> String {
    std::env::consts::OS.to_string()
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let window = app.get_window("main").unwrap();
            // Set minimum window size
            window.set_min_size(Some(tauri::Size::Logical(tauri::LogicalSize {
                width: 1024.0,
                height: 600.0,
            }))).unwrap();
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![get_app_version, get_platform])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
