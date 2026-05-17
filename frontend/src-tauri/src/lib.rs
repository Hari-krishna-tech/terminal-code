mod commands;

use commands::{terminal, filesystem, auth_store};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_deep_link::init())
        .manage(terminal::TerminalManager::new())
        .invoke_handler(tauri::generate_handler![
            terminal::create_terminal,
            terminal::write_terminal,
            terminal::resize_terminal,
            terminal::kill_terminal,
            filesystem::read_directory,
            filesystem::read_file,
            filesystem::write_file,
            auth_store::store_token,
            auth_store::get_token,
            auth_store::clear_tokens,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
