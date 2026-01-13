<script lang="ts">
  import { onMount } from 'svelte';
  import { assistants, selectedAssistantId, loadAssistants } from '../stores/assistants';
  import { modelsStore } from '../stores/models';

  onMount(loadAssistants);

  // Reactively update model selection when assistant changes
  $: {
    if ($selectedAssistantId) {
      const selectedAssistant = $assistants.find(a => a.id === $selectedAssistantId);
      if (selectedAssistant?.defaultModelId) {
        modelsStore.selectModel(selectedAssistant.defaultModelId);
      }
    }
  }
</script>

<select bind:value={$selectedAssistantId}>
  <option value={null}>Default Assistant</option>
  {#each $assistants as assistant}
    <option value={assistant.id}>{assistant.name}</option>
  {/each}
</select>