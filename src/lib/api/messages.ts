import { apiRequest } from "./client";
import type { Message, GenerateMessageRequest, GenerateMessageResponse, Role } from "./types";

export async function getMessages(conversationId: string): Promise<Message[]> {
    return apiRequest<Message[]>(`/api/db/messages?conversationId=${conversationId}&t=${Date.now()}`);
}

export async function getPublicMessages(conversationId: string): Promise<Message[]> {
    return apiRequest<Message[]>(`/api/db/messages?conversationId=${conversationId}&public=true`, {
        skipAuth: true,
    });
}

export async function createMessage(
    conversationId: string,
    role: Role,
    content: string,
    contentHtml?: string
): Promise<Message> {
    return apiRequest<Message>("/api/db/messages", {
        method: "POST",
        body: JSON.stringify({
            action: "create",
            conversationId,
            role,
            content,
            contentHtml,
        }),
    });
}

export async function updateMessageContent(
    messageId: string,
    content: string,
    contentHtml?: string
): Promise<Message> {
    return apiRequest<Message>("/api/db/messages", {
        method: "POST",
        body: JSON.stringify({
            action: "updateContent",
            messageId,
            content,
            contentHtml,
        }),
    });
}

export async function deleteMessage(messageId: string): Promise<void> {
    return apiRequest<void>("/api/db/messages", {
        method: "POST",
        body: JSON.stringify({
            action: "delete",
            messageId,
        }),
    });
}

export async function generateMessage(request: GenerateMessageRequest): Promise<GenerateMessageResponse> {
    return apiRequest<GenerateMessageResponse>("/api/generate-message", {
        method: "POST",
        body: JSON.stringify(request),
    });
}

export async function cancelGeneration(conversationId: string, sessionToken?: string): Promise<{ ok: boolean; cancelled: boolean }> {
    return apiRequest<{ ok: boolean; cancelled: boolean }>("/api/cancel-generation", {
        method: "POST",
        body: JSON.stringify({
            conversation_id: conversationId,
            session_token: sessionToken,
        }),
    });
}

