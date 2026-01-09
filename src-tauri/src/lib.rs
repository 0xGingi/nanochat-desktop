mod config;

use config::Config;

#[tauri::command]
fn get_config() -> Result<Config, String> {
    Config::load()
}

#[tauri::command]
fn save_config(config: Config) -> Result<(), String> {
    config.save()
}

#[tauri::command]
async fn validate_connection(server_url: String, api_key: String) -> Result<bool, String> {
    // Test connection by fetching user settings
    // This is a lightweight authenticated endpoint
    let client = reqwest::Client::new();
    let url = format!("{}/api/db/user-settings", server_url.trim_end_matches('/'));
    
    let response = client
        .get(&url)
        .header("Authorization", format!("Bearer {}", api_key))
        .header("Content-Type", "application/json")
        .send()
        .await
        .map_err(|e| format!("Connection failed: {}", e))?;

    let status = response.status();
    
    if status.is_success() {
        Ok(true)
    } else if status == 401 {
        Err("Invalid API key or unauthorized".to_string())
    } else if status == 404 {
        Err("API endpoint not found. Please check your server URL".to_string())
    } else {
        Err(format!("API returned error: {} - {}", status, status.canonical_reason().unwrap_or("Unknown")))
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
        get_config,
        save_config,
        validate_connection
    ])
    .plugin(tauri_plugin_http::init())
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
