<!-- src/routes/dashboard/report/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  
  // ✅ Import CSS
  import '../../../app.css';
  import 'bootstrap/dist/css/bootstrap.min.css';
  
  // ✅ Import ReportTab component
  // Adjust path based on where your ReportTab.svelte file is
  import ReportTab from "../../../components/ReportTab.svelte";
  // OR if in modals folder:
  // import ReportTab from "../../../components/modals/ReportTab.svelte";

  // ✅ Define functions if ReportTab expects props
  // If ReportTab doesn't need props, you can remove these
  function handleReportAction(id: string) {
    console.log('Report action:', id);
    // Add your logic here
  }
  
  function handleReportView(id: string) {
    console.log('View report:', id);
    // Add your logic here
  }

  onMount(() => {
    if (browser) {
      // Auth check
      const token = localStorage.getItem('authToken');
      if (!token) {
        goto('/login');
      }
      
      console.log('Reports page loaded');
    }
  });
</script>

<div class="reports-page">
  <!-- Page Header -->
  <div class="page-header mb-4">
    <h1 class="page-title">
      <i class="bi bi-bar-chart me-2"></i>Email Reports
    </h1>
    <p class="page-subtitle text-muted">
      View analytics and sending statistics
    </p>
  </div>
  
  <!-- ReportTab Component -->
  <!-- If ReportTab needs props, pass them like this: -->
  {#if ReportTab}
    <ReportTab
      onReportAction={handleReportAction}
      onReportView={handleReportView}
    />
  {:else}
    <!-- If ReportTab doesn't exist, show default content -->
    <div class="card">
      <div class="card-body">
        <h5>Email Analytics Dashboard</h5>
        <p>ReportTab component not found. Showing default reports view.</p>
        
        <!-- Sample Reports Data -->
        <div class="row mt-4">
          <div class="col-md-3">
            <div class="card text-white bg-primary mb-3">
              <div class="card-body">
                <h5 class="card-title">1,250</h5>
                <p class="card-text">Emails Sent</p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card text-white bg-success mb-3">
              <div class="card-body">
                <h5 class="card-title">68%</h5>
                <p class="card-text">Open Rate</p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card text-white bg-info mb-3">
              <div class="card-body">
                <h5 class="card-title">42%</h5>
                <p class="card-text">Click Rate</p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card text-white bg-warning mb-3">
              <div class="card-body">
                <h5 class="card-title">2.3%</h5>
                <p class="card-text">Bounce Rate</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Recent Campaigns Table -->
        <div class="mt-4">
          <h6>Recent Campaigns</h6>
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th>Sent</th>
                  <th>Opened</th>
                  <th>Clicks</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Welcome Emails</td>
                  <td>250</td>
                  <td>170 (68%)</td>
                  <td>85 (34%)</td>
                  <td><span class="badge bg-success">Completed</span></td>
                </tr>
                <tr>
                  <td>Newsletter Dec</td>
                  <td>500</td>
                  <td>350 (70%)</td>
                  <td>210 (42%)</td>
                  <td><span class="badge bg-success">Completed</span></td>
                </tr>
                <tr>
                  <td>Product Launch</td>
                  <td>300</td>
                  <td>180 (60%)</td>
                  <td>90 (30%)</td>
                  <td><span class="badge bg-info">In Progress</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  {/if}
  
  <!-- Help Section -->
  <div class="mt-4">
    <div class="card">
      <div class="card-body">
        <h6><i class="bi bi-lightbulb me-2"></i>Analytics Tips:</h6>
        <ul class="mb-0 small">
          <li>Check open rates to gauge subject line effectiveness</li>
          <li>Monitor click rates to measure engagement</li>
          <li>High bounce rates may indicate email list issues</li>
          <li>Best sending times: Tuesday-Thursday, 10 AM - 2 PM</li>
        </ul>
      </div>
    </div>
  </div>
</div>

<style>
  .reports-page {
    padding: 20px;
    background-color: #f8f9fa;
    min-height: calc(100vh - 76px);
  }
  
  .page-header {
    padding-bottom: 10px;
    border-bottom: 2px solid #e9ecef;
  }
  
  .page-title {
    color: #2c3e50;
    font-weight: 600;
    margin-bottom: 5px;
  }
  
  .page-subtitle {
    font-size: 0.95rem;
  }
  
  .card {
    margin-bottom: 1rem;
    border: 1px solid rgba(0,0,0,.125);
    border-radius: 0.5rem;
    box-shadow: 0 0.125rem 0.25rem rgba(0,0,0,.075);
  }
  
  .table th {
    background-color: #f8f9fa;
    font-weight: 600;
  }
</style>