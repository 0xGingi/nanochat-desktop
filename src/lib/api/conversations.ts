import { apiRequest } from "./client";
import type { Conversation, Role, ImageAttachment } from "./types";

export async function getConversations(
    projectId: string | null = null,
    search?: string,
    mode: "exact" | "words" | "fuzzy" = "fuzzy"
): Promise<Conversation[]> {
    const params = new URLSearchParams();
    if (projectId) params.append("projectId", projectId);
    else params.append("projectId", "null"); // Explicitly fetch non-project conversations if null

    if (search) {
        params.append("search", search);
        params.append("mode", mode);
    }

    return apiRequest<Conversation[]>(`/api/db/conversations?${params.toString()}`);
}

export async function getConversation(id: string): Promise<Conversation> {
    const list = await apiRequest<Conversation[]>(`/api/db/conversations?id=${id}`);
    if (list.length === 0) {
        throw { message: "Conversation not found", status: 404 };
    }
    return list[0];
}

export async function deleteConversation(id: string): Promise<void> {
    return apiRequest<void>(`/api/db/conversations?id=${id}`, {
        method: "DELETE",
    });
}

export async function deleteAllConversations(): Promise<void> {
    return apiRequest<void>(`/api/db/conversations?all=true`, {
        method: "DELETE",
    });
}

export async function createConversation(title: string, projectId?: string): Promise<Conversation> {
    return apiRequest<Conversation>("/api/db/conversations", {
        method: "POST",
        body: JSON.stringify({
            action: "create",
            title,
            projectId,
        }),
    });
}

export async function createWithMessage(
    content: string,
    contentHtml: string,
    role: Role = "user",
    options?: {
        images?: ImageAttachment[];
        webSearchEnabled?: boolean;
        projectId?: string;
    }
): Promise<Conversation> {
    return apiRequest<Conversation>("/api/db/conversations", {
        method: "POST",
        body: JSON.stringify({
            action: "createWithMessage",
            content,
            contentHtml,
            role,
            ...options,
        }),
    });
}

export async function updateConversationTitle(id: string, title: string): Promise<Conversation> {
    return apiRequest<Conversation>("/api/db/conversations", {
        method: "POST",
        body: JSON.stringify({
            action: "updateTitle",
            conversationId: id,
            title,
        }),
    });
}

export async function toggleConversationPin(id: string): Promise<Conversation> {
    return apiRequest<Conversation>("/api/db/conversations", {
        method: "POST",
        body: JSON.stringify({
            action: "togglePin",
            conversationId: id,
        }),
    });
}

export async function setConversationPublic(id: string, isPublic: boolean): Promise<Conversation> {
    return apiRequest<Conversation>("/api/db/conversations", {
        method: "POST",
        body: JSON.stringify({
            action: "setPublic",
            conversationId: id,
            public: isPublic,
        }),
    });
}

export async function branchConversation(conversationId: string, fromMessageId: string): Promise<Conversation> {
    return apiRequest<Conversation>("/api/db/conversations", {
        method: "POST",
        body: JSON.stringify({
            action: "branch",
            conversationId,
            fromMessageId,
        }),
    });
}

