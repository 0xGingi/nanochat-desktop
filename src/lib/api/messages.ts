import { apiRequest } from "./client";
import type { Message, GenerateMessageRequest, GenerateMessageResponse } from "./types";

export async function getMessages(conversationId: string): Promise<Message[]> {
    return apiRequest<Message[]>(`/api/db/messages?conversationId=${conversationId}`);
}

export async function generateMessage(request: GenerateMessageRequest): Promise<GenerateMessageResponse> {
    return apiRequest<GenerateMessageResponse>("/api/generate-message", {
        method: "POST",
        body: JSON.stringify(request),
    });
}

export async function cancelGeneration(conversationId: string): Promise<void> {
    return apiRequest<void>("/api/cancel-generation", {
        method: "POST",
        body: JSON.stringify({ conversation_id: conversationId }),
    });
}
