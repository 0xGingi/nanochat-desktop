<script lang="ts">
  import { onMount } from "svelte";
  import Settings from "./lib/components/Settings.svelte";
  import { getConfig } from "./lib/stores/config";

  let configLoaded = false;
  let showSettings = false;
  let isFirstRun = false;

  onMount(async () => {
    try {
      const config = await getConfig();
      
      // Check if config is valid (has both server_url and api_key)
      if (!config.server_url || !config.api_key) {
        isFirstRun = true;
        showSettings = true;
      }
      
      configLoaded = true;
    } catch (err) {
      console.error("Failed to load config:", err);
      isFirstRun = true;
      showSettings = true;
      configLoaded = true;
    }
  });

  function handleSettingsClose() {
    showSettings = false;
    // Reload config after settings are saved
    location.reload();
  }

  function openSettings() {
    showSettings = true;
  }
</script>

<main>
  {#if !configLoaded}
    <div class="loading">Loading...</div>
  {:else if showSettings}
    <Settings 
      isFirstRun={isFirstRun}
      onClose={isFirstRun ? null : handleSettingsClose}
    />
  {:else}
    <div class="app-content">
      <h1>NanoChat Desktop</h1>
      <p>Welcome to NanoChat Desktop!</p>
      <button on:click={openSettings}>Open Settings</button>
    </div>
  {/if}
</main>

<style>
  main {
    width: 100%;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .loading {
    color: #888;
    font-size: 1.2rem;
  }

  .app-content {
    text-align: center;
    padding: 2rem;
  }

  h1 {
    color: #fff;
    margin-bottom: 1rem;
  }

  p {
    color: #ccc;
    margin-bottom: 2rem;
  }

  button {
    padding: 0.75rem 1.5rem;
    background: #4a9eff;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.2s;
  }

  button:hover {
    background: #3a8eef;
  }
</style>
