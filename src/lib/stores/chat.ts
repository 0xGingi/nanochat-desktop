import { writable, derived } from 'svelte/store';
import type { Message, Role } from '../api/types';
import * as messagesApi from '../api/messages';
import * as conversationsApi from '../api/conversations';
import { conversationsStore } from './conversations';
import { get } from 'svelte/store';

// Callback type for when a new conversation is created
export type NewConversationCallback = (conversationId: string) => void;

interface ChatState {
    conversationId: string | null;
    messages: Message[];
    loading: boolean;
    generating: boolean;
    error: string | null;
    onNewConversation?: NewConversationCallback;
    initializing: boolean;  // Flag to prevent reactive reload during new conversation creation
}

const initialState: ChatState = {
    conversationId: null,
    messages: [],
    loading: false,
    generating: false,
    error: null,
    initializing: false,
};

function createChatStore() {
    const { subscribe, set, update } = writable<ChatState>(initialState);

    // Polling interval reference
    let pollInterval: ReturnType<typeof setInterval> | null = null;

    return {
        subscribe,

        setNewConversationCallback(callback: NewConversationCallback) {
            update(state => ({ ...state, onNewConversation: callback }));
        },

        setConversation(conversationId: string | null) {
            const currentState = get({ subscribe });

            // Skip reload if we're initializing a new conversation (callback is handling it)
            if (currentState.initializing && conversationId === currentState.conversationId) {
                return;
            }

            // Clear any existing polling
            if (pollInterval) {
                clearInterval(pollInterval);
                pollInterval = null;
            }

            update(state => ({
                ...state,
                conversationId,
                messages: [],
                loading: false,
                generating: false,
                error: null,
                initializing: false,  // Clear initializing flag when conversation is set
            }));

            // Load messages if we have a conversation
            if (conversationId) {
                this.loadMessages(conversationId);
            }
        },

        async loadMessages(conversationId: string) {
            update(state => ({ ...state, loading: true, error: null }));

            try {
                const messages = await messagesApi.getMessages(conversationId);
                update(state => ({
                    ...state,
                    conversationId,
                    messages,
                    loading: false,
                }));
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to load messages';
                update(state => ({
                    ...state,
                    loading: false,
                    error: errorMessage
                }));
                throw error;
            }
        },

        async sendMessage(content: string, modelId: string) {
            const state = get({ subscribe });
            let conversationId = state.conversationId;

            // Clear any existing polling
            if (pollInterval) {
                clearInterval(pollInterval);
                pollInterval = null;
            }

            update(state => ({
                ...state,
                generating: true,
                error: null,
            }));

            try {
                // If no conversation exists, use generateMessage to create everything in one call
                // The generate-message endpoint handles: conversation creation, user message, AI response, and title generation
                if (!conversationId) {
                    console.log('[Chat] No conversation - using generateMessage to create new conversation');

                    // generateMessage with no conversation_id will create a new conversation
                    const result = await messagesApi.generateMessage({
                        message: content,
                        model_id: modelId,
                    });

                    console.log('[Chat] generateMessage response:', JSON.stringify(result, null, 2));
                    conversationId = result.conversation_id;

                    // Set initializing flag BEFORE setting conversationId to prevent reactive reload
                    update(state => ({
                        ...state,
                        initializing: true,
                        conversationId,
                    }));

                    // Notify callback that a new conversation was created
                    const currentState = get({ subscribe });
                    if (currentState.onNewConversation) {
                        currentState.onNewConversation(conversationId);
                    }

                    // Get initial messages after creating conversation and update state
                    const messages = await messagesApi.getMessages(conversationId);

                    // Update state with initial messages so user can see their message
                    update(state => ({
                        ...state,
                        messages,
                    }));

                    // Start polling for AI response (server already started generation)
                    this.startPolling(conversationId);
                } else {
                    // Generate AI response (this creates the user message on the server)
                    await messagesApi.generateMessage({
                        message: content,
                        model_id: modelId,
                        conversation_id: conversationId,
                    });

                    // Start polling for AI response
                    this.startPolling(conversationId);
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
                update(state => ({
                    ...state,
                    generating: false,
                    error: errorMessage
                }));
                throw error;
            }
        },

        startPolling(conversationId: string) {
            // Clear any existing interval
            if (pollInterval) {
                clearInterval(pollInterval);
            }

            console.log('[Chat] Starting polling for conversation:', conversationId);

            let pollCount = 0;
            const maxPolls = 180; // Maximum 90 seconds of polling (180 * 500ms)

            // Poll every 500ms
            pollInterval = setInterval(async () => {
                pollCount++;

                try {
                    // Fetch both messages and conversation state in parallel
                    const [messages, conversation] = await Promise.all([
                        messagesApi.getMessages(conversationId),
                        conversationsApi.getConversation(conversationId).catch(err => {
                            console.warn('[Chat] Conversation not yet available, will retry:', err.message);
                            return null;  // Return null if conversation fetch fails
                        })
                    ]);

                    const assistantMessages = messages.filter(m => m.role === 'assistant');
                    const lastAssistantMessage = assistantMessages[assistantMessages.length - 1];
                    const hasContent = lastAssistantMessage && (lastAssistantMessage.content || lastAssistantMessage.contentHtml);

                    console.log(`[Chat] Poll #${pollCount}: Total ${messages.length}, Assistant ${assistantMessages.length}, Generating: ${conversation?.generating ?? 'unknown'}, Title: "${conversation?.title ?? 'New Chat'}"`);
                    console.log(`[Chat] Last assistant message:`, lastAssistantMessage ? {
                        id: lastAssistantMessage.id,
                        hasContent: !!lastAssistantMessage.content,
                        hasHtml: !!lastAssistantMessage.contentHtml,
                        contentLength: lastAssistantMessage.content?.length || 0
                    } : 'None');

                    // Update chat state with latest messages
                    update(state => ({
                        ...state,
                        messages,
                    }));

                    // Update the sidebar with the latest conversation metadata (title, generating status)
                    // Only update if we successfully fetched the conversation
                    if (conversation) {
                        conversationsStore.updateConversation(conversation);
                    }

                    // Stop polling conditions:
                    // 1. Server explicitly says generation is complete
                    // 2. Last assistant message has content (message is done streaming)
                    // 3. Max polls reached (safety timeout)
                    const shouldStop = (conversation && !conversation.generating) ||
                                      hasContent ||
                                      pollCount >= maxPolls;

                    if (shouldStop) {
                        if (pollCount >= maxPolls) {
                            console.warn('[Chat] Stopping polling - max attempts reached');
                        } else if (conversation && !conversation.generating) {
                            console.log('[Chat] Server finished generation (generating=false). Stopping polling.');
                        } else if (hasContent) {
                            console.log('[Chat] Assistant message with content detected. Stopping polling.');
                        }

                        update(state => ({ ...state, generating: false, initializing: false }));

                        if (pollInterval) {
                            clearInterval(pollInterval);
                            pollInterval = null;
                        }

                        // Final refresh of the whole list just to be safe and ensure everything is consistent
                        conversationsStore.loadConversations();
                        return;
                    }
                } catch (error) {
                    console.error('[Chat] Polling error:', error);
                    // Don't stop polling on transient errors, but log them
                }
            }, 500);
        },

        stopPolling() {
            if (pollInterval) {
                clearInterval(pollInterval);
                pollInterval = null;
            }
            update(state => ({ ...state, generating: false }));
        },

        clearError() {
            update(state => ({ ...state, error: null }));
        },

        setError(message: string) {
            update(state => ({ ...state, error: message }));
        },

        reset() {
            if (pollInterval) {
                clearInterval(pollInterval);
                pollInterval = null;
            }
            set(initialState);
        },

        // Method to manually clear the initializing flag (e.g., if callback fails)
        clearInitializing() {
            update(state => ({ ...state, initializing: false }));
        }
    };
}

export const chatStore = createChatStore();

// Derived store for checking if we can send messages
export const canSendMessage = derived(
    chatStore,
    $store => $store.conversationId !== null && !$store.generating
);
