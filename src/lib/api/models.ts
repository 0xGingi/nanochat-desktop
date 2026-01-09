import { apiRequest } from "./client";
import type { UserModel } from "./types";

export async function getUserModels(): Promise<UserModel[]> {
    return apiRequest<UserModel[]>("/api/db/user-models");
}

export async function toggleModelEnabled(
    provider: string,
    modelId: string,
    enabled: boolean
): Promise<void> {
    return apiRequest<void>("/api/db/user-models", {
        method: "POST",
        body: JSON.stringify({
            action: "set",
            provider,
            modelId,
            enabled,
        }),
    });
}
