// Model API functions
import { apiRequest } from './client';
import type { UserModel } from './types';

/**
 * Get all user models (enabled and disabled)
 */
export async function getUserModels(): Promise<UserModel[]> {
    return apiRequest<UserModel[]>('/api/db/user-models', {
        method: 'GET',
    });
}

/**
 * Get only enabled models
 */
export async function getEnabledModels(): Promise<UserModel[]> {
    const models = await getUserModels();
    return models.filter(model => model.enabled);
}

/**
 * Enable or disable a model
 * @param provider - Model provider
 * @param modelId - Model ID
 * @param enabled - Whether the model should be enabled
 */
export async function setModelEnabled(
    provider: string,
    modelId: string,
    enabled: boolean
): Promise<void> {
    await apiRequest<void>('/api/db/user-models', {
        method: 'POST',
        body: JSON.stringify({
            action: 'set',
            provider,
            modelId,
            enabled,
        }),
    });
}

/**
 * Toggle model pinned status
 * @param provider - Model provider
 * @param modelId - Model ID
 */
export async function toggleModelPinned(
    provider: string,
    modelId: string
): Promise<void> {
    await apiRequest<void>('/api/db/user-models', {
        method: 'POST',
        body: JSON.stringify({
            action: 'togglePinned',
            provider,
            modelId,
        }),
    });
}
