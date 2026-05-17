use tauri::AppHandle;
use tauri::Emitter;
use tauri_plugin_shell::process::CommandChild;
use tauri_plugin_shell::ShellExt;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use serde::Serialize;

#[derive(Serialize, Clone)]
pub struct TerminalOutput {
    pub session_id: String,
    pub data: String,
}

pub struct TerminalManager {
    pub sessions: Arc<Mutex<HashMap<String, CommandChild>>>,
}

impl TerminalManager {
    pub fn new() -> Self {
        Self {
            sessions: Arc::new(Mutex::new(HashMap::new())),
        }
    }
}

#[tauri::command]
pub async fn create_terminal(
    app: AppHandle,
    state: tauri::State<'_, TerminalManager>,
    cwd: String,
) -> Result<String, String> {
    let shell = app.shell();

    let shell_cmd = std::env::var("SHELL").unwrap_or_else(|_| "/bin/bash".to_string());

    let session_id = uuid::Uuid::new_v4().to_string();

    let (mut rx, child) = shell
        .command(&shell_cmd)
        .args(["-i"])
        .current_dir(&cwd)
        .spawn()
        .map_err(|e| e.to_string())?;

    state.sessions.lock().unwrap().insert(session_id.clone(), child);

    let session_id_clone = session_id.clone();
    let app_clone = app.clone();
    let sessions_clone = state.sessions.clone();

    tauri::async_runtime::spawn(async move {
        use tauri_plugin_shell::process::CommandEvent;
        while let Some(event) = rx.recv().await {
            match event {
                CommandEvent::Stdout(line) => {
                    let _ = app_clone.emit("terminal-output", TerminalOutput {
                        session_id: session_id_clone.clone(),
                        data: String::from_utf8_lossy(&line).to_string(),
                    });
                }
                CommandEvent::Stderr(line) => {
                    let _ = app_clone.emit("terminal-output", TerminalOutput {
                        session_id: session_id_clone.clone(),
                        data: String::from_utf8_lossy(&line).to_string(),
                    });
                }
                CommandEvent::Terminated(_) | CommandEvent::Error(_) => {}
                _ => {}
            }
        }
        sessions_clone.lock().unwrap().remove(&session_id_clone);
        let _ = app_clone.emit("terminal-output", TerminalOutput {
            session_id: session_id_clone,
            data: "\r\n[Process exited]\r\n".to_string(),
        });
    });

    Ok(session_id)
}

#[tauri::command]
pub async fn write_terminal(
    state: tauri::State<'_, TerminalManager>,
    session_id: String,
    data: String,
) -> Result<(), String> {
    let mut sessions = state.sessions.lock().unwrap();
    let child = sessions.get_mut(&session_id).ok_or("session not found")?;
    child.write(data.as_bytes()).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn resize_terminal(
    _state: tauri::State<'_, TerminalManager>,
    _session_id: String,
    _cols: u16,
    _rows: u16,
) -> Result<(), String> {
    Ok(())
}

#[tauri::command]
pub async fn kill_terminal(
    state: tauri::State<'_, TerminalManager>,
    session_id: String,
) -> Result<(), String> {
    let mut sessions = state.sessions.lock().unwrap();
    if let Some(child) = sessions.remove(&session_id) {
        child.kill().map_err(|e| e.to_string())?;
    }
    Ok(())
}
