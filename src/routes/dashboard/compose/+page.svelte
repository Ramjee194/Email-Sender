<!-- src/routes/dashboard/compose/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  
  
  // ✅ CORRECT: File is in components/ not components/modals/
  import ComposeTab from "../../../components/ComposeTab.svelte";
  
  function handleConfigSelect(id: string) {
    console.log('Config selected:', id);
    // Add your logic here
  }
  
  function handleConfigEdit(id: string) {
    console.log('Config edit:', id);
    // Add your logic here
  }

  onMount(() => {
    if (browser) {
      const token = localStorage.getItem('authToken');
      if (!token) {
        goto('/login');
      }
    }
  });
</script>

<div class="container-fluid mt-4">
  <h1 class="mb-4">📧 Compose Email</h1>
  
  <!-- ✅ Now this will work -->
  <ComposeTab
    onConfigSelect={handleConfigSelect}
    onConfigEdit={handleConfigEdit}
  />
</div>

<style>
  h1 {
    color: #2c3e50;
    border-bottom: 3px solid #3498db;
    padding-bottom: 10px;
  }
</style>