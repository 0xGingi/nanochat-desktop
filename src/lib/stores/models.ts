import { writable, derived } from 'svelte/store';
import type { UserModel } from '../api/types';
import * as modelsApi from '../api/models';

interface ModelsState {
    models: UserModel[];
    selectedModelId: string | null;
    loading: boolean;
    error: string | null;
}

const initialState: ModelsState = {
    models: [],
    selectedModelId: null,
    loading: false,
    error: null,
};

function createModelsStore() {
    const { subscribe, set, update } = writable<ModelsState>(initialState);

    return {
        subscribe,

        async loadModels() {
            update(state => ({ ...state, loading: true, error: null }));

            try {
                const response = await modelsApi.getUserModels();

                console.log('[Models] Raw API response:', response);

                // The API returns an object with model IDs as keys, not an array
                // Convert the object to an array of models
                let models: UserModel[] = [];

                if (Array.isArray(response)) {
                    // If it's already an array (future API change), use as-is
                    models = response;
                } else if (response && typeof response === 'object') {
                    // Convert object to array of values
                    models = Object.values(response) as UserModel[];
                } else {
                    console.error('[Models] Unexpected API response format:', response);
                }

                console.log('[Models] Parsed models:', models);

                // Filter to only enabled models (models don't have an 'enabled' field in the response)
                // So we'll use all models for now
                const enabledModels = models;

                // Get the first enabled model, preferring pinned models
                const pinnedModel = enabledModels.find(m => m.pinned);
                const defaultModel = pinnedModel || enabledModels[0];

                console.log('[Models] Enabled models:', enabledModels.length, 'Default:', defaultModel?.modelId);

                update(state => ({
                    ...state,
                    models: enabledModels,
                    selectedModelId: defaultModel?.modelId || null,
                    loading: false,
                }));
            } catch (error) {
                console.error('[Models] Load error:', error);
                const errorMessage = error instanceof Error ? error.message : 'Failed to load models';
                update(state => ({
                    ...state,
                    loading: false,
                    error: errorMessage
                }));
                throw error;
            }
        },

        selectModel(modelId: string) {
            update(state => ({ ...state, selectedModelId: modelId }));
        },

        clearError() {
            update(state => ({ ...state, error: null }));
        },

        reset() {
            set(initialState);
        }
    };
}

export const modelsStore = createModelsStore();

// Derived store for the currently selected model
export const selectedModel = derived(
    modelsStore,
    $store => $store.models.find(m => m.modelId === $store.selectedModelId) || null
);
