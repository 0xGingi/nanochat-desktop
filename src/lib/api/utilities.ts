import { apiRequest } from "./client";
import type { EnhancePromptResponse, FollowUpQuestionsResponse, NanoGptBalance } from "./types";

export async function enhancePrompt(prompt: string): Promise<EnhancePromptResponse> {
    return apiRequest<EnhancePromptResponse>("/api/enhance-prompt", {
        method: "POST",
        body: JSON.stringify({ prompt }),
    });
}

export async function generateFollowUpQuestions(
    conversationId: string,
    messageId: string
): Promise<FollowUpQuestionsResponse> {
    return apiRequest<FollowUpQuestionsResponse>("/api/generate-follow-up-questions", {
        method: "POST",
        body: JSON.stringify({ conversationId, messageId }),
    });
}

export async function cleanupTempConversations(): Promise<{ ok: boolean }> {
    return apiRequest<{ ok: boolean }>("/api/cleanup-temp-conversations", {
        method: "POST",
    });
}

export async function getNanoGptBalance(): Promise<NanoGptBalance> {
    return apiRequest<NanoGptBalance>("/api/nano-gpt/balance", {
        method: "POST",
    });
}
