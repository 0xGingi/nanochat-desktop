<script lang="ts">
  import type { Message, Role } from '../api/types';

  export let message: Message;

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  function getRoleLabel(role: Role): string {
    switch (role) {
      case 'user':
        return 'You';
      case 'assistant':
        return 'Assistant';
      case 'system':
        return 'System';
      default:
        return role;
    }
  }

  function getRoleIcon(role: Role): string {
    switch (role) {
      case 'user':
        return '👤';
      case 'assistant':
        return '🤖';
      case 'system':
        return '⚙️';
      default:
        return '💬';
    }
  }
</script>

<div class="chat-message" class:role-user={message.role === 'user'} class:role-assistant={message.role === 'assistant'}>
  <div class="message-avatar">
    <span class="avatar-icon">{getRoleIcon(message.role)}</span>
  </div>

  <div class="message-content">
    <div class="message-header">
      <span class="message-role">{getRoleLabel(message.role)}</span>
      <span class="message-time">{formatDate(message.createdAt)}</span>
    </div>

    {#if message.contentHtml}
      <div class="message-body">
        {@html message.contentHtml}
      </div>
    {:else}
      <div class="message-body">
        {message.content}
      </div>
    {/if}

    {#if message.reasoning}
      <details class="message-reasoning">
        <summary>Reasoning</summary>
        <div class="reasoning-content">
          {message.reasoning}
        </div>
      </details>
    {/if}

    {#if message.images && message.images.length > 0}
      <div class="message-attachments">
        <div class="attachments-label">Images:</div>
        {#each message.images as image}
          <img src={image.url} alt={image.fileName || 'Attached image'} class="attached-image" />
        {/each}
      </div>
    {/if}

    {#if message.documents && message.documents.length > 0}
      <div class="message-attachments">
        <div class="attachments-label">Documents:</div>
        {#each message.documents as document}
          <a href={document.url} target="_blank" rel="noopener noreferrer" class="attached-document">
            📄 {document.fileName || document.fileType}
          </a>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .chat-message {
    display: flex;
    gap: 0.75rem;
    padding: 1rem;
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .role-user {
    background: var(--color-bg-secondary);
  }

  .role-assistant {
    background: transparent;
  }

  .message-avatar {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-bg-hover);
    border-radius: 50%;
    font-size: 1rem;
  }

  .role-user .message-avatar {
    background: var(--color-accent);
    color: white;
  }

  .role-assistant .message-avatar {
    background: var(--color-success);
  }

  .message-content {
    flex: 1;
    min-width: 0;
  }

  .message-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.375rem;
  }

  .message-role {
    font-weight: 600;
    font-size: 0.875rem;
    color: var(--color-text);
  }

  .message-time {
    font-size: 0.75rem;
    color: var(--color-text-tertiary);
  }

  .message-body {
    color: var(--color-text);
    line-height: 1.6;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }

  .message-body :global(p) {
    margin: 0 0 0.5rem 0;
  }

  .message-body :global(p:last-child) {
    margin-bottom: 0;
  }

  .message-body :global(code) {
    background: var(--color-bg-hover);
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
    font-size: 0.875em;
    font-family: 'Courier New', monospace;
  }

  .message-body :global(pre) {
    background: var(--color-bg-hover);
    padding: 0.75rem;
    border-radius: 0.5rem;
    overflow-x: auto;
    margin: 0.5rem 0;
  }

  .message-body :global(pre code) {
    background: transparent;
    padding: 0;
  }

  .message-body :global(ul),
  .message-body :global(ol) {
    margin: 0.5rem 0;
    padding-left: 1.5rem;
  }

  .message-reasoning {
    margin-top: 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    overflow: hidden;
  }

  .message-reasoning summary {
    padding: 0.5rem 0.75rem;
    background: var(--color-bg-hover);
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text-secondary);
    user-select: none;
  }

  .message-reasoning summary:hover {
    background: var(--color-bg-selected);
  }

  .reasoning-content {
    padding: 0.75rem;
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    line-height: 1.5;
    background: var(--color-bg);
    border-top: 1px solid var(--color-border);
  }

  .message-attachments {
    margin-top: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .attachments-label {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--color-text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .attached-image {
    max-width: 200px;
    max-height: 200px;
    border-radius: 0.5rem;
    object-fit: contain;
  }

  .attached-document {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: var(--color-bg-hover);
    border-radius: 0.5rem;
    color: var(--color-text);
    text-decoration: none;
    font-size: 0.875rem;
    transition: background var(--transition-fast);
  }

  .attached-document:hover {
    background: var(--color-bg-selected);
  }
</style>
