<!-- src/routes/dashboard/+layout.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
    import DashboardNavbar from '../../components/DashboardNavbar.svelte';


  onMount(() => {
    if (browser) {
      const token = localStorage.getItem('authToken');
      if (!token) {
        goto('/login');
      }
    }
  });
</script>

<DashboardNavbar/>
<slot />