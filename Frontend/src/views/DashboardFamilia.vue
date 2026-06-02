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

const hijoActual = computed(() =>
  hijos.value.find(h => h._id === route.params.id) || null
)

const iniciales = computed(() => {
  if (!nombreUsuario.value) return '?'
  return nombreUsuario.value.split(' ').slice(0, 2).map(p => p[0]?.toUpperCase() || '').join('')
})

async function cargarHijos() {
  if (!usuario.value?.hijos?.length) return
  cargandoHijos.value = true
  try {
    const resultados = await Promise.all(
      usuario.value.hijos.map(id =>
        apolloClient.query({ query: OBTENER_USUARIO_POR_ID, variables: { id } })
          .then(r => r.data.usuarioPorId).catch(() => null)
      )
    )
    hijos.value = resultados.filter(Boolean)
  } catch (err) {
    console.error('Error al cargar hijos', err)
  } finally {
    cargandoHijos.value = false
  }
}

function handleLogout() {
  cerrarSesion()
  router.push('/login')
}

onMounted(cargarHijos)
</script>

<template>
  <div class="familia-layout">
    <!-- ═══ NAVBAR ═══ -->
    <header class="familia-navbar" role="banner">
      <div class="familia-navbar-inner container">
        <!-- Marca -->
        <button class="navbar-brand-btn" @click="router.push('/familia')" aria-label="Ir al inicio familiar">
          <div class="familia-brand-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          </div>
          <span class="familia-brand-name">Semilleros <strong>UTN</strong></span>
        </button>

        <!-- Contexto: hijo seleccionado -->
        <div v-if="estaHijoSeleccionado && hijoActual" class="hijo-context">
          <div class="hijo-context-avatar" aria-hidden="true">
            {{ hijoActual.nombre?.[0]?.toUpperCase() || '?' }}
          </div>
          <div class="hijo-context-info">
            <span class="hijo-context-nombre">{{ hijoActual.nombre }}</span>
            <span class="hijo-context-label">Estudiante</span>
          </div>
        </div>

        <!-- Navegación de hijos (si hay más de 1 y hay uno seleccionado) -->
        <nav v-if="hijos.length > 1 && estaHijoSeleccionado" class="hijo-switcher" aria-label="Cambiar de hijo">
          <button
            v-for="h in hijos"
            :key="h._id"
            class="switcher-btn"
            :class="{ active: h._id === route.params.id }"
            @click="router.push(`/familia/hijo/${h._id}`)"
          >
            <span class="switcher-avatar" aria-hidden="true">{{ h.nombre?.[0]?.toUpperCase() }}</span>
            <span class="hide-mobile">{{ h.nombre?.split(' ')[0] }}</span>
          </button>
        </nav>

        <!-- Usuario y salir -->
        <div class="navbar-right">
          <div class="user-chip" :title="nombreUsuario">
            <div class="user-chip-avatar" aria-hidden="true">{{ iniciales }}</div>
            <span class="user-chip-name hide-mobile">{{ nombreUsuario }}</span>
          </div>
          <button class="btn-salir" @click="handleLogout" aria-label="Cerrar sesión">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span class="hide-mobile">Salir</span>
          </button>
        </div>
      </div>
    </header>

    <!-- ═══ BARRA DE NAVEGACIÓN HIJA (sublinks cuando hay hijo seleccionado) ═══ -->
    <nav v-if="estaHijoSeleccionado && route.params.id" class="hijo-subnav" aria-label="Secciones del perfil">
      <div class="container">
        <div class="subnav-links">
          <router-link :to="`/familia/hijo/${route.params.id}`" class="subnav-link" active-class="subnav-active" exact>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Perfil
          </router-link>
          <router-link :to="`/familia/hijo/${route.params.id}/actividades`" class="subnav-link" active-class="subnav-active">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Actividades en Casa
          </router-link>
        </div>
      </div>
    </nav>

    <!-- ═══ CONTENIDO ═══ -->
    <main class="familia-main container" id="main-content">
      <router-view :key="route.params.id" />
    </main>

    <!-- Footer -->
    <footer class="familia-footer">
      <p>Semilleros UTN · Panel de Familia</p>
    </footer>
  </div>
</template>

<style scoped>
.familia-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--gray-50);
}

/* ═══ NAVBAR ═══ */
.familia-navbar {
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0; z-index: 50;
  box-shadow: 0 1px 8px rgba(0,0,0,0.04);
}
.familia-navbar-inner {
  display: flex;
  align-items: center;
  height: 64px;
  gap: 16px;
}

/* Marca */
.navbar-brand-btn {
  display: flex; align-items: center; gap: 10px;
  background: none; border: none; cursor: pointer;
  text-decoration: none; flex-shrink: 0;
}
.familia-brand-icon {
  width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, var(--accent-500), var(--primary-500));
  border-radius: 10px; color: #fff;
}
.familia-brand-name {
  font-size: 0.95rem; font-weight: 600; color: var(--text-primary);
}
.familia-brand-name strong { color: var(--accent-600); }

/* Contexto hijo */
.hijo-context {
  display: flex; align-items: center; gap: 10px;
  padding: 6px 14px 6px 8px;
  background: rgba(14,165,233,0.07);
  border: 1px solid rgba(14,165,233,0.2);
  border-radius: var(--radius-full);
}
.hijo-context-avatar {
  width: 30px; height: 30px;
  display: flex; align-items: center; justify-content: center;
  background: var(--accent-500); color: #fff;
  border-radius: 50%; font-size: 0.75rem; font-weight: 800; flex-shrink: 0;
}
.hijo-context-info { display: flex; flex-direction: column; }
.hijo-context-nombre { font-size: 0.82rem; font-weight: 700; color: var(--text-primary); line-height: 1.2; }
.hijo-context-label { font-size: 0.68rem; color: var(--accent-600); }

/* Switcher de hijos */
.hijo-switcher {
  display: flex; gap: 6px;
}
.switcher-btn {
  display: flex; align-items: center; gap: 7px;
  padding: 5px 12px 5px 6px;
  background: var(--gray-100); border: 1.5px solid transparent;
  border-radius: var(--radius-full); cursor: pointer;
  font-family: var(--font-sans); font-size: 0.8rem; font-weight: 600;
  color: var(--text-secondary); transition: all var(--transition-fast);
}
.switcher-btn:hover { background: var(--gray-200); color: var(--text-primary); }
.switcher-btn.active { background: rgba(14,165,233,0.1); border-color: var(--accent-400); color: var(--accent-700); }
.switcher-avatar {
  width: 22px; height: 22px;
  display: flex; align-items: center; justify-content: center;
  background: var(--accent-500); color: #fff;
  border-radius: 50%; font-size: 0.65rem; font-weight: 800;
}

/* Derecha */
.navbar-right { display: flex; align-items: center; gap: 12px; margin-left: auto; }
.user-chip {
  display: flex; align-items: center; gap: 8px;
  font-size: 0.85rem; color: var(--text-secondary);
}
.user-chip-avatar {
  width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, var(--accent-400), var(--primary-400));
  border-radius: 8px; font-size: 0.72rem; font-weight: 800; color: #fff;
}
.user-chip-name { font-weight: 500; }
.btn-salir {
  display: flex; align-items: center; gap: 6px;
  padding: 7px 14px; background: var(--gray-100);
  border: 1px solid var(--border-color); border-radius: var(--radius-md);
  font-family: var(--font-sans); font-size: 0.82rem; font-weight: 600;
  color: var(--text-secondary); cursor: pointer; transition: all var(--transition-fast);
}
.btn-salir:hover { background: rgba(239,68,68,0.08); border-color: var(--danger-400); color: var(--danger-500); }

/* ═══ SUBNAV ═══ */
.hijo-subnav {
  background: #fff;
  border-bottom: 1px solid var(--border-color);
}
.subnav-links {
  display: flex; gap: 0;
}
.subnav-link {
  display: flex; align-items: center; gap: 7px;
  padding: 12px 20px;
  font-size: 0.85rem; font-weight: 600; color: var(--text-muted);
  text-decoration: none; border-bottom: 2.5px solid transparent;
  transition: all var(--transition-fast);
}
.subnav-link:hover { color: var(--text-primary); }
.subnav-active { color: var(--accent-600); border-bottom-color: var(--accent-500); }

/* ═══ MAIN ═══ */
.familia-main {
  flex: 1;
  padding-top: 32px;
  padding-bottom: 48px;
}

/* Footer */
.familia-footer {
  padding: 16px;
  text-align: center;
  font-size: 0.75rem;
  color: var(--text-muted);
  border-top: 1px solid var(--border-color);
  background: #fff;
}

/* Responsive */
@media (max-width: 640px) {
  .familia-main { padding-top: 24px; padding-bottom: 32px; }
  .familia-navbar-inner { gap: 10px; }
  .hijo-context { padding: 5px 10px 5px 6px; }
}
</style>
