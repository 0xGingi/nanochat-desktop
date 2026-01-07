// Message API functions
import { apiRequest } from './client';
import type { Message, GenerateMessageRequest, GenerateMessageResponse } from './types';

/**
 * Get all messages for a conversation
 * @param conversationId - Conversation ID
 */
export async function getMessages(conversationId: string): Promise<Message[]> {
    return apiRequest<Message[]>(`/api/db/messages?conversationId=${conversationId}`, {
        method: 'GET',
    });
}

/**
 * Generate an AI response
 * @param request - Generation request parameters
 */
export async function generateMessage(
    request: GenerateMessageRequest
): Promise<GenerateMessageResponse> {
    return apiRequest<GenerateMessageResponse>('/api/generate-message', {
        method: 'POST',
        body: JSON.stringify(request),
    });
}

/**
 * Create a message manually (without AI generation)
 * @param conversationId - Conversation ID
 * @param content - Message content
 * @param role - Message role
 */
export async function createMessage(
    conversationId: string,
    content: string,
    role: 'user' | 'assistant' = 'user'
): Promise<Message> {
    return apiRequest<Message>('/api/db/messages', {
        method: 'POST',
        body: JSON.stringify({
            action: 'create',
            conversationId,
            content,
            contentHtml: content,
            role,
        }),
    });
}

/**
 * Cancel an active message generation
 * @param conversationId - Conversation ID
 */
export async function cancelGeneration(conversationId: string): Promise<void> {
    await apiRequest<{ ok: boolean; cancelled: boolean }>('/api/cancel-generation', {
        method: 'POST',
        body: JSON.stringify({
            conversation_id: conversationId,
            session_token: '', // Desktop app uses API key auth, token not needed
        }),
    });
}
