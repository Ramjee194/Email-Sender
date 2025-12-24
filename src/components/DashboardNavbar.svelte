<!-- src/components/modals/DashboardNavbar.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  
  let userName = "Guest";
  let userEmail = "";
  
  onMount(() => {
    if (browser) {
      const user = localStorage.getItem('user');
      if (user) {
        try {
          const userData = JSON.parse(user);
          userName = userData.name || "User";
          userEmail = userData.email || "";
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
    }
  });
  
  // Navigation functions
  function navigateToCompose() {
    goto('/dashboard/compose')
  }
  
  function navigateToConfigs() {
    goto('/dashboard/configs');
  }
  
  function navigateToReport() {
    goto('/dashboard/report');
  }
  
  function handleLogout() {
    localStorage.removeItem('authToken');
   
  }
</script>

<nav class="navbar navbar-expand-lg navbar-dark bg-primary mb-4">
  <div class="container">
    <a class="navbar-brand" href="/dashboard" on:click|preventDefault={navigateToCompose}>
      📧 Bulk Email Sender
    </a>
    <div class="navbar-nav ms-auto d-flex align-items-center">
      <a 
        class="nav-link {$page.url.pathname === '/dashboard' ? 'active' : ''}" 
        href="/dashboard"
        on:click|preventDefault={navigateToCompose}
      >
        Compose
      </a>
      <a 
        class="nav-link {$page.url.pathname.includes('/report') ? 'active' : ''}" 
        href="/dashboard/report"
        on:click|preventDefault={navigateToReport}
      >
        Reports
      </a>
      <a 
        class="nav-link {$page.url.pathname.includes('/configs') ? 'active' : ''}" 
        href="/dashboard/configs"
        on:click|preventDefault={navigateToConfigs}
      >
        My Configs
      </a>

      <!-- User Info Dropdown -->
      <div class="dropdown ms-3">
        <button
          class="btn user-info dropdown-toggle text-white"
          type="button"
          data-bs-toggle="dropdown"
        >
          <i class="bi bi-person-circle me-2"></i>
          <span id="userName">{userName}</span>
        </button>
        <ul class="dropdown-menu dropdown-menu-end">
          <li>
            <h6 class="dropdown-header" id="userEmail">
              {userEmail}
            </h6>
          </li>
          <li><hr class="dropdown-divider" /></li>
          <li>
            <a
              class="dropdown-item"
              href="#"
              on:click|preventDefault={navigateToConfigs}
            >
              <i class="bi bi-gear me-2"></i>SMTP Configurations
            </a>
          </li>
          <li><hr class="dropdown-divider" /></li>
          <li>
            <a
              class="dropdown-item text-danger"
              href="#"
              on:click|preventDefault={handleLogout}
            >
              <i class="bi bi-box-arrow-right me-2"></i>Logout
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</nav>