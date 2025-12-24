<script lang="ts">
  import { onMount } from 'svelte';

  type JobStatus = 'active' | 'scheduled' | 'completed' | 'failed';
  
  interface Job {
    id: string;
    name: string;
    status: JobStatus;
    progress: number;
    total: number;
    scheduledFor?: string;
    startedAt: string;
  }

  let activeJobs: Job[] = [];
  let scheduledJobs: Job[] = [];
  let recentActivity: Array<{ id: string; message: string; timestamp: string }> = [];
  let isLoading = true;

  onMount(async () => {
    await loadJobData();
  });

  async function loadJobData() {
    try {
      const response = await fetch('/api/jobs/active');
      const result = await response.json();
      
      if (result.success) {
        activeJobs = result.activeJobs || [];
        scheduledJobs = result.scheduledJobs || [];
        recentActivity = result.recentActivity || [];
      }
    } catch (error) {
      console.error('Failed to load job data:', error);
    } finally {
      isLoading = false;
    }
  }

  function formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }

  function getStatusBadge(status: JobStatus): string {
    const badges = {
      active: 'badge bg-primary',
      scheduled: 'badge bg-info',
      completed: 'badge bg-success',
      failed: 'badge bg-danger'
    };
    return badges[status] || 'badge bg-secondary';
  }
</script>

<div id="job-dashboard" class="mb-4">
  <div class="card">
    <div class="card-header bg-primary text-white">
      <h5 class="mb-0">📊 Active Jobs Dashboard</h5>
    </div>
    <div class="card-body">
      {#if isLoading}
        <div class="text-center py-3">
          <div class="spinner-border spinner-border-sm"></div>
          <span class="ms-2">Loading jobs...</span>
        </div>
      {:else}
        <div class="row">
          <!-- Active Batch Jobs -->
          <div class="col-md-6">
            <h6>⚡ Active Batch Jobs</h6>
            <div id="activeBatchJobs" class="list-group">
              {#if activeJobs.length === 0}
                <div class="list-group-item text-muted">
                  No active batch jobs
                </div>
              {:else}
                {#each activeJobs as job}
                  <div class="list-group-item">
                    <div class="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{job.name}</strong>
                        <br />
                        <small class="text-muted">
                          Started: {formatDateTime(job.startedAt)}
                        </small>
                      </div>
                      <div>
                        <span class="{getStatusBadge(job.status)}">
                          {job.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    {#if job.status === 'active'}
                      <div class="mt-2">
                        <div class="progress">
                          <div
                            class="progress-bar progress-bar-striped progress-bar-animated"
                            role="progressbar"
                            style="width: {job.progress}%"
                          >
                            {Math.round(job.progress)}%
                          </div>
                        </div>
                        <small class="text-muted">
                          {job.progress} of {job.total} emails sent
                        </small>
                      </div>
                    {/if}
                  </div>
                {/each}
              {/if}
            </div>
          </div>

          <!-- Scheduled Jobs -->
          <div class="col-md-6">
            <h6>📅 Upcoming Scheduled Jobs</h6>
            <div id="scheduledJobsPreview" class="list-group">
              {#if scheduledJobs.length === 0}
                <div class="list-group-item text-muted">
                  No scheduled jobs
                </div>
              {:else}
                {#each scheduledJobs as job}
                  <div class="list-group-item">
                    <div class="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{job.name}</strong>
                        <br />
                        <small class="text-muted">
                          Scheduled: {formatDateTime(job.scheduledFor || '')}
                        </small>
                      </div>
                      <div>
                        <span class="badge bg-info">
                          SCHEDULED
                        </span>
                      </div>
                    </div>
                  </div>
                {/each}
              {/if}
            </div>
          </div>
        </div>

        <!-- Job Timeline -->
        <div class="mt-4">
          <h6>📈 Recent Activity</h6>
          <div id="jobTimeline" class="timeline">
            {#if recentActivity.length === 0}
              <div class="text-muted">No recent activity</div>
            {:else}
              {#each recentActivity as activity}
                <div class="timeline-item">
                  <div class="activity-log">
                    <div class="log-entry">{activity.message}</div>
                    <small class="text-muted">
                      {formatDateTime(activity.timestamp)}
                    </small>
                  </div>
                </div>
              {/each}
            {/if}
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>