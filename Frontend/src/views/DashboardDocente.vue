<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'

const router = useRouter()
const route = useRoute()
const { usuario, nombreUsuario, cerrarSesion } = useAuth()

const sidebarOpen = ref(false)

const menuItems = [
  {
    nombre: 'Mis Grupos',
    icono: 'groups',
    ruta: '/docente/grupos',
    activo: () => route.path.startsWith('/docente/grupos') || route.path === '/docente'
  },
  {
    nombre: 'Planificación',
    icono: 'book',
    ruta: '/docente/planificacion',
    activo: () => route.path.startsWith('/docente/planificacion')
  },
  {
    nombre: 'Evaluaciones',
    icono: 'checklist',
    ruta: '/docente/evaluaciones',
    activo: () => route.path.startsWith('/docente/evaluaciones')
  },
  {
    nombre: 'Fichas de Monitoreo',
    icono: 'person',
    ruta: '/docente/fichas',
    activo: () => route.path.startsWith('/docente/fichas')
  },
  {
    nombre: 'Autoevaluación',
    icono: 'star',
    ruta: '/docente/autoevaluacion',
    activo: () => route.path.startsWith('/docente/autoevaluacion')
  },
  {
    nombre: 'Informes PDF',
    icono: 'download',
    ruta: '/docente/informes',
    activo: () => route.path.startsWith('/docente/informes')
  }
]

function handleLogout() {
  cerrarSesion()
  router.push('/')
}

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}

function closeSidebar() {
  sidebarOpen.value = false
}

function navegar(ruta) {
  router.push(ruta)
  closeSidebar()
}

const iniciales = computed(() => {
  if (!nombreUsuario.value) return '?'
  const parts = nombreUsuario.value.split(' ')
  return parts.slice(0, 2).map(p => p[0]?.toUpperCase() || '').join('')
})
</script>

<template>
  <div class="dashboard-layout">
    <!-- Mobile overlay -->
    <div
      v-if="sidebarOpen"
      class="sidebar-overlay"
      @click="closeSidebar"
    ></div>

    <!-- Sidebar -->
    <aside class="sidebar" :class="{ open: sidebarOpen }">
      <div class="sidebar-header">
        <div class="sidebar-brand">
          <div class="sidebar-brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          </div>
          <div>
            <div class="sidebar-brand-title">Semilleros</div>
            <div class="sidebar-brand-subtitle">Panel Docente</div>
          </div>
        </div>
      </div>

      <nav class="sidebar-nav">
        <button
          v-for="item in menuItems"
          :key="item.ruta"
          class="sidebar-link"
          :class="{ active: item.activo() }"
          @click="navegar(item.ruta)"
        >
          <div class="sidebar-link-icon">
            <svg v-if="item.icono === 'groups'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <svg v-if="item.icono === 'book'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
            <svg v-if="item.icono === 'checklist'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
            <svg v-if="item.icono === 'person'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <svg v-if="item.icono === 'star'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            <svg v-if="item.icono === 'download'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          </div>
          <span>{{ item.nombre }}</span>
        </button>
      </nav>

      <div class="sidebar-footer">
        <div class="sidebar-user">
          <div class="sidebar-avatar">{{ iniciales }}</div>
          <div class="sidebar-user-info">
            <div class="sidebar-user-name">{{ nombreUsuario }}</div>
            <div class="sidebar-user-role">Docente</div>
          </div>
        </div>
        <button class="sidebar-logout" @click="handleLogout" title="Cerrar sesión">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="dashboard-main">
      <!-- Top bar (mobile) -->
      <header class="topbar">
        <button class="topbar-menu" @click="toggleSidebar">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <span class="topbar-title">Semilleros UTN</span>
        <div class="topbar-avatar">{{ iniciales }}</div>
      </header>

      <div class="dashboard-content">
        <router-view />
      </div>
    </main>
  </div>
</template>

<style scoped>
.dashboard-layout {
  display: flex;
  min-height: 100vh;
}

/* ═══ SIDEBAR ═══ */
.sidebar {
  width: 260px;
  background: var(--gradient-sidebar);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 50;
  transition: transform var(--transition-base);
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sidebar-brand-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-primary);
  border-radius: var(--radius-md);
  color: #fff;
  flex-shrink: 0;
}

.sidebar-brand-title {
  font-weight: 700;
  font-size: 1.05rem;
  color: var(--text-primary);
}

.sidebar-brand-subtitle {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 1px;
}

.sidebar-nav {
  flex: 1;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: var(--radius-md);
  background: none;
  border: none;
  color: var(--text-secondary);
  font-family: var(--font-sans);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  width: 100%;
  text-align: left;
}

.sidebar-link:hover {
  background: var(--bg-glass-hover);
  color: var(--text-primary);
}

.sidebar-link.active {
  background: rgba(76,110,245,0.12);
  color: var(--primary-400);
}

.sidebar-link-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.sidebar-link.active .sidebar-link-icon {
  background: rgba(76,110,245,0.15);
}

/* ═══ SIDEBAR FOOTER ═══ */
.sidebar-footer {
  padding: 16px;
  border-top: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.sidebar-user {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.sidebar-avatar {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-accent);
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--gray-900);
  flex-shrink: 0;
}

.sidebar-user-info {
  min-width: 0;
}

.sidebar-user-name {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 130px;
}

.sidebar-user-role {
  font-size: 0.72rem;
  color: var(--text-muted);
}

.sidebar-logout {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.sidebar-logout:hover {
  background: rgba(250,82,82,0.12);
  border-color: var(--danger-500);
  color: var(--danger-400);
}

/* ═══ MAIN CONTENT ═══ */
.dashboard-main {
  flex: 1;
  margin-left: 260px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.dashboard-content {
  flex: 1;
  padding: 32px;
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
}

/* ═══ TOPBAR (Mobile) ═══ */
.topbar {
  display: none;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(11,15,26,0.9);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 40;
}

.topbar-menu {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  cursor: pointer;
}

.topbar-title {
  font-weight: 700;
  font-size: 1rem;
}

.topbar-avatar {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-accent);
  border-radius: var(--radius-sm);
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--gray-900);
}

/* ═══ SIDEBAR OVERLAY ═══ */
.sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 45;
}

/* ═══ RESPONSIVE ═══ */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .sidebar-overlay {
    display: block;
  }

  .dashboard-main {
    margin-left: 0;
  }

  .topbar {
    display: flex;
  }

  .dashboard-content {
    padding: 20px 16px;
  }
}
</style>
