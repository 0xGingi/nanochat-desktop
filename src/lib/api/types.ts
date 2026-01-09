export type Role = "user" | "assistant" | "system";
export type WebSearchMode = "off" | "standard" | "deep";
export type WebSearchProvider = "linkup" | "tavily" | "exa" | "kagi";
export type ReasoningEffort = "low" | "medium" | "high";
export type FileType = "pdf" | "markdown" | "text" | "epub";

export interface ImageAttachment {
    url: string;
    storage_id: string;
    fileName?: string;
}

export interface DocumentAttachment {
    url: string;
    storage_id: string;
    fileName?: string;
    fileType: FileType;
}

export interface GenerateMessageRequest {
    message?: string;
    model_id: string;
    assistant_id?: string;
    project_id?: string;
    session_token?: string;
    conversation_id?: string;
    web_search_enabled?: boolean;
    web_search_mode?: WebSearchMode;
    web_search_provider?: WebSearchProvider;
    images?: ImageAttachment[];
    documents?: DocumentAttachment[];
    reasoning_effort?: ReasoningEffort;
    temporary?: boolean;
    provider_id?: string;
}

export interface GenerateMessageResponse {
    ok: boolean;
    conversation_id: string;
}

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
    role: Role;
    content: string;
    contentHtml: string | null;
    modelId: string | null;
    reasoning: string | null;
    images: ImageAttachment[] | null;
    documents: DocumentAttachment[] | null;
    createdAt: string;
}

export interface UserModel {
    modelId: string;
    provider: string;
    enabled: boolean;
    pinned: boolean;
}

export interface ApiError {
    message: string;
    status: number;
}
