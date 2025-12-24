<script lang="ts">
  import { onMount } from 'svelte';
  
  export let configId: string | null;
  export let onClose: () => void;
  export let onEdit: () => void;
  
  interface ConfigDetails {
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
  
  let config: ConfigDetails | null = null;
  let isLoading = false;
  
  onMount(async () => {
    if (configId) {
      await loadConfigDetails();
    }
  });
  
  async function loadConfigDetails() {
    isLoading = true;
    try {
      const response = await fetch(`/api/configs/${configId}`);
      const result = await response.json();
      
      if (result.success) {
        config = result.config;
      }
    } catch (error) {
      console.error('Failed to load config details:', error);
    } finally {
      isLoading = false;
    }
  }
  
  function maskPassword(password: string): string {
    return '•'.repeat(password.length);
  }
  
  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }
</script>

<div class="modal fade show" style="display: block; background: rgba(0,0,0,0.5);" on:click={onClose}>
  <div class="modal-dialog modal-lg" on:click|stopPropagation>
    <div class="modal-content">
      <div class="modal-header bg-info text-white">
        <h5 class="modal-title">
          <i class="bi bi-eye me-2"></i>View Configuration
        </h5>
        <button type="button" class="btn-close btn-close-white" on:click={onClose}></button>
      </div>
      <div class="modal-body">
        {#if isLoading}
          <div class="text-center py-4">
            <div class="spinner-border" role="status"></div>
            <p class="mt-2">Loading configuration details...</p>
          </div>
        {:else if config}
          <div id="viewConfigContent">
            <div class="config-detail-item">
              <div class="config-detail-label">Configuration Name</div>
              <div class="config-detail-value">{config.name}</div>
            </div>
            
            <div class="row">
              <div class="col-md-6">
                <div class="config-detail-item">
                  <div class="config-detail-label">SMTP Host</div>
                  <div class="config-detail-value">{config.host}</div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="config-detail-item">
                  <div class="config-detail-label">Port</div>
                  <div class="config-detail-value">{config.port}</div>
                </div>
              </div>
            </div>
            
            <div class="config-detail-item">
              <div class="config-detail-label">Security</div>
              <div class="config-detail-value">
                {config.secure ? 'TLS/SSL' : 'STARTTLS'}
              </div>
            </div>
            
            <div class="config-detail-item">
              <div class="config-detail-label">Username</div>
              <div class="config-detail-value">{config.user}</div>
            </div>
            
            <div class="config-detail-item">
              <div class="config-detail-label">From Email</div>
              <div class="config-detail-value">{config.fromEmail}</div>
            </div>
            
            <div class="config-detail-item">
              <div class="config-detail-label">From Name</div>
              <div class="config-detail-value">{config.fromName || 'Not set'}</div>
            </div>
            
            <div class="config-detail-item">
              <div class="config-detail-label">Default Configuration</div>
              <div class="config-detail-value">
                {config.isDefault ? 'Yes' : 'No'}
              </div>
            </div>
            
            <div class="row">
              <div class="col-md-6">
                <div class="config-detail-item">
                  <div class="config-detail-label">Created</div>
                  <div class="config-detail-value">
                    {formatDate(config.createdAt)}
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="config-detail-item">
                  <div class="config-detail-label">Last Updated</div>
                  <div class="config-detail-value">
                    {formatDate(config.updatedAt)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        {:else}
          <div class="alert alert-warning">
            Configuration not found.
          </div>
        {/if}
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" on:click={onClose}>
          Close
        </button>
        {#if config}
          <button type="button" class="btn btn-primary" on:click={onEdit}>
            <i class="bi bi-pencil me-2"></i>Edit Configuration
          </button>
        {/if}
      </div>
    </div>
  </div>
</div>