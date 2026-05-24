<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'
import apolloClient from '../graphql/client.js'
import { OBTENER_USUARIO_POR_ID } from '../graphql/queries.js'

const router = useRouter()
const { usuario, nombreUsuario, cerrarSesion } = useAuth()

const hijos = ref([])
const cargando = ref(true)

const iniciales = computed(() => {
  if (!nombreUsuario.value) return '?'
  const parts = nombreUsuario.value.split(' ')
  return parts.slice(0, 2).map(p => p[0]?.toUpperCase() || '').join('')
})

async function cargarHijos() {
  cargando.value = true
  try {
    const idsHijos = usuario.value?.hijos || []
    const resultados = await Promise.all(
      idsHijos.map(id =>
        apolloClient.query({
          query: OBTENER_USUARIO_POR_ID,
          variables: { id }
        }).then(r => r.data.usuarioPorId).catch(() => null)
      )
    )
    hijos.value = resultados.filter(Boolean)
  } catch (err) {
    console.error(err)
  } finally {
    cargando.value = false
  }
}

function handleLogout() {
  cerrarSesion()
  router.push('/')
}

onMounted(cargarHijos)
</script>

<template>
  <div class="dashboard-familia">
    <!-- Navbar -->
    <nav class="familia-navbar">
      <div class="container">
        <div class="navbar-inner">
          <div class="navbar-brand">
            <div class="brand-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            </div>
            <span>Semilleros <span class="accent">UTN</span></span>
          </div>
          <div class="navbar-right">
            <div class="user-badge">
              <div class="user-avatar">{{ iniciales }}</div>
              <span class="hide-mobile">{{ nombreUsuario }}</span>
            </div>
            <button class="btn btn-ghost btn-sm" @click="handleLogout">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              <span class="hide-mobile">Salir</span>
            </button>
          </div>
        </div>
      </div>
    </nav>

    <main class="familia-main container">
      <!-- Welcome -->
      <div class="welcome-section animate-fade-in">
        <div class="welcome-avatar">{{ iniciales }}</div>
        <h1>Bienvenido, <span class="gradient-text">{{ nombreUsuario.split(' ')[0] }}</span></h1>
        <p>Panel de seguimiento familiar</p>
      </div>

      <!-- Hijos -->
      <section class="hijos-section animate-slide-up">
        <h2>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          Mis Hijos
        </h2>

        <div v-if="cargando" class="loading-state">
          <div class="spinner"></div>
          <p>Cargando...</p>
        </div>

        <div v-else-if="hijos.length === 0" class="empty-children">
          <p>No se encontraron hijos vinculados a tu cuenta.</p>
        </div>

        <div v-else class="hijos-grid">
          <div v-for="hijo in hijos" :key="hijo._id" class="hijo-card">
            <div class="hijo-avatar">{{ hijo.nombre?.[0]?.toUpperCase() || '?' }}</div>
            <div class="hijo-info">
              <h3>{{ hijo.nombre }}</h3>
              <span class="badge badge-primary">Estudiante</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Próximamente -->
      <section class="proximamente animate-slide-up">
        <div class="prox-card">
          <div class="prox-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <h3>Próximamente</h3>
          <p>Seguimiento de actividades, progreso por niveles de logro y actividades para el hogar.</p>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.dashboard-familia {
  min-height: 100vh;
}

/* ═══ NAVBAR ═══ */
.familia-navbar {
  background: rgba(11,15,26,0.9);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 50;
}

.navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: 1.05rem;
}

.brand-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-accent);
  border-radius: var(--radius-sm);
  color: var(--gray-900);
}

.accent {
  color: var(--accent-400);
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.88rem;
  color: var(--text-secondary);
}

.user-avatar {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-accent);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--gray-900);
}

/* ═══ WELCOME ═══ */
.familia-main {
  padding-top: 48px;
  padding-bottom: 48px;
}

.welcome-section {
  text-align: center;
  margin-bottom: 48px;
}

.welcome-avatar {
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-accent);
  border-radius: var(--radius-lg);
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--gray-900);
  margin: 0 auto 20px;
}

.welcome-section h1 {
  font-size: 2rem;
  margin-bottom: 8px;
}

.welcome-section p {
  font-size: 1rem;
  color: var(--text-muted);
}

.gradient-text {
  background: linear-gradient(135deg, var(--accent-400), var(--primary-400));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* ═══ HIJOS ═══ */
.hijos-section {
  margin-bottom: 36px;
}

.hijos-section h2 {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.2rem;
  margin-bottom: 20px;
}

.hijos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.hijo-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 22px;
  background: var(--bg-card);
  backdrop-filter: blur(16px);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
}

.hijo-card:hover {
  border-color: var(--accent-500);
  box-shadow: var(--shadow-md);
}

.hijo-avatar {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(252,196,25,0.12);
  color: var(--accent-400);
  border-radius: var(--radius-md);
  font-size: 1.2rem;
  font-weight: 800;
  flex-shrink: 0;
}

.hijo-info h3 {
  font-size: 1rem;
  margin-bottom: 4px;
}

.empty-children {
  text-align: center;
  padding: 40px;
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
}

.loading-state {
  text-align: center;
  padding: 40px;
}
.loading-state .spinner {
  margin: 0 auto 12px;
}

/* ═══ PROXIMAMENTE ═══ */
.prox-card {
  text-align: center;
  padding: 48px 32px;
  background: var(--gradient-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
}

.prox-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(76,110,245,0.12);
  color: var(--primary-400);
  border-radius: 50%;
  margin: 0 auto 16px;
}

.prox-card h3 {
  font-size: 1.3rem;
  margin-bottom: 10px;
}

.prox-card p {
  max-width: 400px;
  margin: 0 auto;
  font-size: 0.92rem;
}

@media (max-width: 640px) {
  .welcome-section h1 {
    font-size: 1.5rem;
  }
  .hijos-grid {
    grid-template-columns: 1fr;
  }
}
</style>
