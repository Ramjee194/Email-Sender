<!-- src/components/SchedulingCard.svelte -->
<script lang="ts">
  import { onMount } from "svelte";

  // Main scheduling options
  export let scheduleEmail = false;
  export let scheduledTime = '';
  export let notifyEmail = '';
  export let notifyBrowser = false;
  
  // Batch processing options (अगर चाहिए तो)
  export let enableBatchProcessing = false;
  export let batchSize = 50;
  
  // Additional state
  let scheduledJobs: any[] = [];
  let isLoadingJobs = false;
  
  onMount(async () => {
    await loadScheduledJobs();
  });
  
  async function loadScheduledJobs() {
    isLoadingJobs = true;
    try {
      const response = await fetch('/api/jobs/scheduled');
      const result = await response.json();
      
      if (result.success) {
        scheduledJobs = result.jobs || [];
      }
    } catch (error) {
      console.error('Failed to load scheduled jobs:', error);
    } finally {
      isLoadingJobs = false;
    }
  }
  
  function formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }
  
  function getCurrentTimezone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
  
  // Calculate minimum datetime (current time + 5 minutes)
  function getMinDateTime(): string {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5); // Minimum 5 minutes from now
    return now.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:MM
  }
</script>

<div class="card mb-4">
  <div class="card-header">
    <h5 class="mb-0"><i class="bi bi-clock me-2"></i>Schedule & Batch Options</h5>
  </div>
  <div class="card-body">
    <!-- Batch Processing Section -->
    <div class="mb-4">
      <div class="form-check form-switch">
        <input
          class="form-check-input"
          type="checkbox"
          bind:checked={enableBatchProcessing}
          id="enableBatchProcessing"
        />
        <label class="form-check-label" for="enableBatchProcessing">
          <strong>Enable Batch Processing</strong>
        </label>
      </div>
      <small class="text-muted d-block ms-4">
        Recommended for large lists to avoid Gmail/Outlook limits
      </small>
      
      {#if enableBatchProcessing}
        <div class="mt-3">
          <label class="form-label">Batch Size</label>
          <input
            type="number"
            class="form-control"
            bind:value={batchSize}
            min="10"
            max="100"
            placeholder="e.g., 50"
          />
          <small class="text-muted">
            Number of emails per batch (10-100 recommended)
          </small>
        </div>
      {/if}
    </div>
    
    <hr />
    
    <!-- Email Scheduling Section -->
    <div class="mb-4">
      <div class="form-check form-switch">
        <input
          class="form-check-input"
          type="checkbox"
          bind:checked={scheduleEmail}
          id="scheduleEmail"
        />
        <label class="form-check-label" for="scheduleEmail">
          <strong>Schedule for later sending</strong>
        </label>
      </div>
      <small class="text-muted d-block ms-4">
        Send emails at a specific date/time automatically
      </small>

      {#if scheduleEmail}
        <div id="scheduleSettings" class="mt-3">
          <div class="row">
            <div class="col-md-6">
              <label class="form-label">Schedule Date & Time *</label>
              <input
                type="datetime-local"
                class="form-control"
                bind:value={scheduledTime}
                min={getMinDateTime()}
                required={scheduleEmail}
              />
              <small class="text-muted">
                Minimum 5 minutes from now
              </small>
              <div class="text-muted small">
                Your timezone: {getCurrentTimezone()}
              </div>
            </div>
            <div class="col-md-6">
              <label class="form-label">Notification Settings</label>
              <input
                type="email"
                class="form-control mb-2"
                bind:value={notifyEmail}
                placeholder="Email for completion notification (optional)"
              />
              <div class="form-check mb-2">
                <input
                  class="form-check-input"
                  type="checkbox"
                  bind:checked={notifyBrowser}
                  id="notifyBrowser"
                />
                <label class="form-check-label" for="notifyBrowser">
                  Show browser notification when complete
                </label>
              </div>
            </div>
          </div>

          <!-- Active Scheduled Jobs -->
          <div class="alert alert-info mt-3">
            <div class="d-flex justify-content-between align-items-center">
              <strong>📅 Active Scheduled Jobs</strong>
              <button 
                class="btn btn-sm btn-outline-primary"
                on:click={loadScheduledJobs}
                disabled={isLoadingJobs}
              >
                {isLoadingJobs ? 'Loading...' : 'Refresh'}
              </button>
            </div>
            <div id="scheduledJobsList" class="mt-2">
              {#if isLoadingJobs}
                <div class="text-center text-muted py-2">
                  <i class="bi bi-arrow-repeat bi-spin me-2"></i>
                  Loading scheduled jobs...
                </div>
              {:else if scheduledJobs.length === 0}
                <div class="text-muted py-2 text-center">
                  No active scheduled jobs
                </div>
              {:else}
                <div class="list-group">
                  {#each scheduledJobs as job, index}
                    <div class="list-group-item">
                      <div class="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{job.name || 'Untitled Job'}</strong>
                          <div class="small text-muted">
                            Scheduled for: {formatDateTime(job.scheduledFor)}
                            {#if job.recipientsCount}
                              <span class="ms-2">
                                ({job.recipientsCount} recipients)
                              </span>
                            {/if}
                          </div>
                        </div>
                        <span class="badge bg-{job.status === 'pending' ? 'warning' : 'info'}">
                          {job.status}
                        </span>
                      </div>
                    </div>
                  {/each}
                </div>
              {/if}
            </div>
          </div>
        </div>
      {/if}
    </div>
    
    <!-- Instructions -->
    <div class="alert alert-warning mt-3 small">
      <strong>⚠️ Important Notes:</strong>
      <ul class="mb-0 mt-1">
        <li>Batch processing helps avoid email provider limits</li>
        <li>Scheduled emails will be sent automatically at the specified time</li>
        <li>Make sure your server is running at the scheduled time</li>
        <li>You can monitor scheduled jobs in the Reports section</li>
      </ul>
    </div>
  </div>
</div>

<style>
  .list-group-item {
    border-left: 3px solid #0d6efd;
    margin-bottom: 5px;
  }
  
  .bi-spin {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
</style>