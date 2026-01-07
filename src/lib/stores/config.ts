import { invoke } from "@tauri-apps/api/core";

export interface Config {
    server_url: string;
    api_key: string;
}

export async function getConfig(): Promise<Config> {
    return await invoke<Config>("get_config");
}

export async function saveConfig(config: Config): Promise<void> {
    return await invoke<void>("save_config", { config });
}

export async function validateConnection(
    serverUrl: string,
    apiKey: string
): Promise<boolean> {
    return await invoke<boolean>("validate_connection", {
        serverUrl,
        apiKey,
    });
}
