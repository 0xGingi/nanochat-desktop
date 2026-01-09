import { apiRequest } from "./client";
import type { ApiKey, ApiKeyCreateResponse } from "./types";

export async function listApiKeys(): Promise<{ keys: ApiKey[] }> {
    return apiRequest<{ keys: ApiKey[] }>("/api/api-keys");
}

export async function createApiKey(name: string): Promise<ApiKeyCreateResponse> {
    return apiRequest<ApiKeyCreateResponse>("/api/api-keys", {
        method: "POST",
        body: JSON.stringify({ name }),
    });
}

export async function deleteApiKey(id: string): Promise<{ success: boolean }> {
    return apiRequest<{ success: boolean }>("/api/api-keys", {
        method: "DELETE",
        body: JSON.stringify({ id }),
    });
}
