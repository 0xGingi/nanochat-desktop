import { apiRequest } from "./client";
import type { UserModel, ModelProvider } from "./types";

export async function getUserModels(provider?: string): Promise<UserModel[]> {
    const params = provider ? `?provider=${provider}` : "";
    return apiRequest<UserModel[]>(`/api/db/user-models${params}`);
}

export async function setModelEnabled(
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

export async function toggleModelPinned(provider: string, modelId: string): Promise<void> {
    return apiRequest<void>("/api/db/user-models", {
        method: "POST",
        body: JSON.stringify({
            action: "togglePinned",
            provider,
            modelId,
        }),
    });
}

export async function getModelProviders(modelId: string): Promise<ModelProvider> {
    return apiRequest<ModelProvider>(`/api/model-providers?modelId=${modelId}`);
}

