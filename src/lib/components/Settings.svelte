<script lang="ts">
  import { getConfig, saveConfig, validateConnection, type Config } from "../stores/config";
  import { onMount } from "svelte";

  let serverUrl = "";
  let apiKey = "";
  let showApiKey = false;
  let isSaving = false;
  let isTesting = false;
  let testResult: { success: boolean; message: string } | null = null;

  export let onClose: (() => void) | null = null;
  export let isFirstRun = false;

  onMount(async () => {
    try {
      const config = await getConfig();
      serverUrl = config.server_url;
      apiKey = config.api_key;
    } catch (err) {
      console.error("Failed to load config:", err);
    }
  });

  async function handleSave() {
    isSaving = true;
    testResult = null;

    try {
      const config: Config = {
        server_url: serverUrl,
        api_key: apiKey,
      };
      await saveConfig(config);
      testResult = { success: true, message: "Settings saved successfully!" };
      
      if (onClose && !isFirstRun) {
        setTimeout(() => onClose?.(), 1000);
      }
    } catch (err) {
      testResult = { success: false, message: `Failed to save: ${err}` };
    } finally {
      isSaving = false;
    }
  }

  async function handleTestConnection() {
    isTesting = true;
    testResult = null;

    try {
      const isValid = await validateConnection(serverUrl, apiKey);
      if (isValid) {
        testResult = { success: true, message: "Connection successful!" };
      }
    } catch (err) {
      testResult = { success: false, message: `Connection failed: ${err}` };
    } finally {
      isTesting = false;
    }
  }

  function toggleShowApiKey() {
    showApiKey = !showApiKey;
  }
</script>

<div class="settings-overlay">
  <div class="settings-modal">
    <h2>Settings</h2>
    
    {#if isFirstRun}
      <p class="first-run-message">
        Welcome! Please configure your NanoChat server connection.
      </p>
    {/if}

    <form on:submit|preventDefault={handleSave}>
      <div class="form-group">
        <label for="server-url">Server URL</label>
        <input
          id="server-url"
          type="url"
          bind:value={serverUrl}
          placeholder="https://nano.crocker-family.org"
          required
        />
      </div>

      <div class="form-group">
        <label for="api-key">API Key</label>
        <div class="api-key-input">
          <input
            id="api-key"
            type={showApiKey ? "text" : "password"}
            bind:value={apiKey}
            placeholder="Your API key"
            required
          />
          <button
            type="button"
            class="toggle-visibility"
            on:click={toggleShowApiKey}
            title={showApiKey ? "Hide" : "Show"}
          >
            {showApiKey ? "👁️" : "👁️‍🗨️"}
          </button>
        </div>
      </div>

      {#if testResult}
        <div class="test-result" class:success={testResult.success} class:error={!testResult.success}>
          {testResult.message}
        </div>
      {/if}

      <div class="button-group">
        <button
          type="button"
          class="btn-secondary"
          on:click={handleTestConnection}
          disabled={isTesting || !serverUrl || !apiKey}
        >
          {isTesting ? "Testing..." : "Test Connection"}
        </button>
        
        <button
          type="submit"
          class="btn-primary"
          disabled={isSaving || !serverUrl || !apiKey}
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>

      {#if isFirstRun}
        <p class="first-run-note">
          You must save valid settings before using the app.
        </p>
      {/if}
    </form>

    {#if !isFirstRun && onClose}
      <button class="close-button" on:click={onClose}>×</button>
    {/if}
  </div>
</div>

<style>
  .settings-overlay {
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

  .settings-modal {
    background: #1e1e1e;
    border-radius: 12px;
    padding: 2rem;
    width: 90%;
    max-width: 500px;
    position: relative;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  }

  h2 {
    margin: 0 0 1.5rem 0;
    color: #fff;
    font-size: 1.5rem;
  }

  .first-run-message {
    background: #2a4d6e;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
    color: #a8d5ff;
  }

  .first-run-note {
    margin-top: 1rem;
    font-size: 0.9rem;
    color: #888;
    text-align: center;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    color: #ccc;
    font-weight: 500;
  }

  input {
    width: 100%;
    padding: 0.75rem;
    background: #2a2a2a;
    border: 1px solid #444;
    border-radius: 6px;
    color: #fff;
    font-size: 1rem;
    box-sizing: border-box;
  }

  input:focus {
    outline: none;
    border-color: #4a9eff;
  }

  .api-key-input {
    position: relative;
    display: flex;
    gap: 0.5rem;
  }

  .api-key-input input {
    flex: 1;
  }

  .toggle-visibility {
    padding: 0.75rem 1rem;
    background: #2a2a2a;
    border: 1px solid #444;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1.2rem;
    transition: background 0.2s;
  }

  .toggle-visibility:hover {
    background: #333;
  }

  .test-result {
    padding: 1rem;
    border-radius: 6px;
    margin-bottom: 1rem;
    font-weight: 500;
  }

  .test-result.success {
    background: #1a4d2e;
    color: #7cf0a0;
  }

  .test-result.error {
    background: #4d1a1a;
    color: #f07c7c;
  }

  .button-group {
    display: flex;
    gap: 1rem;
  }

  button[type="submit"],
  button[type="button"] {
    flex: 1;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-primary {
    background: #4a9eff;
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    background: #3a8eef;
  }

  .btn-secondary {
    background: #2a2a2a;
    color: #fff;
    border: 1px solid #444;
  }

  .btn-secondary:hover:not(:disabled) {
    background: #333;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .close-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: transparent;
    border: none;
    font-size: 2rem;
    color: #888;
    cursor: pointer;
    padding: 0;
    width: 2rem;
    height: 2rem;
    line-height: 1;
  }

  .close-button:hover {
    color: #fff;
  }
</style>
