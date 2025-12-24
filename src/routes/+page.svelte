<!-- src/routes/login/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  let activeTab: 'login' | 'register' = 'login';
  let isLoading = false;
  let alert: { type: 'success' | 'danger' | 'warning' | 'info'; message: string } | null = null;
  
  // Form data
  let loginForm = {
    email: '',
    password: ''
  };
  
  let registerForm = {
    name: '',
    email: '',
    password: ''
  };

  // Check authentication on mount
  onMount(async () => {
    try {
      // ✅ TEMPORARY: Check localStorage only (NO API)
      const token = localStorage.getItem('authToken');
      
      if (token) {
        goto('/dashboard');
      }
    } catch (error) {
      // Not authenticated, stay on login page
    }
  });

  // Tab switching
  function showTab(tab: 'login' | 'register') {
    activeTab = tab;
    clearAlert();
  }

  // Alert functions
  function showAlert(type: 'success' | 'danger' | 'warning' | 'info', message: string) {
    alert = { type, message };
  }

  function clearAlert() {
    alert = null;
  }

  // Form handlers
  async function handleLogin(event: Event) {
    event.preventDefault();
    clearAlert();
    isLoading = true;

    try {
      // ✅ TEMPORARY MOCK LOGIN (API 404 fix)
      if (!loginForm.email || !loginForm.password) {
        throw new Error('Email and password are required');
      }
      
      if (loginForm.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      
      // Mock delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create mock user data
      const mockUser = {
        id: 'user_' + Date.now(),
        name: loginForm.email.split('@')[0],
        email: loginForm.email,
        role: 'user',
        createdAt: new Date().toISOString()
      };
      
      // Save to localStorage
      localStorage.setItem('authToken', 'mock_jwt_token_' + Date.now());
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      showAlert('success', 'Login successful! Redirecting...');
      setTimeout(() => {
        goto('/dashboard');
      }, 1000);
      
    } catch (error) {
      showAlert('danger', error instanceof Error ? error.message : 'Login failed');
    } finally {
      isLoading = false;
    }
  }

  async function handleRegister(event: Event) {
    event.preventDefault();
    clearAlert();
    isLoading = true;

    try {
      // ✅ TEMPORARY MOCK REGISTRATION
      if (!registerForm.name || !registerForm.email || !registerForm.password) {
        throw new Error('All fields are required');
      }
      
      if (registerForm.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser = {
        id: 'user_' + Date.now(),
        name: registerForm.name,
        email: registerForm.email,
        role: 'user',
        createdAt: new Date().toISOString()
      };
      
      localStorage.setItem('authToken', 'mock_jwt_token_' + Date.now());
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      showAlert('success', 'Account created successfully! Redirecting...');
      setTimeout(() => {
        goto('/dashboard');
      }, 1000);
      
    } catch (error) {
      showAlert('danger', error instanceof Error ? error.message : 'Registration failed');
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Login - Bulk Email Sender</title>
  <link
    href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
    rel="stylesheet"
  />
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css"
  />
  <!-- External Scripts -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</svelte:head>

<style>
  body {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    align-items: center;
    margin: 0;
    padding: 20px;
  }

  .login-card {
    backdrop-filter: blur(10px);
    background: rgba(255, 255, 255, 0.95);
    border-radius: 20px;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .brand-logo {
    background: linear-gradient(45deg, #667eea, #764ba2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: bold;
    font-size: 2.5rem;
  }

  .form-control:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
  }

  .btn-primary {
    background: linear-gradient(45deg, #667eea, #764ba2);
    border: none;
    border-radius: 10px;
    padding: 12px 30px;
    font-weight: 600;
    transition: transform 0.2s;
  }

  .btn-primary:hover {
    transform: translateY(-2px);
    background: linear-gradient(45deg, #5a67d8, #6b46c1);
  }

  .btn-primary:disabled {
    opacity: 0.65;
    cursor: not-allowed;
    transform: none;
  }

  .tab-button {
    background: none;
    border: none;
    color: #6c757d;
    font-weight: 600;
    padding: 10px 20px;
    border-radius: 10px;
    transition: all 0.3s;
    cursor: pointer;
  }

  .tab-button.active {
    background: linear-gradient(45deg, #667eea, #764ba2);
    color: white;
  }

  .tab-button:not(.active):hover {
    background: rgba(102, 126, 234, 0.1);
  }

  .floating-label {
    position: relative;
  }

  .floating-label input {
    padding-top: 1.5rem;
    padding-bottom: 0.5rem;
  }

  .floating-label label {
    position: absolute;
    top: 0.75rem;
    left: 0.75rem;
    color: #6c757d;
    transition: all 0.3s;
    pointer-events: none;
  }

  .floating-label input:focus + label,
  .floating-label input:not(:placeholder-shown) + label {
    top: 0.25rem;
    font-size: 0.75rem;
    color: #667eea;
  }

  .alert {
    animation: fadeIn 0.3s ease-in;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>

<div class="container">
  <div class="row justify-content-center">
    <div class="col-md-6 col-lg-5">
      <div class="card login-card">
        <div class="card-body p-5">
          <!-- Header -->
          <div class="text-center mb-4">
            <div class="brand-logo">Email Sender</div>
            <p class="text-muted mt-2">Secure bulk email management</p>
          </div>

          <!-- Tab Navigation -->
          <div class="text-center mb-4">
            <button
              class="tab-button {activeTab === 'login' ? 'active' : ''} me-2"
              on:click={() => showTab('login')}
            >
              Sign In
            </button>
            <button
              class="tab-button {activeTab === 'register' ? 'active' : ''}"
              on:click={() => showTab('register')}
            >
              Sign Up
            </button>
          </div>

          <!-- Alert Container -->
          {#if alert}
            <div class="alert alert-{alert.type} alert-dismissible fade show" role="alert">
              {alert.message}
              <button type="button" class="btn-close" on:click={clearAlert}></button>
            </div>
          {/if}

          <!-- Login Form -->
          {#if activeTab === 'login'}
            <form on:submit={handleLogin}>
              <div class="floating-label mb-3">
                <input
                  type="email"
                  class="form-control"
                  id="loginEmail"
                  placeholder=" "
                  required
                  bind:value={loginForm.email}
                />
                <label for="loginEmail">
                  <i class="bi bi-envelope me-2"></i>Email Address
                </label>
              </div>

              <div class="floating-label mb-4">
                <input
                  type="password"
                  class="form-control"
                  id="loginPassword"
                  placeholder=" "
                  required
                  bind:value={loginForm.password}
                />
                <label for="loginPassword">
                  <i class="bi bi-lock me-2"></i>Password
                </label>
              </div>

              <button
                type="submit"
                class="btn btn-primary w-100"
                disabled={isLoading}
              >
                {#if !isLoading}
                  <i class="bi bi-box-arrow-in-right me-2"></i>Sign In
                {:else}
                  <span class="spinner-border spinner-border-sm me-2"></span>
                  Signing In...
                {/if}
              </button>
            </form>
          {/if}

          <!-- Register Form -->
          {#if activeTab === 'register'}
            <form on:submit={handleRegister}>
              <div class="floating-label mb-3">
                <input
                  type="text"
                  class="form-control"
                  id="registerName"
                  placeholder=" "
                  required
                  bind:value={registerForm.name}
                />
                <label for="registerName">
                  <i class="bi bi-person me-2"></i>Full Name
                </label>
              </div>

              <div class="floating-label mb-3">
                <input
                  type="email"
                  class="form-control"
                  id="registerEmail"
                  placeholder=" "
                  required
                  bind:value={registerForm.email}
                />
                <label for="registerEmail">
                  <i class="bi bi-envelope me-2"></i>Email Address
                </label>
              </div>

              <div class="floating-label mb-4">
                <input
                  type="password"
                  class="form-control"
                  id="registerPassword"
                  placeholder=" "
                  minlength="6"
                  required
                  bind:value={registerForm.password}
                />
                <label for="registerPassword">
                  <i class="bi bi-lock me-2"></i>Password (min 6 chars)
                </label>
              </div>

              <button
                type="submit"
                class="btn btn-primary w-100"
                disabled={isLoading}
              >
                {#if !isLoading}
                  <i class="bi bi-person-plus me-2"></i>Create Account
                {:else}
                  <span class="spinner-border spinner-border-sm me-2"></span>
                  Creating Account...
                {/if}
              </button>
            </form>
          {/if}

          <!-- Footer -->
          <div class="text-center mt-4">
            <small class="text-muted">
              Secure authentication with session management
            </small>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>