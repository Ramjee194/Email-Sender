<script lang="ts">
  import { onMount } from 'svelte';
  import NewConfigForm from './NewConfigForm.svelte';

  export let onConfigSelect: (id: string) => void;
  export let onConfigEdit: (id: string) => void;

  interface SMTPConfig {
    id: string;
    name: string;
    host: string;
    port: number;
    secure: boolean;
    user: string;
    fromEmail: string;
    fromName?: string;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
  }

  let configs: SMTPConfig[] = [];
  let isLoading = false;
  let showNewConfigForm = false;

  onMount(async () => {
    await loadConfigs();
  });

  async function loadConfigs() {
    isLoading = true;
    try {
      const response = await fetch('/api/configs');
      const result = await response.json();
      
      if (result.success) {
        configs = result.configs || [];
      }
    } catch (error) {
      console.error('Failed to load configs:', error);
    } finally {
      isLoading = false;
    }
  }

  async function deleteConfig(id: string) {
    if (!confirm('Are you sure you want to delete this configuration?')) {
      return;
    }

    try {
      const response = await fetch(`/api/configs/${id}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      
      if (result.success) {
        await loadConfigs();
      }
    } catch (error) {
      console.error('Failed to delete config:', error);
    }
  }

  async function setDefaultConfig(id: string) {
    try {
      const response = await fetch(`/api/configs/${id}/default`, {
        method: 'PUT'
      });
      const result = await response.json();
      
      if (result.success) {
        await loadConfigs();
      }
    } catch (error) {
      console.error('Failed to set default config:', error);
    }
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
</script>

<div id="configs-tab" class="tab-content">
  <div class="row">
    <div class="col-12">
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5>⚙️ My SMTP Configurations</h5>
          <button
            class="btn btn-primary"
            on:click={() => showNewConfigForm = true}
          >
            <i class="bi bi-plus-circle me-2"></i>Add New Configuration
          </button>
        </div>
        <div class="card-body">
          <div id="configsManagement">
            {#if isLoading}
              <div class="text-center py-4">
                <div class="spinner-border" role="status"></div>
                <p class="mt-2 text-muted">Loading your configurations...</p>
              </div>
            {:else if configs.length === 0}
              <div class="text-center py-4">
                <p class="text-muted">No configurations found.</p>
                <button
                  class="btn btn-primary"
                  on:click={() => showNewConfigForm = true}
                >
                  <i class="bi bi-plus-circle me-2"></i>Add Your First Configuration
                </button>
              </div>
            {:else}
              <div class="row">
                {#each configs as config}
                  <div class="col-md-6 mb-3">
                    <div class="card config-item">
                      <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <h6 class="card-title mb-1">
                              {config.name}
                              {#if config.isDefault}
                                <span class="badge bg-success ms-2">Default</span>
                              {/if}
                            </h6>
                            <small class="text-muted">
                              {config.host}:{config.port} • {config.fromEmail}
                            </small>
                          </div>
                          <div class="dropdown">
                            <button
                              class="btn btn-sm btn-outline-secondary"
                              type="button"
                              data-bs-toggle="dropdown"
                            >
                              <i class="bi bi-three-dots-vertical"></i>
                            </button>
                            <ul class="dropdown-menu">
                              <li>
                                <a
                                  class="dropdown-item"
                                  href="#"
                                  on:click|preventDefault={() => onConfigSelect(config.id)}
                                >
                                  <i class="bi bi-eye me-2"></i>View
                                </a>
                              </li>
                              <li>
                                <a
                                  class="dropdown-item"
                                  href="#"
                                  on:click|preventDefault={() => onConfigEdit(config.id)}
                                >
                                  <i class="bi bi-pencil me-2"></i>Edit
                                </a>
                              </li>
                              {#if !config.isDefault}
                                <li>
                                  <a
                                    class="dropdown-item"
                                    href="#"
                                    on:click|preventDefault={() => setDefaultConfig(config.id)}
                                  >
                                    <i class="bi bi-star me-2"></i>Set as Default
                                  </a>
                                </li>
                              {/if}
                              <li><hr class="dropdown-divider" /></li>
                              <li>
                                <a
                                  class="dropdown-item text-danger"
                                  href="#"
                                  on:click|preventDefault={() => deleteConfig(config.id)}
                                >
                                  <i class="bi bi-trash me-2"></i>Delete
                                </a>
                              </li>
                            </ul>
                          </div>
                        </div>
                        
                        <div class="config-details mt-3">
                          <div class="row">
                            <div class="col-6">
                              <small class="text-muted d-block">Username</small>
                              <strong>{config.user}</strong>
                            </div>
                            <div class="col-6">
                              <small class="text-muted d-block">Security</small>
                              <strong>{config.secure ? 'TLS/SSL' : 'STARTTLS'}</strong>
                            </div>
                          </div>
                          
                          <div class="mt-2">
                            <small class="text-muted d-block">From Name</small>
                            <strong>{config.fromName || 'Not set'}</strong>
                          </div>
                          
                          <div class="mt-2 text-end">
                            <small class="text-muted">
                              Updated: {formatDate(config.updatedAt)}
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

{#if showNewConfigForm}
  <NewConfigForm onClose={() => showNewConfigForm = false} onSave={loadConfigs} />
{/if}