<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  let showNavbar = false;

  onMount(() => {
    if (browser) {
      const token = localStorage.getItem('authToken');
      const isDashboardPage = $page.url.pathname.startsWith('/dashboard');
      
      // Agar dashboard page pe hai aur logged in nahi hai
      if (isDashboardPage && !token) {
        goto('/login');
      }
      
      // Navbar sirf dashboard pages pe show karo jab logged in ho
      showNavbar = isDashboardPage && !!token;
    }
  });
  
  // Page change pe update
  $: if (browser) {
    const token = localStorage.getItem('authToken');
    showNavbar = $page.url.pathname.startsWith('') && !!token;
  }
</script>

{#if showNavbar}
  
{/if}

<slot />

<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  }
</style>