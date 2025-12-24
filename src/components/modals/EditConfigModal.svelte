<script lang="ts">
  import { onMount } from 'svelte';
  
  export let configId: string | null;
  export let onClose: () => void;
  export let onSave: () => void;
  
  interface EditConfigForm {
    name: string;
    host: string;
    port: number;
    secure: boolean;
    user: string;
    password: string;
    fromEmail: string;
    fromName: string;
    isDefault: boolean;
  }
  
  let form: EditConfigForm = {
    name: '',
    host: '',
    port: 587,
    secure: true,
    user: '',
    password: '',
    fromEmail: '',
    fromName: '',
    isDefault: false
  };
  
  let isLoading = false;
  let isSaving = false;
  let isTesting = false;
  let showPassword = false;
  
  onMount(async () => {
    if (configId) {
      await loadConfig();
    }
  });
  
  async function loadConfig() {
    isLoading = true;
    try {
      const response = await fetch(`/api/configs/${configId}`);
      const result = await response.json();
      
      if (result.success) {
        const config = result.config;
        form.name = config.name;
        form.host = config.host;
        form.port = config.port;
        form.secure = config.secure;
        form.user = config.user;
        form.password = ''; // Don't load password
        form.fromEmail = config.fromEmail;
        form.fromName = config.fromName || '';
        form.isDefault = config.isDefault;
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    } finally {
      isLoading = false;
    }
  }
  
  async function saveConfig() {
    isSaving = true;
    try {
      const response = await fetch(`/api/configs/${configId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      const result = await response.json();
      
      if (result.success) {
        onSave();
        onClose();
      } else {
        alert(result.message || 'Failed to save configuration');
      }
    } catch (error) {
      console.error('Failed to save config:', error);
      alert('Network error. Please try again.');
    } finally {
      isSaving = false;
    }
  }
  
  async function testConnection() {
    isTesting = true;
    try {
      const response = await fetch('/api/configs/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('✅ Connection test successful!');
      } else {
        alert(`❌ Connection test failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      alert('Network error during connection test.');
    } finally {
      isTesting = false;
    }
  }
  
  function togglePasswordVisibility() {
    showPassword = !showPassword;
  }
</script>

<div class="modal fade show" style="display: block; background: rgba(0,0,0,0.5);" on:click={onClose}>
  <div class="modal-dialog modal-lg" on:click|stopPropagation>
    <div class="modal-content">
      <div class="modal-header bg-warning text-dark">
        <h5 class="modal-title">
          <i class="bi bi-pencil me-2"></i>Edit Configuration
        </h5>
        <button type="button" class="btn-close" on:click={onClose}></button>
      </div>
      <div class="modal-body">
        {#if isLoading}
          <div class="text-center py-4">
            <div class="spinner-border" role="status"></div>
            <p class="mt-2">Loading configuration...</p>
          </div>
        {:else}
          <form id="editConfigForm" class="config-form">
            <div class="mb-3">
              <label class="form-label">Configuration Name *</label>
              <input
                type="text"
                class="form-control"
                bind:value={form.name}
                required
              />
            </div>

            <div class="row">
              <div class="col-md-8">
                <label class="form-label">SMTP Host *</label>
                <input
                  type="text"
                  class="form-control"
                  bind:value={form.host}
                  required
                />
              </div>
              <div class="col-md-4">
                <label class="form-label">Port *</label>
                <input
                  type="number"
                  class="form-control"
                  bind:value={form.port}
                  required
                />
              </div>
            </div>

            <div class="mb-3 mt-3">
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="checkbox"
                  bind:checked={form.secure}
                />
                <label class="form-check-label">Use TLS/SSL</label>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Username *</label>
              <input
                type="text"
                class="form-control"
                bind:value={form.user}
                required
              />
            </div>

            <div class="mb-3">
              <label class="form-label">Password</label>
              <div class="position-relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  class="form-control"
                  bind:value={form.password}
                  placeholder="Leave blank to keep current password"
                />
                <span
                  class="password-toggle"
                  on:click={togglePasswordVisibility}
                >
                  <i class={showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'}></i>
                </span>
              </div>
              <small class="text-muted"
                >Leave blank to keep current password</small
              >
            </div>

            <div class="mb-3">
              <label class="form-label">From Email *</label>
              <input
                type="email"
                class="form-control"
                bind:value={form.fromEmail}
                required
              />
            </div>

            <div class="mb-3">
              <label class="form-label">From Name</label>
              <input
                type="text"
                class="form-control"
                bind:value={form.fromName}
                placeholder="Your Name"
              />
            </div>

            <div class="mb-3">
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="checkbox"
                  bind:checked={form.isDefault}
                />
                <label class="form-check-label">
                  Set as default configuration
                </label>
              </div>
            </div>
          </form>
        {/if}
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" on:click={onClose}>
          Cancel
        </button>
        <button
          type="button"
          class="btn btn-outline-primary"
          on:click={testConnection}
          disabled={isTesting}
        >
          {#if isTesting}
            <span class="spinner-border spinner-border-sm me-1"></span>
            Testing...
          {:else}
            <i class="bi bi-wifi me-1"></i>Test Connection
          {/if}
        </button>
        <button
          type="button"
          class="btn btn-warning"
          on:click={saveConfig}
          disabled={isSaving}
        >
          {#if isSaving}
            <span class="spinner-border spinner-border-sm me-1"></span>
            Saving...
          {:else}
            <i class="bi bi-save me-1"></i>Save Changes
          {/if}
        </button>
      </div>
    </div>
  </div>
</div>