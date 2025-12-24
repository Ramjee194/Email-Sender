<!-- src/routes/dashboard/configs/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  
  // ✅ Import CSS
  import '../../../app.css';
  import 'bootstrap/dist/css/bootstrap.min.css';
  
  // ✅ Import ConfigsTab component
  import ConfigsTab from "../../../components/ConfigsTab.svelte";
  // OR if in modals folder:
  // import ConfigsTab from "../../../components/modals/ConfigsTab.svelte";

  // ✅ Define the functions that ConfigsTab expects
  function handleConfigSelect(id: string) {
    console.log('Config selected:', id);
    // Add your logic here, e.g., show details
    alert(`Selected config: ${id}`);
  }
  
  function handleConfigEdit(id: string) {
    console.log('Config edit:', id);
    // Add your logic here, e.g., navigate to edit page
    alert(`Edit config: ${id}`);
    // goto(`/dashboard/configs/edit/${id}`);
  }

  onMount(() => {
    if (browser) {
      // Auth check
      const token = localStorage.getItem('authToken');
      if (!token) {
        goto('/login');
      }
      
      console.log('Configs page loaded');
    }
  });
</script>

<div class="configs-page">
  <!-- Page Header -->
  <div class="page-header mb-4">
    <h1 class="page-title">
      <i class="bi bi-gear me-2"></i>SMTP Configurations
    </h1>
    <p class="page-subtitle text-muted">
      Manage your email sending configurations
    </p>
  </div>
  
  <!-- ✅ Pass the required props to ConfigsTab -->
  <ConfigsTab
    onConfigSelect={handleConfigSelect}
    onConfigEdit={handleConfigEdit}
  />
  
  <!-- Help Section -->
  <div class="mt-4">
    <div class="card">
      <div class="card-body">
        <h6><i class="bi bi-info-circle me-2"></i>Configuration Tips:</h6>
        <ul class="mb-0 small">
          <li><strong>Gmail:</strong> Use App Password, not regular password</li>
          <li><strong>Outlook/Hotmail:</strong> Regular password usually works</li>
          <li>Respect daily sending limits to avoid being blocked</li>
          <li>Test configuration before using for bulk sending</li>
        </ul>
      </div>
    </div>
  </div>
</div>

<style>
  .configs-page {
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
</style>