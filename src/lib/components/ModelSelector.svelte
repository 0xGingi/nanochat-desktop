<script lang="ts">
  import { modelsStore, selectedModel } from '../stores/models';
  import type { UserModel } from '../api/types';

  let isOpen = false;
  let containerElement: HTMLElement;
  let showFavoritesOnly = false;

  function toggleDropdown() {
    isOpen = !isOpen;
  }

  function selectModel(modelId: string) {
    modelsStore.selectModel(modelId);
    isOpen = false;
  }

  function closeDropdown() {
    isOpen = false;
  }

  function toggleFavoritesFilter() {
    showFavoritesOnly = !showFavoritesOnly;
  }

  // Close dropdown when clicking outside
  function handleClickOutside(event: MouseEvent) {
    if (containerElement && !containerElement.contains(event.target as Node)) {
      closeDropdown();
    }
  }

  // Format model ID for display (e.g., "openai/gpt-4" -> "gpt-4")
  function formatModelId(modelId: string): string {
    const parts = modelId.split('/');
    return parts[parts.length - 1];
  }

  // Get provider name (e.g., "openai/gpt-4" -> "OpenAI")
  function getProviderName(modelId: string): string {
    const provider = modelId.split('/')[0];
    return provider.charAt(0).toUpperCase() + provider.slice(1);
  }

  // Sort and filter models: pinned first, then alphabetically
  function getSortedAndFilteredModels(models: UserModel[], favoritesOnly: boolean): UserModel[] {
    let filtered = favoritesOnly ? models.filter(m => m.pinned) : models;
    
    return filtered.sort((a, b) => {
      // Pinned models first
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      
      // Then sort alphabetically by formatted model ID
      const aName = formatModelId(a.modelId);
      const bName = formatModelId(b.modelId);
      return aName.localeCompare(bName);
    });
  }

  // Reactive statement to get sorted/filtered models
  $: displayModels = getSortedAndFilteredModels($modelsStore.models, showFavoritesOnly);
  $: pinnedCount = $modelsStore.models.filter(m => m.pinned).length;
</script>

<svelte:window on:click={handleClickOutside} />

<div class="model-selector" bind:this={containerElement}>
  <button
    class="model-selector-button"
    on:click={toggleDropdown}
    disabled={$modelsStore.loading || $modelsStore.models.length === 0}
    title="Select AI model"
  >
    {#if $modelsStore.loading}
      <span class="spinner-small"></span>
      <span>Loading models...</span>
    {:else if $selectedModel}
      <span class="model-icon">🤖</span>
      <span class="model-name">{formatModelId($selectedModel.modelId)}</span>
      <span class="provider-badge">{getProviderName($selectedModel.modelId)}</span>
      <svg class="dropdown-arrow" class:open={isOpen} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    {:else}
      <span class="model-icon">⚠️</span>
      <span class="model-name">No models available</span>
    {/if}
  </button>

  {#if isOpen && $modelsStore.models.length > 0}
    <div class="model-dropdown">
      <div class="dropdown-header">
        <span class="dropdown-title">Select Model</span>
        <button 
          class="favorites-toggle"
          class:active={showFavoritesOnly}
          on:click={toggleFavoritesFilter}
          title={showFavoritesOnly ? "Show all models" : "Show favorites only"}
        >
          <span class="toggle-icon">📌</span>
          <span class="toggle-text">{showFavoritesOnly ? 'Favorites' : 'All'}</span>
          {#if pinnedCount > 0}
            <span class="toggle-count">({showFavoritesOnly ? pinnedCount : $modelsStore.models.length})</span>
          {/if}
        </button>
      </div>
      <div class="dropdown-content">
        {#each displayModels as model (model.modelId)}
          <button
            class="model-option"
            class:selected={$modelsStore.selectedModelId === model.modelId}
            on:click={() => selectModel(model.modelId)}
          >
            <div class="model-option-info">
              <span class="model-option-name">{formatModelId(model.modelId)}</span>
              <span class="model-option-provider">{getProviderName(model.modelId)}</span>
            </div>
            {#if model.pinned}
              <span class="pinned-badge" title="Pinned model">📌</span>
            {/if}
            {#if $modelsStore.selectedModelId === model.modelId}
              <svg class="check-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            {/if}
          </button>
        {/each}
      </div>
    </div>
  {/if}

  {#if $modelsStore.error}
    <div class="model-selector-error">
      <span class="error-icon">⚠️</span>
      <span>{$modelsStore.error}</span>
    </div>
  {/if}
</div>

<style>
  .model-selector {
    position: relative;
    display: inline-block;
  }

  .model-selector-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    font-size: 0.875rem;
    color: var(--color-text);
    cursor: pointer;
    transition: all var(--transition-fast);
    max-width: 280px;
    outline: none;
  }

  .model-selector-button:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  .model-selector-button:hover:not(:disabled) {
    background: var(--color-bg-hover);
    border-color: var(--color-accent);
  }

  .model-selector-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .model-icon {
    font-size: 1rem;
    flex-shrink: 0;
  }

  .model-name {
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .provider-badge {
    padding: 0.125rem 0.375rem;
    background: var(--color-bg-hover);
    border-radius: 0.25rem;
    font-size: 0.6875rem;
    color: var(--color-text-secondary);
    flex-shrink: 0;
  }

  .dropdown-arrow {
    flex-shrink: 0;
    transition: transform var(--transition-fast);
  }

  .dropdown-arrow.open {
    transform: rotate(180deg);
  }

  .spinner-small {
    width: 14px;
    height: 14px;
    border: 2px solid var(--color-border);
    border-top-color: var(--color-accent);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    flex-shrink: 0;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .model-dropdown {
    position: absolute;
    top: calc(100% + 0.5rem);
    left: 0;
    right: 0;
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    z-index: 100;
    max-height: 300px;
    display: flex;
    flex-direction: column;
  }

  .dropdown-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--color-border);
    gap: 0.5rem;
  }

  .dropdown-title {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .favorites-toggle {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.25rem 0.5rem;
    background: transparent;
    border: 1px solid var(--color-border);
    border-radius: 0.375rem;
    font-size: 0.75rem;
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: all var(--transition-fast);
    outline: none;
  }

  .favorites-toggle:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  .favorites-toggle:hover {
    background: var(--color-bg-hover);
    border-color: var(--color-accent);
    color: var(--color-text);
  }

  .favorites-toggle.active {
    background: var(--color-accent);
    border-color: var(--color-accent);
    color: white;
  }

  .toggle-icon {
    font-size: 0.75rem;
  }

  .toggle-text {
    font-weight: 500;
  }

  .toggle-count {
    opacity: 0.8;
    font-size: 0.6875rem;
  }

  .dropdown-content {
    overflow-y: auto;
    padding: 0.5rem;
  }

  .model-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.625rem 0.75rem;
    background: transparent;
    border: none;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: background var(--transition-fast);
    width: 100%;
    text-align: left;
    outline: none;
  }

  .model-option:focus-visible {
    background: var(--color-bg-hover);
    box-shadow: inset 0 0 0 2px var(--color-accent);
  }

  .model-option:hover {
    background: var(--color-bg-hover);
  }

  .model-option.selected {
    background: var(--color-bg-selected);
  }

  .model-option-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .model-option-name {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .model-option-provider {
    font-size: 0.75rem;
    color: var(--color-text-secondary);
  }

  .pinned-badge {
    font-size: 0.75rem;
    flex-shrink: 0;
  }

  .check-icon {
    flex-shrink: 0;
    color: var(--color-accent);
  }

  .model-selector-error {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.5rem 0.75rem;
    background: var(--color-danger-bg);
    border: 1px solid var(--color-danger);
    border-radius: 0.5rem;
    font-size: 0.8125rem;
    color: var(--color-danger);
    margin-top: 0.5rem;
  }

  .error-icon {
    flex-shrink: 0;
  }

  /* Custom scrollbar for dropdown */
  .dropdown-content::-webkit-scrollbar {
    width: 6px;
  }

  .dropdown-content::-webkit-scrollbar-track {
    background: transparent;
  }

  .dropdown-content::-webkit-scrollbar-thumb {
    background: var(--color-border);
    border-radius: 3px;
  }

  .dropdown-content::-webkit-scrollbar-thumb:hover {
    background: #444;
  }
</style>
