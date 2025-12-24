<script lang="ts">
  export let onClose: () => void;
  export let onSave: () => void;
  
  interface NewConfigForm {
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
  
  let form: NewConfigForm = {
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
  
  let isSaving = false;
  let isTesting = false;
  let showPassword = false;
  
  async function saveConfig() {
    isSaving = true;
    try {
      const response = await fetch('/api/configs', {
        method: 'POST',
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

<div class="card border-primary">
  <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
    <h6 class="mb-0">New SMTP Configuration</h6>
    <button class="btn btn-sm btn-outline-light" on:click={onClose}>
      <i class="bi bi-x"></i>
    </button>
  </div>
  <div class="card-body config-form">
    <form>
      <div class="mb-3">
        <label class="form-label">Configuration Name *</label>
        <input
          type="text"
          class="form-control"
          bind:value={form.name}
          placeholder="e.g., My Gmail, Work Email"
          required
        />
        <small class="text-muted"
          >Give this configuration a memorable name</small
        >
      </div>

      <div class="row">
        <div class="col-md-8">
          <label class="form-label">SMTP Host *</label>
          <input
            type="text"
            class="form-control"
            bind:value={form.host}
            placeholder="smtp.gmail.com"
            required
          />
        </div>
        <div class="col-md-4">
          <label class="form-label">Port *</label>
          <input
            type="number"
            class="form-control"
            bind:value={form.port}
            placeholder="e.g., 587"
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
        <label class="form-label">Password *</label>
        <div class="position-relative">
          <input
            type={showPassword ? 'text' : 'password'}
            class="form-control"
            bind:value={form.password}
            required
          />
          <span class="password-toggle" on:click={togglePasswordVisibility}>
            <i class={showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'}></i>
          </span>
        </div>
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

      <div class="d-flex gap-2">
        <button
          type="button"
          class="btn btn-primary"
          on:click={saveConfig}
          disabled={isSaving}
        >
          {#if isSaving}
            <span class="spinner-border spinner-border-sm me-1"></span>
            Saving...
          {:else}
            <i class="bi bi-save me-1"></i>Save Configuration
          {/if}
        </button>
        <button
          type="button"
          class="btn btn-outline-secondary"
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
          class="btn btn-outline-secondary"
          on:click={onClose}
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
</div>