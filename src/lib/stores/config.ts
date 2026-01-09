import { invoke } from "@tauri-apps/api/core";
import { writable, get } from "svelte/store";

export interface Config {
    server_url: string;
    api_key: string;
}

const defaultConfig: Config = {
    server_url: "",
    api_key: ""
};

// Create a writable store for caching
export const configStore = writable<Config | null>(null);

export async function getConfig(): Promise<Config> {
    // Check cache first
    const current = get(configStore);
    if (current) {
        return current;
    }

    // Fetch from Rust if not cached
    const config = await invoke<Config>("get_config");
    configStore.set(config);
    return config;
}

export async function saveConfig(config: Config): Promise<void> {
    // Save to Rust backend first
    await invoke<void>("save_config", { config });
    // Update cache only on success
    configStore.set(config);
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
