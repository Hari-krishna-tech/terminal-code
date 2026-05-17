use tauri::AppHandle;
use tauri_plugin_store::StoreExt;

#[tauri::command]
pub async fn store_token(app: AppHandle, key: String, value: String) -> Result<(), String> {
    let store = app.store("auth.json").map_err(|e| e.to_string())?;
    store.set(key, serde_json::Value::String(value));
    store.save().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_token(app: AppHandle, key: String) -> Result<Option<String>, String> {
    let store = app.store("auth.json").map_err(|e| e.to_string())?;
    Ok(store.get(&key).and_then(|v| v.as_str().map(String::from)))
}

#[tauri::command]
pub async fn clear_tokens(app: AppHandle) -> Result<(), String> {
    let store = app.store("auth.json").map_err(|e| e.to_string())?;
    store.clear();
    store.save().map_err(|e| e.to_string())
}
