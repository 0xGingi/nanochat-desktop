import { apiRequest } from "./client";
import type { Assistant, WebSearchMode, WebSearchProvider } from "./types";

export async function listAssistants(): Promise<Assistant[]> {
    return apiRequest<Assistant[]>("/api/assistants");
}

export async function createAssistant(
    name: string,
    systemPrompt: string,
    options?: {
        defaultModelId?: string;
        defaultWebSearchMode?: WebSearchMode;
        defaultWebSearchProvider?: WebSearchProvider;
    }
): Promise<Assistant> {
    return apiRequest<Assistant>("/api/assistants", {
        method: "POST",
        body: JSON.stringify({
            name,
            systemPrompt,
            ...options,
        }),
    });
}

export async function updateAssistant(
    id: string,
    updates: {
        name?: string;
        systemPrompt?: string;
        defaultModelId?: string | null;
        defaultWebSearchMode?: WebSearchMode;
    }
): Promise<Assistant> {
    return apiRequest<Assistant>(`/api/assistants/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
    });
}

export async function deleteAssistant(id: string): Promise<void> {
    return apiRequest<void>(`/api/assistants/${id}`, {
        method: "DELETE",
    });
}

export async function setDefaultAssistant(id: string): Promise<Assistant> {
    return apiRequest<Assistant>(`/api/assistants/${id}`, {
        method: "POST",
        body: JSON.stringify({ action: "setDefault" }),
    });
}
