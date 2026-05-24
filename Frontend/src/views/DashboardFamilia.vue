<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'

const router = useRouter()
const { nombreUsuario, cerrarSesion } = useAuth()

const iniciales = computed(() => {
  if (!nombreUsuario.value) return '?'
  const parts = nombreUsuario.value.split(' ')
  return parts.slice(0, 2).map(p => p[0]?.toUpperCase() || '').join('')
})

function handleLogout() {
  cerrarSesion()
  router.push('/')
}
</script>

<template>
  <div class="dashboard-familia">
    <!-- Navbar -->
    <nav class="familia-navbar">
      <div class="container">
        <div class="navbar-inner">
          <div class="navbar-brand" @click="router.push('/familia')" style="cursor: pointer;">
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
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.dashboard-familia {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
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

.familia-main {
  padding-top: 32px;
  padding-bottom: 48px;
  flex: 1;
}

@media (max-width: 640px) {
  .familia-main {
    padding-top: 24px;
  }
}
</style>
