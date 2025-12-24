<script lang="ts">
  import { onMount } from 'svelte';

  export let onExport: (format: 'csv' | 'json') => void;

  interface EmailReport {
    id: string;
    email: string;
    status: 'sent' | 'failed' | 'error';
    name?: string;
    company?: string;
    subject: string;
    timestamp: string;
    messageId?: string;
    error?: string;
  }

  let reports: EmailReport[] = [];
  let isLoading = false;
  let autoRefresh = true;
  let stats = {
    total: 0,
    sent: 0,
    failed: 0,
    error: 0,
    successRate: 0
  };

  onMount(async () => {
    await loadReports();
  });

  async function loadReports() {
    isLoading = true;
    try {
      const response = await fetch('/api/reports');
      const result = await response.json();
      
      if (result.success) {
        reports = result.reports || [];
        calculateStats();
      }
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      isLoading = false;
    }
  }

  function calculateStats() {
    const total = reports.length;
    const sent = reports.filter(r => r.status === 'sent').length;
    const failed = reports.filter(r => r.status === 'failed').length;
    const error = reports.filter(r => r.status === 'error').length;
    const successRate = total > 0 ? (sent / total) * 100 : 0;
    
    stats = { total, sent, failed, error, successRate };
  }

  function formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }

  function getStatusBadge(status: string): string {
    switch (status) {
      case 'sent': return 'badge bg-success';
      case 'failed': return 'badge bg-danger';
      case 'error': return 'badge bg-warning';
      default: return 'badge bg-secondary';
    }
  }

  async function clearLogs() {
    if (!confirm('Are you sure you want to clear all logs?')) return;
    
    try {
      const response = await fetch('/api/reports', { method: 'DELETE' });
      const result = await response.json();
      
      if (result.success) {
        reports = [];
        calculateStats();
      }
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
  }

  function toggleAutoRefresh() {
    autoRefresh = !autoRefresh;
  }
</script>

<div id="report-tab" class="tab-content">
  <div class="row">
    <div class="col-12">
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5>📊 Email Reports</h5>
          <div>
            <span class="badge {autoRefresh ? 'bg-info' : 'bg-secondary'} me-2" id="autoRefreshBadge">
              <i class="bi bi-arrow-repeat"></i> Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
            </span>
            <button
              class="btn btn-success btn-sm"
              on:click={() => onExport('csv')}
            >
              📄 Export CSV
            </button>
            <button
              class="btn btn-info btn-sm"
              on:click={() => onExport('json')}
            >
              📋 Export JSON
            </button>
            <button
              class="btn btn-warning btn-sm"
              on:click={loadReports}
            >
              🔄 Refresh
            </button>
            <button class="btn btn-danger btn-sm" on:click={clearLogs}>
              🗑️ Clear Logs
            </button>
          </div>
        </div>
        <div class="card-body">
          <!-- Stats Container -->
          <div id="statsContainer" class="row mb-4">
            <div class="col-md-3">
              <div class="stat-card">
                <div class="card-body">
                  <h6 class="text-muted">Total Emails</h6>
                  <h3>{stats.total}</h3>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="stat-card success">
                <div class="card-body">
                  <h6 class="text-muted">Sent</h6>
                  <h3 class="text-success">{stats.sent}</h3>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="stat-card danger">
                <div class="card-body">
                  <h6 class="text-muted">Failed</h6>
                  <h3 class="text-danger">{stats.failed}</h3>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="stat-card warning">
                <div class="card-body">
                  <h6 class="text-muted">Success Rate</h6>
                  <h3 class="text-warning">{stats.successRate.toFixed(1)}%</h3>
                </div>
              </div>
            </div>
          </div>

          {#if isLoading}
            <div class="text-center py-4">
              <div class="spinner-border" role="status"></div>
              <p class="mt-2 text-muted">Loading reports...</p>
            </div>
          {:else if reports.length === 0}
            <div class="text-center py-4">
              <p class="text-muted">No reports found. Send some emails to see reports here.</p>
            </div>
          {:else}
            <div class="table-responsive">
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Name</th>
                    <th>Company</th>
                    <th>Subject</th>
                    <th>Timestamp</th>
                    <th>Message ID</th>
                    <th>Error</th>
                  </tr>
                </thead>
                <tbody id="reportTableBody">
                  {#each reports as report}
                    <tr>
                      <td>{report.email}</td>
                      <td>
                        <span class="{getStatusBadge(report.status)}">
                          {report.status.toUpperCase()}
                        </span>
                      </td>
                      <td>{report.name || '-'}</td>
                      <td>{report.company || '-'}</td>
                      <td>{report.subject}</td>
                      <td>{formatDateTime(report.timestamp)}</td>
                      <td>
                        {#if report.messageId}
                          <small class="text-muted">{report.messageId.slice(0, 8)}...</small>
                        {:else}
                          -
                        {/if}
                      </td>
                      <td>
                        {#if report.error}
                          <small class="text-danger">{report.error}</small>
                        {:else}
                          -
                        {/if}
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>