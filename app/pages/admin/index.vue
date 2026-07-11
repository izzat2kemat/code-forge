<script setup>
const articles = ref([])
const users = ref([])
const currentUser = ref(null)
const activeTab = ref('articles') // 'articles' | 'users'
const loading = ref(true)

// Modals state
const showArticleModal = ref(false)
const showUserModal = ref(false)
const isSaving = ref(false)

// Article Form
const articleForm = ref({
  id: null,
  title: '',
  summary: '',
  content: '',
  image_url: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=800&q=80',
  read_time: '5 min read',
  category: 'AI'
})

// User Form
const userForm = ref({
  username: '',
  password: '',
  role: 'editor'
})

// Load everything
const fetchAllData = async () => {
  loading.value = true
  try {
    // 1. Verify Authentication & Role
    const meRes = await $fetch('/api/admin/me')
    if (meRes && meRes.success) {
      currentUser.value = meRes.user
    } else {
      navigateTo('/admin/login')
      return
    }

    // 2. Load Articles
    const articlesRes = await $fetch('/api/articles')
    if (articlesRes && articlesRes.success) {
      articles.value = articlesRes.data
    }

    // 3. Load Users
    const usersRes = await $fetch('/api/admin/users')
    if (usersRes && usersRes.success) {
      users.value = usersRes.data
    }
  } catch (err) {
    console.error('Auth verification failed. Redirecting to login...', err)
    navigateTo('/admin/login')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchAllData()
})

// Article Handlers
const openCreateArticle = () => {
  articleForm.value = {
    id: null,
    title: '',
    summary: '',
    content: '',
    image_url: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=800&q=80',
    read_time: '5 min read',
    category: 'AI'
  }
  showArticleModal.value = true
}

const openEditArticle = (article) => {
  articleForm.value = { ...article }
  showArticleModal.value = true
}

const saveArticle = async () => {
  if (!articleForm.value.title || !articleForm.value.summary || !articleForm.value.content) {
    alert('Please fill out all required fields.')
    return
  }

  isSaving.value = true
  try {
    const isEdit = !!articleForm.value.id
    const endpoint = isEdit ? '/api/admin/articles/update' : '/api/admin/articles/create'
    const method = isEdit ? 'PUT' : 'POST'

    const res = await $fetch(endpoint, {
      method,
      body: articleForm.value
    })

    if (res && res.success) {
      showArticleModal.value = false
      await fetchAllData()
    } else {
      alert(res.error || 'Failed to save article')
    }
  } catch (err) {
    alert(err.data?.error || 'Error saving article')
  } finally {
    isSaving.value = false
  }
}

const deleteArticle = async (id) => {
  if (!confirm('Are you sure you want to delete this article? This action is permanent.')) {
    return
  }

  try {
    const res = await $fetch('/api/admin/articles/delete', {
      method: 'DELETE',
      body: { id }
    })

    if (res && res.success) {
      await fetchAllData()
    } else {
      alert(res.error || 'Failed to delete article')
    }
  } catch (err) {
    alert(err.data?.error || 'Error deleting article')
  }
}

// User Handlers
const openCreateUser = () => {
  userForm.value = {
    username: '',
    password: '',
    role: 'editor'
  }
  showUserModal.value = true
}

const saveUser = async () => {
  if (!userForm.value.username || !userForm.value.password || !userForm.value.role) {
    alert('Please fill out all user fields.')
    return
  }

  isSaving.value = true
  try {
    const res = await $fetch('/api/admin/users', {
      method: 'POST',
      body: userForm.value
    })

    if (res && res.success) {
      showUserModal.value = false
      await fetchAllData()
    } else {
      alert(res.error || 'Failed to create user')
    }
  } catch (err) {
    alert(err.data?.error || 'Error creating user')
  } finally {
    isSaving.value = false
  }
}

const deleteUser = async (id) => {
  if (!confirm('Are you sure you want to delete this user?')) {
    return
  }

  try {
    const res = await $fetch('/api/admin/users', {
      method: 'DELETE',
      body: { id }
    })

    if (res && res.success) {
      await fetchAllData()
    } else {
      alert(res.error || 'Failed to delete user')
    }
  } catch (err) {
    alert(err.data?.error || 'Error deleting user')
  }
}

// Logout Handler
const handleLogout = async () => {
  try {
    await $fetch('/api/admin/logout', { method: 'POST' })
    navigateTo('/admin/login')
  } catch (err) {
    console.error('Logout error:', err)
  }
}
</script>

<template>
  <div class="dashboard-wrapper">
    <!-- Navbar -->
    <header class="dashboard-header glass-card">
      <div class="header-logo">
        <span class="logo-dot"></span>
        <h1>Cengkerik Control Panel</h1>
      </div>
      <div class="header-profile" v-if="currentUser">
        <div class="profile-details">
          <span class="profile-name">{{ currentUser.username }}</span>
          <span class="profile-role" :class="currentUser.role">{{ currentUser.role.toUpperCase() }}</span>
        </div>
        <button @click="handleLogout" class="btn-logout">Logout</button>
      </div>
    </header>

    <!-- Main Content -->
    <div class="dashboard-container" v-if="!loading">
      <div class="dashboard-grid">
        <!-- Main Panel (Left) -->
        <main class="main-panel glass-card">
          <!-- Tab Navigation -->
          <div class="tabs-nav">
            <button 
              @click="activeTab = 'articles'" 
              class="tab-btn" 
              :class="{ active: activeTab === 'articles' }"
            >
              Manage Articles ({{ articles.length }})
            </button>
            <button 
              @click="activeTab = 'users'" 
              class="tab-btn" 
              :class="{ active: activeTab === 'users' }"
            >
              System Users ({{ users.length }})
            </button>
          </div>

          <!-- Articles Management Tab -->
          <div v-if="activeTab === 'articles'" class="tab-content">
            <div class="tab-header">
              <h2>Articles Directory</h2>
              <button @click="openCreateArticle" class="btn-action btn-add-new">+ Create Article</button>
            </div>

            <div v-if="articles.length === 0" class="empty-state">
              <p>No articles found in the database. Seeding may not have run.</p>
            </div>

            <div v-else class="table-container">
              <table class="dashboard-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Read Time</th>
                    <th>Published At</th>
                    <th class="actions-col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="article in articles" :key="article.id">
                    <td class="td-title font-semibold">{{ article.title }}</td>
                    <td><span class="badge-category">{{ article.category }}</span></td>
                    <td>{{ article.read_time }}</td>
                    <td class="text-muted">{{ new Date(article.published_at).toLocaleDateString() }}</td>
                    <td class="actions-col">
                      <div class="action-buttons-group">
                        <button @click="openEditArticle(article)" class="btn-table btn-edit">Edit</button>
                        <button 
                          v-if="currentUser?.role === 'admin'"
                          @click="deleteArticle(article.id)" 
                          class="btn-table btn-delete"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- User Management Tab -->
          <div v-if="activeTab === 'users'" class="tab-content">
            <div class="tab-header">
              <h2>Users Directory</h2>
              <button 
                v-if="currentUser?.role === 'admin'" 
                @click="openCreateUser" 
                class="btn-action btn-add-new"
              >
                + Add User
              </button>
              <div v-else class="editor-warning-inline">
                ⚠️ Only Admins can register new users
              </div>
            </div>

            <div class="table-container">
              <table class="dashboard-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Created At</th>
                    <th class="actions-col" v-if="currentUser?.role === 'admin'">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in users" :key="user.id">
                    <td class="font-semibold">{{ user.username }}</td>
                    <td>
                      <span class="profile-role" :class="user.role">{{ user.role.toUpperCase() }}</span>
                    </td>
                    <td class="text-muted">{{ new Date(user.created_at).toLocaleDateString() }}</td>
                    <td class="actions-col" v-if="currentUser?.role === 'admin'">
                      <button 
                        @click="deleteUser(user.id)" 
                        class="btn-table btn-delete"
                        :disabled="user.id === currentUser?.id"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>

        <!-- Sidebar Panel (Right) -->
        <aside class="sidebar-panel">
          <!-- Permissions Visualizer Card -->
          <div class="glass-card permissions-card" v-if="currentUser">
            <h3>Role &amp; Permissions</h3>
            <p class="role-display-desc">
              Your account is authenticated under the <strong :class="currentUser.role">{{ currentUser.role }}</strong> role.
            </p>
            <div class="permissions-checklist">
              <div class="permission-item check">
                <span class="perm-icon">✓</span>
                <span class="perm-label">View articles directory</span>
              </div>
              <div class="permission-item check">
                <span class="perm-icon">✓</span>
                <span class="perm-label">Create new articles</span>
              </div>
              <div class="permission-item check">
                <span class="perm-icon">✓</span>
                <span class="perm-label">Edit existing articles</span>
              </div>
              <div class="permission-item" :class="currentUser.role === 'admin' ? 'check' : 'cross'">
                <span class="perm-icon">{{ currentUser.role === 'admin' ? '✓' : '✗' }}</span>
                <span class="perm-label">Delete technical articles</span>
              </div>
              <div class="permission-item" :class="currentUser.role === 'admin' ? 'check' : 'cross'">
                <span class="perm-icon">{{ currentUser.role === 'admin' ? '✓' : '✗' }}</span>
                <span class="perm-label">Register system accounts</span>
              </div>
              <div class="permission-item" :class="currentUser.role === 'admin' ? 'check' : 'cross'">
                <span class="perm-icon">{{ currentUser.role === 'admin' ? '✓' : '✗' }}</span>
                <span class="perm-label">Delete system accounts</span>
              </div>
            </div>
            <div class="info-alert" v-if="currentUser.role === 'editor'">
              ℹ️ To delete articles or manage users, authenticate with the <strong>admin</strong> role account.
            </div>
          </div>

          <!-- Quick Actions/Navigation -->
          <div class="glass-card nav-quick-card">
            <h3>Quick Links</h3>
            <div class="quick-links-list">
              <NuxtLink to="/" target="_blank" class="quick-link">View Portfolio Site ↗</NuxtLink>
              <a href="https://wasmer.io" target="_blank" class="quick-link">Wasmer Dashboard ↗</a>
            </div>
          </div>
        </aside>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-else class="dashboard-loading container">
      <div class="spinner"></div>
      <p>Synchronizing authentication keys and content databases...</p>
    </div>

    <!-- Article Create/Edit Modal -->
    <div class="modal-backdrop" v-if="showArticleModal">
      <div class="modal-content glass-card large-modal">
        <div class="modal-header">
          <h2>{{ articleForm.id ? 'Modify Technical Article' : 'Draft New Article' }}</h2>
          <button @click="showArticleModal = false" class="btn-close">&times;</button>
        </div>

        <form @submit.prevent="saveArticle" class="modal-form">
          <div class="form-grid">
            <div class="form-group span-2">
              <label for="art-title">Article Title *</label>
              <input id="art-title" type="text" v-model="articleForm.title" required placeholder="e.g. Fine-Tuning vs RAG: Choosing Your LLM Strategy" />
            </div>

            <div class="form-group">
              <label for="art-category">Category *</label>
              <input id="art-category" type="text" v-model="articleForm.category" required placeholder="e.g. Agentic AI, Architecture" />
            </div>

            <div class="form-group">
              <label for="art-readtime">Read Time *</label>
              <input id="art-readtime" type="text" v-model="articleForm.read_time" required placeholder="e.g. 5 min read" />
            </div>

            <div class="form-group span-2">
              <label for="art-image">Cover Image URL *</label>
              <input id="art-image" type="text" v-model="articleForm.image_url" required placeholder="Unsplash/CDN url" />
            </div>

            <div class="form-group span-2">
              <label for="art-summary">Brief Summary (displays in grid) *</label>
              <textarea id="art-summary" rows="2" v-model="articleForm.summary" required placeholder="Short 1-2 sentence description of the article."></textarea>
            </div>

            <div class="form-group span-2">
              <label for="art-content">Full Body Content *</label>
              <textarea id="art-content" rows="8" v-model="articleForm.content" required placeholder="Write the complete technical description, logs, or analysis here. Support paragraphs."></textarea>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" @click="showArticleModal = false" class="btn-sec">Cancel</button>
            <button type="submit" class="btn-primary" :disabled="isSaving">
              {{ isSaving ? 'Saving...' : 'Save Draft' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- User Create Modal -->
    <div class="modal-backdrop" v-if="showUserModal">
      <div class="modal-content glass-card small-modal">
        <div class="modal-header">
          <h2>Create System User</h2>
          <button @click="showUserModal = false" class="btn-close">&times;</button>
        </div>

        <form @submit.prevent="saveUser" class="modal-form">
          <div class="form-group">
            <label for="user-username">Username *</label>
            <input id="user-username" type="text" v-model="userForm.username" required placeholder="Enter username" />
          </div>

          <div class="form-group">
            <label for="user-password">Initial Password *</label>
            <input id="user-password" type="password" v-model="userForm.password" required placeholder="Enter password" />
          </div>

          <div class="form-group">
            <label for="user-role">Assigned Access Role *</label>
            <select id="user-role" v-model="userForm.role" required>
              <option value="editor">Editor (Create & Edit Content)</option>
              <option value="admin">Administrator (Full Control)</option>
            </select>
          </div>

          <div class="modal-actions">
            <button type="button" @click="showUserModal = false" class="btn-sec">Cancel</button>
            <button type="submit" class="btn-primary" :disabled="isSaving">
              {{ isSaving ? 'Creating...' : 'Register User' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-wrapper {
  min-height: 100vh;
  padding: 40px 24px;
  background-color: #030712;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 32px;
  border-radius: 12px;
  margin-bottom: 32px;
  background: rgba(17, 24, 39, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.header-logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-dot {
  width: 10px;
  height: 10px;
  background-color: #10b981;
  border-radius: 50%;
  box-shadow: 0 0 10px #10b981;
}

.header-logo h1 {
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(135deg, #ffffff, #9ca3af);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.header-profile {
  display: flex;
  align-items: center;
  gap: 20px;
}

.profile-details {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.profile-name {
  font-size: 14px;
  font-weight: 600;
}

.profile-role {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.profile-role.admin {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.profile-role.editor {
  background: rgba(139, 92, 246, 0.1);
  color: #a78bfa;
  border: 1px solid rgba(139, 92, 246, 0.3);
}

.btn-logout {
  background: transparent;
  color: #f3f4f6;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  padding: 6px 14px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-logout:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: #ef4444;
  color: #ef4444;
}

/* Container Grid */
.dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 32px;
}

.main-panel {
  background: rgba(17, 24, 39, 0.4);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 24px;
}

.sidebar-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Tabs */
.tabs-nav {
  display: flex;
  gap: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 16px;
  margin-bottom: 24px;
}

.tab-btn {
  background: transparent;
  border: none;
  color: #9ca3af;
  font-size: 15px;
  font-weight: 600;
  padding: 8px 16px;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.04);
}

.tab-btn.active {
  color: #10b981;
  background: rgba(16, 185, 129, 0.08);
  box-shadow: inset 0 0 0 1px rgba(16, 185, 129, 0.2);
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.tab-header h2 {
  font-size: 18px;
  font-weight: 700;
}

.editor-warning-inline {
  font-size: 13px;
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.08);
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.btn-action {
  background: #10b981;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  padding: 8px 18px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 10px rgba(16, 185, 129, 0.2);
}

.btn-action:hover {
  background: #059669;
  transform: translateY(-1px);
}

/* Dashboard Table */
.table-container {
  overflow-x: auto;
}

.dashboard-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.dashboard-table th {
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  color: #9ca3af;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.dashboard-table td {
  padding: 16px;
  font-size: 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.td-title {
  max-width: 320px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.badge-category {
  background: rgba(255, 255, 255, 0.05);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  color: #e5e7eb;
}

.actions-col {
  text-align: right;
}

.action-buttons-group {
  display: inline-flex;
  gap: 8px;
}

.btn-table {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: transparent;
}

.btn-edit {
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #ffffff;
}

.btn-edit:hover {
  background: rgba(255, 255, 255, 0.08);
}

.btn-delete {
  border: 1px solid rgba(239, 68, 68, 0.25);
  color: #ef4444;
}

.btn-delete:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.1);
  border-color: #ef4444;
}

.btn-delete:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Sidebar Cards */
.permissions-card, .nav-quick-card {
  padding: 24px;
  background: rgba(17, 24, 39, 0.5);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
}

.permissions-card h3, .nav-quick-card h3 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 12px;
  color: #ffffff;
}

.role-display-desc {
  font-size: 13px;
  color: #9ca3af;
  margin-bottom: 16px;
  line-height: 1.5;
}

.permissions-checklist {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.permission-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
}

.permission-item.check .perm-icon {
  color: #10b981;
  font-weight: bold;
}

.permission-item.cross .perm-icon {
  color: #ef4444;
  font-weight: bold;
}

.permission-item.cross .perm-label {
  color: #6b7280;
  text-decoration: line-through;
}

.info-alert {
  background: rgba(59, 130, 246, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 8px;
  padding: 10px;
  font-size: 12px;
  color: #93c5fd;
  line-height: 1.4;
}

.quick-links-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quick-link {
  color: #10b981;
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
  transition: color 0.2s;
}

.quick-link:hover {
  color: #059669;
  text-decoration: underline;
}

/* Modals */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(3, 7, 18, 0.6);
  backdrop-filter: blur(8px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.modal-content {
  background: rgba(17, 24, 39, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 32px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  animation: modalScaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalScaleUp {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.large-modal {
  width: 100%;
  max-width: 800px;
}

.small-modal {
  width: 100%;
  max-width: 450px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.modal-header h2 {
  font-size: 20px;
  font-weight: 700;
}

.btn-close {
  background: transparent;
  border: none;
  color: #9ca3af;
  font-size: 24px;
  cursor: pointer;
}

.btn-close:hover {
  color: #ffffff;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.span-2 {
  grid-column: span 2;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: #d1d5db;
}

.form-group input, .form-group textarea, .form-group select {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 10px 14px;
  color: #ffffff;
  font-size: 14px;
}

.form-group input:focus, .form-group textarea:focus, .form-group select:focus {
  outline: none;
  border-color: #10b981;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 12px;
}

.btn-sec {
  background: transparent;
  color: #e5e7eb;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.btn-sec:hover {
  background: rgba(255, 255, 255, 0.05);
}

.btn-primary {
  background: #10b981;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary:hover {
  background: #059669;
}

/* Loading Panel */
.dashboard-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(16, 185, 129, 0.1);
  border-top-color: #10b981;
  border-radius: 50%;
  animation: spin 1s infinite linear;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #6b7280;
}
</style>
