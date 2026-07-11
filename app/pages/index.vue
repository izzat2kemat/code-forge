<script setup>
import staticProjects from '~/data/projects.json'
import staticArticles from '~/data/articles.json'

// Set SEO Meta
useSeoMeta({
  title: 'Cengkerik | AI Portfolio & Insights',
  description: 'Explore autonomous AI agents, local RAG systems, and edge computer vision. Read articles on LLM architectures, fine-tuning, and WebGPU.',
  ogTitle: 'Cengkerik | AI Portfolio & Insights',
  ogDescription: 'Explore autonomous AI agents, local RAG systems, and edge computer vision. Read articles on LLM architectures, fine-tuning, and WebGPU.',
  ogImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
  twitterCard: 'summary_large_image'
})

// Static data (embedded at build time – works on Wasmer and all static hosts)
const projects = ref(staticProjects)
const articles = ref(staticArticles)

// No DB error on static deployment
const isDbError = ref(false)
const dbErrorMessage = ref('')

// Smooth scrolling helpers
const scrollToSection = (id) => {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>


<template>
  <div class="cengkerik-app">
    <!-- Interactive Background Particles -->
    <StarfieldCanvas />

    <!-- Sticky Glassmorphic Navbar -->
    <nav class="navbar">
      <div class="container nav-wrapper">
        <a href="#" class="brand" @click.prevent="scrollToSection('hero')">
          <span class="brand-icon"></span>
          Cengkerik
        </a>
        <ul class="nav-links">
          <li><a href="#projects" class="nav-link" @click.prevent="scrollToSection('projects')">Projects</a></li>
          <li><a href="#articles" class="nav-link" @click.prevent="scrollToSection('articles')">Articles</a></li>
          <li><a href="#contact" class="nav-link" @click.prevent="scrollToSection('contact')">Contact</a></li>
          <li><a href="https://wasmer.io/izzat2kemat" target="_blank" rel="noopener" class="nav-link wasmer-link">Wasmer</a></li>
        </ul>
      </div>
    </nav>

    <div class="container">
      <!-- Database Connection Status Warning -->
      <div v-if="isDbError" class="db-error-alert glass-card">
        <div class="alert-icon">⚠️</div>
        <div class="alert-content">
          <h3>Database Configuration Warning</h3>
          <p>The application encountered an error trying to connect to MySQL: <code>{{ dbErrorMessage }}</code></p>
          <p class="alert-help">Please make sure your MySQL service (e.g. XAMPP Control Panel) is running on port 3306 and that the <strong>cengkerik</strong> database is created or accessible.</p>
        </div>
      </div>

      <!-- Hero Section -->
      <header id="hero" class="hero">
        <div class="hero-badge">
          <span class="hero-badge-status"></span>
          Active AI Research & Development
        </div>
        <h1 class="hero-title">
          Hi, I'm Izzat. I build <br />
          <span>Autonomous AI Solutions</span>
        </h1>
        <p class="hero-desc">
          Showcasing intelligent agents, local retrieval-augmented generation models, and high-performance edge vision systems. Powered by Nuxt and MySQL.
        </p>
        <div class="hero-actions">
          <button class="btn btn-primary" @click="scrollToSection('projects')">Explore Projects</button>
          <button class="btn btn-secondary" @click="scrollToSection('articles')">Read Articles</button>
        </div>
      </header>

      <!-- Stats Bar -->
      <div class="stats-bar glass-card">
        <div class="stat-item">
          <div class="stat-val">3+</div>
          <div class="stat-label">AI Projects</div>
        </div>
        <div class="stat-item">
          <div class="stat-val">3+</div>
          <div class="stat-label">Tech Articles</div>
        </div>
        <div class="stat-item">
          <div class="stat-val">2024+</div>
          <div class="stat-label">Active Since</div>
        </div>
      </div>

      <div class="section-divider"></div>

      <!-- Projects Section -->
      <section id="projects">
        <h2 class="section-title">Portfolio Projects</h2>
        <p class="section-subtitle">A curated collection of my research implementations and AI applications.</p>
        
        <!-- Empty State -->
        <div v-if="projects.length === 0" class="empty-state glass-card">
          <p>No projects available at this time.</p>
        </div>

        <!-- Projects Grid -->
        <div v-else class="grid-portfolio">
          <div v-for="project in projects" :key="project.id" class="glass-card project-card">
            <img :src="project.image_url" :alt="project.title" class="project-img" />
            <div class="project-tags">
              <span v-for="tag in (project.tags ? project.tags.split(',') : [])" :key="tag" class="project-tag">
                {{ tag.trim() }}
              </span>
            </div>
            <h3 class="project-title">{{ project.title }}</h3>
            <p class="project-desc">{{ project.description }}</p>
            <div class="project-links">
              <a v-if="project.github_url" :href="project.github_url" target="_blank" rel="noopener" class="project-link project-link-sec">
                GitHub ↗
              </a>
              <a v-if="project.demo_url" :href="project.demo_url" target="_blank" rel="noopener" class="project-link project-link-primary">
                Live Demo ↗
              </a>
            </div>
          </div>
        </div>
      </section>

      <div class="section-divider"></div>

      <!-- Articles Section -->
      <section id="articles">
        <h2 class="section-title">AI Articles & Logs</h2>
        <p class="section-subtitle">Technical deep-dives into agentic orchestration, fine-tuning methodologies, and WebGPU optimization.</p>
        
        <!-- Empty State -->
        <div v-if="articles.length === 0" class="empty-state glass-card">
          <p>No articles available at this time.</p>
        </div>

        <!-- Articles Grid -->
        <div v-else class="grid-articles">
          <article v-for="article in articles" :key="article.id" class="glass-card article-card">
            <div class="article-meta">
              <span class="article-category">{{ article.category }}</span>
              <span class="article-read-time">{{ article.read_time }}</span>
            </div>
            <h3 class="article-title">{{ article.title }}</h3>
            <p class="article-summary">{{ article.summary }}</p>
            <a href="#" class="article-more" @click.prevent>Read Article &rarr;</a>
          </article>
        </div>
      </section>

      <div class="section-divider"></div>

      <!-- Contact/Newsletter Section -->
      <section id="contact" class="glass-card contact-section">
        <div class="contact-content">
          <h2>Let's Collaborate</h2>
          <p>Interested in deploying state-of-the-art AI systems or local model solutions? Get in touch to discuss consulting opportunities or custom integrations.</p>
          <div class="contact-details">
            <a href="mailto:izzat@cengkerik.ai" class="contact-email">izzat@cengkerik.ai</a>
            <div style="margin-top: 16px;">
              <a href="https://wasmer.io/izzat2kemat" target="_blank" rel="noopener" class="contact-link-wasmer">Find me on Wasmer ↗</a>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-logo">Cengkerik</div>
      <p>&copy; {{ new Date().getFullYear() }} Cengkerik AI. Powered by Nuxt 3 &amp; MySQL. All rights reserved.</p>
    </footer>
  </div>
</template>

<style scoped>
/* Scoped custom styling for unique elements not in main.css */
.cengkerik-app {
  min-height: 100vh;
}

/* Alert Styling */
.db-error-alert {
  display: flex;
  gap: 20px;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.25);
  margin-top: 32px;
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.05);
}

.db-error-alert:hover {
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.4);
  transform: none;
  box-shadow: 0 0 25px rgba(239, 68, 68, 0.1);
}

.alert-icon {
  font-size: 24px;
}

.alert-content h3 {
  color: #f87171;
  font-size: 18px;
  margin-bottom: 8px;
}

.alert-content p {
  color: var(--text-muted);
  font-size: 14px;
}

.alert-content code {
  background: rgba(0, 0, 0, 0.3);
  padding: 2px 6px;
  border-radius: 4px;
  color: #f87171;
  font-family: monospace;
}

.alert-help {
  margin-top: 8px;
  font-weight: 500;
  color: var(--text-primary) !important;
}

/* Contact Section */
.contact-section {
  text-align: center;
  padding: 60px 40px;
  background: linear-gradient(135deg, var(--bg-card), rgba(139, 92, 246, 0.05));
  border-color: rgba(139, 92, 246, 0.15);
  max-width: 800px;
  margin: 0 auto;
}

.contact-section:hover {
  border-color: rgba(139, 92, 246, 0.35);
  box-shadow: var(--violet-glow);
}

.contact-section h2 {
  font-size: 32px;
  margin-bottom: 16px;
  background: linear-gradient(135deg, var(--text-primary), var(--secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.contact-section p {
  color: var(--text-muted);
  max-width: 500px;
  margin: 0 auto 32px;
}

.contact-email {
  font-size: 20px;
  font-family: var(--font-heading);
  font-weight: 700;
  color: var(--primary);
  text-decoration: underline;
}

.contact-email:hover {
  color: var(--accent);
  text-shadow: 0 0 10px rgba(6, 182, 212, 0.4);
}

.wasmer-link {
  color: var(--secondary) !important;
}

.wasmer-link:hover {
  text-shadow: 0 0 10px rgba(139, 92, 246, 0.4);
}

.contact-link-wasmer {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--secondary);
  font-weight: 600;
  font-size: 16px;
  transition: var(--transition-smooth);
}

.contact-link-wasmer:hover {
  color: var(--text-primary);
  text-shadow: 0 0 10px rgba(139, 92, 246, 0.4);
}

/* Loading / Empty state */
.loading-state, .empty-state {
  text-align: center;
  padding: 48px;
  color: var(--text-muted);
}

.spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(16, 185, 129, 0.1);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s infinite linear;
  vertical-align: middle;
  margin-right: 8px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
