// Type definitions for NanoChat API

export interface Conversation {
    id: string;
    title: string;
    userId: string;
    projectId: string | null;
    pinned: boolean;
    generating: boolean;
    costUsd: number | null;
    createdAt: string;
    updatedAt: string;
}

export interface Message {
    id: string;
    conversationId: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    contentHtml: string | null;
    modelId: string | null;
    reasoning: string | null;
    images: Array<{
        url: string;
        storage_id?: string;
        fileName?: string;
    }> | null;
    documents: Array<{
        url: string;
        storage_id?: string;
        fileName?: string;
        fileType: 'pdf' | 'markdown' | 'text' | 'epub';
    }> | null;
    createdAt: string;
}

export interface UserModel {
    modelId: string;
    provider: string;
    enabled: boolean;
    pinned: boolean;
}

export interface GenerateMessageRequest {
    message?: string;
    model_id: string;
    assistant_id?: string;
    project_id?: string;
    conversation_id?: string;
    web_search_enabled?: boolean;
    web_search_mode?: 'off' | 'standard' | 'deep';
    web_search_provider?: 'linkup' | 'tavily' | 'exa' | 'kagi';
    images?: Array<{
        url: string;
        storage_id?: string;
        fileName?: string;
    }>;
    documents?: Array<{
        url: string;
        storage_id?: string;
        fileName?: string;
        fileType: 'pdf' | 'markdown' | 'text' | 'epub';
    }>;
    reasoning_effort?: 'low' | 'medium' | 'high';
    temporary?: boolean;
    provider_id?: string;
}

export interface GenerateMessageResponse {
    ok: boolean;
    conversation_id: string;
}

export interface ApiError {
    message: string;
    status?: number;
    type: 'network' | 'http' | 'parse' | 'unknown';
}
