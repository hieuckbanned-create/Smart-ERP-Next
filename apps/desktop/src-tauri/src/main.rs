// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{CustomMenuItem, Menu, MenuItem, Submenu};

fn main() {
    // File menu
    let file_menu = Submenu::new(
        "File",
        Menu::new()
            .add_item(CustomMenuItem::new("new".to_string(), "New").accelerator("CmdOrCtrl+N"))
            .add_item(CustomMenuItem::new("open".to_string(), "Open...").accelerator("CmdOrCtrl+O"))
            .add_item(CustomMenuItem::new("save".to_string(), "Save").accelerator("CmdOrCtrl+S"))
            .add_native_item(MenuItem::Separator)
            .add_item(CustomMenuItem::new("export_pdf".to_string(), "Export PDF").accelerator("CmdOrCtrl+P"))
            .add_native_item(MenuItem::Separator)
            .add_native_item(MenuItem::Quit),
    );

    // Edit menu
    let edit_menu = Submenu::new(
        "Edit",
        Menu::new()
            .add_native_item(MenuItem::Undo)
            .add_native_item(MenuItem::Redo)
            .add_native_item(MenuItem::Separator)
            .add_native_item(MenuItem::Cut)
            .add_native_item(MenuItem::Copy)
            .add_native_item(MenuItem::Paste)
            .add_native_item(MenuItem::Separator)
            .add_native_item(MenuItem::SelectAll),
    );

    // View menu
    let view_menu = Submenu::new(
        "View",
        Menu::new()
            .add_item(CustomMenuItem::new("reload".to_string(), "Reload").accelerator("CmdOrCtrl+R"))
            .add_item(CustomMenuItem::new("devtools".to_string(), "Toggle Developer Tools").accelerator("CmdOrCtrl+Shift+I")),
    );

    let menu = Menu::new()
        .add_submenu(file_menu)
        .add_submenu(edit_menu)
        .add_submenu(view_menu);

    tauri::Builder::default()
        .menu(menu)
        .on_menu_event(|event| match event.menu_item_id() {
            "new" => println!("New file triggered"),
            "open" => println!("Open file triggered"),
            "save" => println!("Save file triggered"),
            "export_pdf" => println!("Export PDF triggered"),
            "reload" => {
                // Reload the webview
                if let Some(window) = event.window() {
                    let _ = window.eval("window.location.reload();");
                }
            }
            "devtools" => {
                if let Some(window) = event.window() {
                    window.open_devtools();
                }
            }
            _ => {}
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
