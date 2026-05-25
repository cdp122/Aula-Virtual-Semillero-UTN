<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'
import apolloClient from '../graphql/client.js'
import { OBTENER_USUARIO_POR_ID } from '../graphql/queries.js'

const router = useRouter()
const route = useRoute()
const { usuario, nombreUsuario, cerrarSesion } = useAuth()

const hijos = ref([])
const cargandoHijos = ref(false)

const estaHijoSeleccionado = computed(() => !!route.params.id)

const iniciales = computed(() => {
  if (!nombreUsuario.value) return '?'
  const parts = nombreUsuario.value.split(' ')
  return parts.slice(0, 2).map(p => p[0]?.toUpperCase() || '').join('')
})

async function cargarHijos() {
  if (!usuario.value?.hijos?.length) return
  cargandoHijos.value = true
  try {
    const resultados = await Promise.all(
      usuario.value.hijos.map(id =>
        apolloClient.query({
          query: OBTENER_USUARIO_POR_ID,
          variables: { id }
        }).then(r => r.data.usuarioPorId).catch(() => null)
      )
    )
    hijos.value = resultados.filter(Boolean)
  } catch (err) {
    console.error("Error al cargar hijos en navbar", err)
  } finally {
    cargandoHijos.value = false
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
          <div class="navbar-brand" @click="router.push('/familia')" style="cursor: pointer;">
            <div class="brand-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            </div>
            <span>Semilleros <span class="accent">UTN</span></span>
          </div>
          <div class="navbar-right">
            <!-- Selector de hijos si hay más de uno y uno está seleccionado -->
            <div v-if="hijos.length > 1 && estaHijoSeleccionado" class="hijo-switcher-container">
              <svg class="switcher-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              <select class="switcher-select" :value="route.params.id" @change="e => e.target.value && router.push(`/familia/hijo/${e.target.value}`)">
                <option value="" disabled>Cambiar de hijo...</option>
                <option v-for="h in hijos" :key="h._id" :value="h._id">
                  {{ h.nombre }}
                </option>
              </select>
            </div>

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
      <router-view :key="route.params.id" />
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
  gap: 16px;
}

.hijo-switcher-container {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 4px 8px;
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}

.hijo-switcher-container:hover {
  border-color: var(--border-color-hover);
  background: var(--bg-glass-hover);
}

.switcher-icon {
  color: var(--accent-400);
  flex-shrink: 0;
}

.switcher-select {
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: 0.82rem;
  font-weight: 600;
  outline: none;
  cursor: pointer;
  padding-right: 4px;
}

.switcher-select option {
  background: var(--bg-surface);
  color: var(--text-primary);
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
  .navbar-right {
    gap: 8px;
  }
}
</style>
