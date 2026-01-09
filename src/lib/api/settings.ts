import { apiRequest } from "./client";
import type { UserSettings } from "./types";

export async function getUserSettings(): Promise<UserSettings> {
    return apiRequest<UserSettings>("/api/db/user-settings");
}

export async function updateUserSettings(updates: {
    privacyMode?: boolean;
    contextMemoryEnabled?: boolean;
    persistentMemoryEnabled?: boolean;
    theme?: string | null;
}): Promise<UserSettings> {
    return apiRequest<UserSettings>("/api/db/user-settings", {
        method: "POST",
        body: JSON.stringify({
            action: "update",
            ...updates,
        }),
    });
}
