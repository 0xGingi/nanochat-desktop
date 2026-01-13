<script lang="ts">
  import { conversationsStore } from '../stores/conversations';
  import { chatStore } from '../stores/chat';
  
  let showDeleteConfirm = false;
  let conversationToDelete: string | null = null;
  
  function handleSelect(conversationId: string) {
    conversationsStore.selectConversation(conversationId);
  }
  
  function confirmDelete(conversationId: string) {
    conversationToDelete = conversationId;
    showDeleteConfirm = true;
  }
  
  async function handleDelete() {
    if (conversationToDelete) {
      try {
        await conversationsStore.deleteConversation(conversationToDelete);
        showDeleteConfirm = false;
        conversationToDelete = null;
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  }
  
  function cancelDelete() {
    showDeleteConfirm = false;
    conversationToDelete = null;
  }

  function handleNewChat() {
    // Reset chat store to clear any previous conversation state
    chatStore.setConversation(null);
    // Enter new chat mode (clears selection and enables chat input)
    conversationsStore.startNewChat();
  }
  
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
</script>

<div class="conversation-list">
  <div class="conversation-list-header">
    <h2>Conversations</h2>
    <button
      class="new-chat-btn"
      on:click={handleNewChat}
      title="New conversation"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
      <span>New Chat</span>
    </button>
  </div>
  
  <div class="conversation-list-content">
    {#if $conversationsStore.loading}
      <div class="conversations loading-skeleton">
        {#each Array(6) as _}
          <div class="skeleton-item">
            <div class="skeleton-title"></div>
            <div class="skeleton-meta"></div>
          </div>
        {/each}
      </div>
    {:else if $conversationsStore.error}
      <div class="error-state">
        <p class="error-message">{$conversationsStore.error}</p>
        <button on:click={() => conversationsStore.loadConversations()}>
          Retry
        </button>
      </div>
    {:else if $conversationsStore.conversations.length === 0}
      <div class="empty-state">
        <p>No conversations yet</p>
        <p class="hint">Start a new chat to get started</p>
      </div>
    {:else}
      <div class="conversations">
        {#each $conversationsStore.conversations as conversation (conversation.id)}
          <div 
            class="conversation-item"
            class:selected={$conversationsStore.selectedConversationId === conversation.id}
            on:click={() => handleSelect(conversation.id)}
            role="button"
            tabindex="0"
            on:keydown={(e) => e.key === 'Enter' && handleSelect(conversation.id)}
          >
            <div class="conversation-content">
              <div class="conversation-title">
                {conversation.title || 'Untitled Conversation'}
              </div>
              <div class="conversation-meta">
                <span class="conversation-date">{formatDate(conversation.createdAt)}</span>
                {#if conversation.generating}
                  <span class="generating-badge">Generating...</span>
                {/if}
              </div>
            </div>
            <button 
              class="delete-btn"
              on:click|stopPropagation={() => confirmDelete(conversation.id)}
              aria-label="Delete conversation"
              title="Delete conversation"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

{#if showDeleteConfirm}
  <div
    class="modal-overlay"
    role="dialog"
    aria-modal="true"
    aria-labelledby="delete-dialog-title"
    tabindex="-1"
    on:click={cancelDelete}
    on:keydown={(e) => e.key === 'Escape' && cancelDelete()}
  >
    <div
      class="modal-content"
      on:click|stopPropagation
      on:keydown={(e) => e.key === 'Escape' && cancelDelete()}
      role="document"
    >
      <h3 id="delete-dialog-title">Delete Conversation</h3>
      <p>Are you sure you want to delete this conversation? This action cannot be undone.</p>
      <div class="modal-actions">
        <button class="btn-secondary" on:click={cancelDelete}>Cancel</button>
        <button class="btn-danger" on:click={handleDelete}>Delete</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .conversation-list {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--color-bg-secondary);
    border-right: 1px solid var(--color-border);
  }
  
  .conversation-list-header {
    padding: 1.5rem 1rem 1rem;
    border-bottom: 1px solid var(--color-border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  }

  .conversation-list-header h2 {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--color-text);
  }

  .new-chat-btn {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.5rem 0.75rem;
    background: var(--color-accent);
    color: white;
    border-radius: 0.5rem;
    font-size: 0.8125rem;
    font-weight: 500;
    transition: background var(--transition-fast);
  }

  .new-chat-btn:hover {
    background: var(--color-accent-hover);
  }

  .new-chat-btn svg {
    flex-shrink: 0;
  }
  
  .conversation-list-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
  }
  
  .conversations {
    padding: 0.5rem;
  }
  
  .conversation-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    margin-bottom: 0.25rem;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: background-color 0.15s ease;
    position: relative;
  }
  
  .conversation-item:hover {
    background: var(--color-bg-hover);
  }
  
  .conversation-item.selected {
    background: var(--color-bg-selected);
  }
  
  .conversation-content {
    flex: 1;
    min-width: 0;
  }
  
  .conversation-title {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 0.25rem;
  }
  
  .conversation-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.75rem;
    color: var(--color-text-secondary);
  }
  
  .generating-badge {
    padding: 0.125rem 0.375rem;
    background: var(--color-accent);
    color: white;
    border-radius: 0.25rem;
    font-size: 0.625rem;
    font-weight: 500;
  }
  
  .delete-btn {
    opacity: 0;
    padding: 0.375rem;
    background: transparent;
    border: none;
    border-radius: 0.25rem;
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: all 0.15s ease;
  }
  
  .conversation-item:hover .delete-btn {
    opacity: 1;
  }
  
  .delete-btn:hover {
    background: var(--color-danger-bg);
    color: var(--color-danger);
  }
  
  .error-state,
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
    text-align: center;
    color: var(--color-text-secondary);
  }

  .empty-state p {
    margin: 0.5rem 0 0;
    font-size: 0.875rem;
  }
  
  .empty-state .hint {
    font-size: 0.75rem;
    color: var(--color-text-tertiary);
  }
  
  .error-state {
    gap: 1rem;
  }
  
  .error-message {
    color: var(--color-danger);
    font-size: 0.875rem;
    margin: 0;
  }
  
  .error-state button {
    padding: 0.5rem 1rem;
    background: var(--color-accent);
    color: white;
    border: none;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    cursor: pointer;
    transition: opacity 0.15s ease;
  }
  
  .error-state button:hover {
    opacity: 0.9;
  }
  
  /* Modal styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  
  .modal-content {
    background: var(--color-bg);
    border-radius: 0.75rem;
    padding: 1.5rem;
    max-width: 400px;
    width: 90%;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }
  
  .modal-content h3 {
    margin: 0 0 0.5rem;
    font-size: 1.125rem;
    color: var(--color-text);
  }
  
  .modal-content p {
    margin: 0 0 1.5rem;
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    line-height: 1.5;
  }
  
  .modal-actions {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
  }
  
  .btn-secondary,
  .btn-danger {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    border: none;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  
  .btn-secondary {
    background: var(--color-bg-secondary);
    color: var(--color-text);
  }
  
  .btn-secondary:hover {
    background: var(--color-bg-hover);
  }
  
  .btn-danger {
    background: var(--color-danger);
    color: white;
  }
  
  .btn-danger:hover {
    opacity: 0.9;
  }

  /* Skeleton Loading Styles */
  .loading-skeleton {
    pointer-events: none;
    padding: 0.5rem;
  }

  .skeleton-item {
    height: 60px;
    margin-bottom: 0.25rem;
    padding: 0.75rem;
    background: var(--color-bg-hover);
    border-radius: 0.5rem;
    opacity: 0.6;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    animation: pulse 1.5s infinite ease-in-out;
  }

  .skeleton-title {
    height: 14px;
    width: 80%;
    background: var(--color-border);
    border-radius: 2px;
  }

  .skeleton-meta {
    height: 10px;
    width: 40%;
    background: var(--color-border);
    border-radius: 2px;
  }

  @keyframes pulse {
    0% { opacity: 0.6; }
    50% { opacity: 0.3; }
    100% { opacity: 0.6; }
  }
</style>
