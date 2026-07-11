<script setup>
const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const handleLogin = async () => {
  if (!username.value || !password.value) {
    error.value = 'Please enter both username and password.'
    return
  }

  error.value = ''
  loading.value = true

  try {
    const res = await $fetch('/api/admin/login', {
      method: 'POST',
      body: {
        username: username.value,
        password: password.value
      }
    })

    if (res && res.success) {
      // Redirect to admin dashboard
      navigateTo('/admin')
    } else {
      error.value = res.error || 'Invalid credentials'
    }
  } catch (err) {
    error.value = err.data?.error || 'An unexpected error occurred'
  } finally {
    loading.value = false
  }
}

// Check if user is already logged in, redirect to dashboard
onMounted(async () => {
  try {
    const check = await $fetch('/api/admin/me')
    if (check && check.success) {
      navigateTo('/admin')
    }
  } catch (err) {
    // Not logged in, stay on login page
  }
})
</script>

<template>
  <div class="login-container">
    <div class="background-decorations">
      <div class="glow-orb orb-1"></div>
      <div class="glow-orb orb-2"></div>
    </div>

    <div class="glass-card login-card">
      <div class="login-header">
        <div class="logo-mark"></div>
        <h1>Cengkerik Admin</h1>
        <p>Access the content management system</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div v-if="error" class="login-error-alert">
          <span class="alert-icon">⚠️</span>
          <span class="alert-text">{{ error }}</span>
        </div>

        <div class="form-group">
          <label for="username">Username</label>
          <div class="input-wrapper">
            <input 
              id="username"
              type="text" 
              v-model="username" 
              placeholder="Enter username" 
              required
              :disabled="loading"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <div class="input-wrapper">
            <input 
              id="password"
              type="password" 
              v-model="password" 
              placeholder="Enter password" 
              required
              :disabled="loading"
            />
          </div>
        </div>

        <button type="submit" class="btn-login" :disabled="loading">
          <span v-if="loading" class="spinner-small"></span>
          <span v-else>Authenticate</span>
        </button>

        <NuxtLink to="/" class="back-home-link">&larr; Back to Portfolio</NuxtLink>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  position: relative;
  overflow: hidden;
  background-color: #030712;
}

/* Background Gradients */
.background-decorations {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.glow-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.15;
}

.orb-1 {
  width: 400px;
  height: 400px;
  background: #10b981;
  top: -100px;
  right: -100px;
}

.orb-2 {
  width: 500px;
  height: 500px;
  background: #8b5cf6;
  bottom: -200px;
  left: -200px;
}

/* Glass Card styling */
.login-card {
  width: 100%;
  max-width: 450px;
  background: rgba(17, 24, 39, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 40px;
  backdrop-filter: blur(16px);
  z-index: 2;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo-mark {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #10b981, #8b5cf6);
  border-radius: 12px;
  margin: 0 auto 16px;
  position: relative;
  box-shadow: 0 0 15px rgba(16, 185, 129, 0.3);
}

.login-header h1 {
  font-size: 26px;
  font-weight: 700;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #ffffff, #9ca3af);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.login-header p {
  color: #9ca3af;
  font-size: 14px;
}

/* Form Styles */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.login-error-alert {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  padding: 12px;
  color: #ef4444;
  font-size: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: #d1d5db;
}

.input-wrapper input {
  width: 100%;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px 16px;
  color: #ffffff;
  font-size: 15px;
  transition: all 0.2s ease;
}

.input-wrapper input:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.15);
}

.btn-login {
  background: linear-gradient(135deg, #10b981, #059669);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 14px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.btn-login:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 15px rgba(16, 185, 129, 0.3);
}

.btn-login:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.back-home-link {
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
  text-decoration: none;
  margin-top: 10px;
  transition: color 0.2s ease;
}

.back-home-link:hover {
  color: #ffffff;
}

.spinner-small {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s infinite linear;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
