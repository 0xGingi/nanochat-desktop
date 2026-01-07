// Conversation API functions
import { apiRequest } from './client';
import type { Conversation } from './types';

/**
 * List all conversations for the user
 * @param projectId - Optional project ID to filter by (use 'null' string for non-project conversations)
 */
export async function listConversations(projectId?: string): Promise<Conversation[]> {
    const params = new URLSearchParams();
    if (projectId !== undefined) {
        params.set('projectId', projectId);
    }

    const query = params.toString();
    const endpoint = `/api/db/conversations${query ? `?${query}` : ''}`;

    return apiRequest<Conversation[]>(endpoint, {
        method: 'GET',
    });
}

/**
 * Get a specific conversation by ID
 * @param id - Conversation ID
 */
export async function getConversation(id: string): Promise<Conversation> {
    return apiRequest<Conversation>(`/api/db/conversations?id=${id}`, {
        method: 'GET',
    });
}

/**
 * Create a new empty conversation
 * @param title - Conversation title
 * @param projectId - Optional project ID
 */
export async function createConversation(
    title: string,
    projectId?: string
): Promise<Conversation> {
    return apiRequest<Conversation>('/api/db/conversations', {
        method: 'POST',
        body: JSON.stringify({
            action: 'create',
            title,
            projectId,
        }),
    });
}

/**
 * Create a conversation with an initial message
 * @param content - Message content
 * @param projectId - Optional project ID
 */
export async function createConversationWithMessage(
    content: string,
    projectId?: string
): Promise<Conversation> {
    return apiRequest<Conversation>('/api/db/conversations', {
        method: 'POST',
        body: JSON.stringify({
            action: 'createWithMessage',
            content,
            contentHtml: content, // Simple text for now
            role: 'user',
            projectId,
        }),
    });
}

/**
 * Update conversation title
 * @param conversationId - Conversation ID
 * @param title - New title
 */
export async function updateTitle(
    conversationId: string,
    title: string
): Promise<void> {
    await apiRequest<void>('/api/db/conversations', {
        method: 'POST',
        body: JSON.stringify({
            action: 'updateTitle',
            conversationId,
            title,
        }),
    });
}

/**
 * Toggle conversation pin status
 * @param conversationId - Conversation ID
 */
export async function togglePin(conversationId: string): Promise<void> {
    await apiRequest<void>('/api/db/conversations', {
        method: 'POST',
        body: JSON.stringify({
            action: 'togglePin',
            conversationId,
        }),
    });
}

/**
 * Delete a conversation
 * @param id - Conversation ID
 */
export async function deleteConversation(id: string): Promise<void> {
    await apiRequest<void>(`/api/db/conversations?id=${id}`, {
        method: 'DELETE',
    });
}

/**
 * Delete all conversations for the user
 */
export async function deleteAllConversations(): Promise<void> {
    await apiRequest<void>('/api/db/conversations?all=true', {
        method: 'DELETE',
    });
}
