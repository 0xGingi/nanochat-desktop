import { writable, derived } from 'svelte/store';
import type { Conversation } from '../api/types';
import * as conversationsApi from '../api/conversations';

interface ConversationsState {
    conversations: Conversation[];
    selectedConversationId: string | null;
    loading: boolean;
    error: string | null;
}

const initialState: ConversationsState = {
    conversations: [],
    selectedConversationId: null,
    loading: false,
    error: null,
};

function createConversationsStore() {
    const { subscribe, set, update } = writable<ConversationsState>(initialState);

    return {
        subscribe,

        async loadConversations() {
            update(state => ({ ...state, loading: true, error: null }));

            try {
                const conversations = await conversationsApi.getConversations();
                update(state => ({
                    ...state,
                    conversations,
                    loading: false
                }));
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to load conversations';
                update(state => ({
                    ...state,
                    loading: false,
                    error: errorMessage
                }));
            }
        },

        async deleteConversation(conversationId: string) {
            try {
                await conversationsApi.deleteConversation(conversationId);

                update(state => ({
                    ...state,
                    conversations: state.conversations.filter(c => c.id !== conversationId),
                    selectedConversationId: state.selectedConversationId === conversationId
                        ? null
                        : state.selectedConversationId
                }));
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to delete conversation';
                update(state => ({ ...state, error: errorMessage }));
                throw error;
            }
        },

        selectConversation(conversationId: string | null) {
            update(state => ({ ...state, selectedConversationId: conversationId }));
        },

        clearError() {
            update(state => ({ ...state, error: null }));
        },

        reset() {
            set(initialState);
        }
    };
}

export const conversationsStore = createConversationsStore();

// Derived store for selected conversation
export const selectedConversation = derived(
    conversationsStore,
    $store => $store.conversations.find(c => c.id === $store.selectedConversationId) || null
);
