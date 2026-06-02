<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'

const router = useRouter()
const route = useRoute()
const { nombreUsuario, cerrarSesion } = useAuth()

const sidebarOpen = ref(false)

const menuItems = [
  {
    nombre: 'Mis Grupos',
    descripcion: 'Gestión de estudiantes',
    icono: 'groups',
    ruta: '/docente/grupos',
    color: 'purple',
    activo: () => route.path.startsWith('/docente/grupos') || route.path === '/docente'
  },
  {
    nombre: 'Planificación',
    descripcion: 'Unidades didácticas',
    icono: 'book',
    ruta: '/docente/planificacion',
    color: 'blue',
    activo: () => route.path.startsWith('/docente/planificacion')
  },
  {
    nombre: 'Evaluaciones',
    descripcion: 'Niveles de logro',
    icono: 'check',
    ruta: '/docente/evaluaciones',
    color: 'green',
    activo: () => route.path.startsWith('/docente/evaluaciones')
  },
  {
    nombre: 'Fichas de Monitoreo',
    descripcion: 'Seguimiento individual',
    icono: 'person',
    ruta: '/docente/fichas',
    color: 'orange',
    activo: () => route.path.startsWith('/docente/fichas')
  },
  {
    nombre: 'Autoevaluación',
    descripcion: 'Reflexión docente',
    icono: 'star',
    ruta: '/docente/autoevaluacion',
    color: 'gold',
    activo: () => route.path.startsWith('/docente/autoevaluacion')
  },
  {
    nombre: 'Informes PDF',
    descripcion: 'Reportes y descargas',
    icono: 'download',
    ruta: '/docente/informes',
    color: 'teal',
    activo: () => route.path.startsWith('/docente/informes')
  }
]

function handleLogout() {
  cerrarSesion()
  router.push('/login')
}

const iniciales = computed(() => {
  if (!nombreUsuario.value) return '?'
  return nombreUsuario.value.split(' ').slice(0, 2).map(p => p[0]?.toUpperCase() || '').join('')
})

const paginaActual = computed(() =>
  menuItems.find(m => m.activo())?.nombre || 'Panel Docente'
)
</script>

<template>
  <div class="app-layout">
    <!-- Overlay móvil -->
    <div v-if="sidebarOpen" class="sidebar-overlay" @click="sidebarOpen = false" aria-hidden="true"></div>

    <!-- ═══ SIDEBAR ═══ -->
    <aside class="sidebar" :class="{ open: sidebarOpen }" role="navigation" aria-label="Menú principal">
      <!-- Marca -->
      <div class="sidebar-brand">
        <div class="brand-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
        </div>
        <div class="brand-text">
          <span class="brand-name">Semilleros</span>
          <span class="brand-role">Panel Docente</span>
        </div>
      </div>

      <!-- Navegación -->
      <nav class="sidebar-nav" aria-label="Secciones">
        <p class="nav-label">MÓDULOS</p>
        <button
          v-for="item in menuItems"
          :key="item.ruta"
          class="nav-item"
          :class="[`nav-color-${item.color}`, { active: item.activo() }]"
          @click="router.push(item.ruta); sidebarOpen = false"
          :aria-current="item.activo() ? 'page' : undefined"
        >
          <span class="nav-icon" aria-hidden="true">
            <!-- groups -->
            <svg v-if="item.icono === 'groups'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <!-- book -->
            <svg v-if="item.icono === 'book'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            <!-- check -->
            <svg v-if="item.icono === 'check'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            <!-- person -->
            <svg v-if="item.icono === 'person'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <!-- star -->
            <svg v-if="item.icono === 'star'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <!-- download -->
            <svg v-if="item.icono === 'download'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </span>
          <span class="nav-text">
            <span class="nav-nombre">{{ item.nombre }}</span>
            <span class="nav-desc">{{ item.descripcion }}</span>
          </span>
          <span v-if="item.activo()" class="nav-active-dot" aria-hidden="true"></span>
        </button>
      </nav>

      <!-- Footer: usuario -->
      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-avatar" aria-hidden="true">{{ iniciales }}</div>
          <div class="user-meta">
            <span class="user-name">{{ nombreUsuario }}</span>
            <span class="user-role">Docente</span>
          </div>
        </div>
        <button class="btn-logout" @click="handleLogout" title="Cerrar sesión" aria-label="Cerrar sesión">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>
    </aside>

    <!-- ═══ CONTENIDO PRINCIPAL ═══ -->
    <div class="main-wrapper">
      <!-- Topbar móvil -->
      <header class="topbar" role="banner">
        <button class="topbar-toggle" @click="sidebarOpen = !sidebarOpen" aria-label="Abrir menú" :aria-expanded="sidebarOpen">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <span class="topbar-title">{{ paginaActual }}</span>
        <div class="topbar-avatar" aria-hidden="true">{{ iniciales }}</div>
      </header>

      <!-- Breadcrumb (desktop) -->
      <div class="breadcrumb-bar hide-mobile">
        <span class="bc-app">Semilleros UTN</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
        <span class="bc-page">{{ paginaActual }}</span>
      </div>

      <main class="main-content" id="main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  background: var(--gray-50);
}

/* ═══ SIDEBAR ═══ */
.sidebar {
  width: 268px;
  background: #fff;
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0; left: 0; bottom: 0;
  z-index: 50;
  transition: transform var(--transition-base);
  box-shadow: 2px 0 16px rgba(0,0,0,0.04);
}

/* Marca */
.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 22px 20px 20px;
  border-bottom: 1px solid var(--border-color);
}
.brand-icon {
  width: 42px; height: 42px;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, var(--primary-700), var(--primary-500));
  border-radius: 12px; color: #fff; flex-shrink: 0;
}
.brand-text { display: flex; flex-direction: column; }
.brand-name { font-size: 0.95rem; font-weight: 800; color: var(--text-primary); }
.brand-role { font-size: 0.7rem; color: var(--text-muted); margin-top: 1px; }

/* Nav */
.sidebar-nav {
  flex: 1;
  padding: 20px 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  overflow-y: auto;
}
.nav-label {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--text-muted);
  padding: 0 10px;
  margin-bottom: 8px;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  background: none;
  border: none;
  cursor: pointer;
  width: 100%;
  text-align: left;
  transition: all var(--transition-fast);
  position: relative;
}
.nav-item:hover { background: var(--gray-50); }

.nav-icon {
  width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 10px;
  background: var(--gray-100);
  color: var(--text-muted);
  flex-shrink: 0;
  transition: all var(--transition-fast);
}
.nav-text { display: flex; flex-direction: column; min-width: 0; flex: 1; }
.nav-nombre { font-size: 0.875rem; font-weight: 600; color: var(--text-secondary); line-height: 1.2; }
.nav-desc { font-size: 0.72rem; color: var(--text-muted); margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.nav-active-dot {
  width: 7px; height: 7px;
  border-radius: 50%; flex-shrink: 0;
  background: currentColor;
  opacity: 0.7;
}

/* Estados activos por color */
.nav-item.active .nav-nombre { color: var(--text-primary); font-weight: 700; }
.nav-item.active .nav-desc { color: var(--text-secondary); }

.nav-color-purple.active { background: rgba(139,92,246,0.08); }
.nav-color-purple.active .nav-icon { background: rgba(139,92,246,0.12); color: var(--primary-600); }
.nav-color-purple.active .nav-active-dot { background: var(--primary-500); }

.nav-color-blue.active { background: rgba(14,165,233,0.07); }
.nav-color-blue.active .nav-icon { background: rgba(14,165,233,0.12); color: var(--accent-600); }
.nav-color-blue.active .nav-active-dot { background: var(--accent-500); }

.nav-color-green.active { background: rgba(34,197,94,0.07); }
.nav-color-green.active .nav-icon { background: rgba(34,197,94,0.12); color: var(--success-600); }
.nav-color-green.active .nav-active-dot { background: var(--success-500); }

.nav-color-orange.active { background: rgba(249,115,22,0.07); }
.nav-color-orange.active .nav-icon { background: rgba(249,115,22,0.12); color: #ea580c; }
.nav-color-orange.active .nav-active-dot { background: #f97316; }

.nav-color-gold.active { background: rgba(234,179,8,0.07); }
.nav-color-gold.active .nav-icon { background: rgba(234,179,8,0.12); color: #ca8a04; }
.nav-color-gold.active .nav-active-dot { background: #eab308; }

.nav-color-teal.active { background: rgba(20,184,166,0.07); }
.nav-color-teal.active .nav-icon { background: rgba(20,184,166,0.12); color: #0f766e; }
.nav-color-teal.active .nav-active-dot { background: #14b8a6; }

/* Footer */
.sidebar-footer {
  padding: 16px;
  border-top: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.user-info { display: flex; align-items: center; gap: 10px; min-width: 0; }
.user-avatar {
  width: 38px; height: 38px;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, var(--accent-400), var(--primary-400));
  border-radius: 10px; font-size: 0.8rem; font-weight: 800; color: #fff; flex-shrink: 0;
}
.user-meta { min-width: 0; display: flex; flex-direction: column; }
.user-name { font-size: 0.82rem; font-weight: 700; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 130px; }
.user-role { font-size: 0.68rem; color: var(--text-muted); }
.btn-logout {
  width: 34px; height: 34px;
  display: flex; align-items: center; justify-content: center;
  background: var(--gray-50); border: 1px solid var(--border-color);
  border-radius: 8px; color: var(--text-muted); cursor: pointer;
  transition: all var(--transition-fast); flex-shrink: 0;
}
.btn-logout:hover { background: rgba(239,68,68,0.08); border-color: var(--danger-400); color: var(--danger-500); }

/* ═══ MAIN ═══ */
.main-wrapper {
  flex: 1;
  margin-left: 268px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* Topbar móvil */
.topbar {
  display: none;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px;
  background: rgba(255,255,255,0.94);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-color);
  position: sticky; top: 0; z-index: 40;
}
.topbar-toggle {
  width: 40px; height: 40px;
  display: flex; align-items: center; justify-content: center;
  background: var(--gray-100); border: none; border-radius: 10px;
  color: var(--text-primary); cursor: pointer;
}
.topbar-title { font-size: 0.95rem; font-weight: 700; color: var(--text-primary); }
.topbar-avatar {
  width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, var(--accent-400), var(--primary-400));
  border-radius: 10px; font-size: 0.75rem; font-weight: 800; color: #fff;
}

/* Breadcrumb */
.breadcrumb-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 32px;
  background: #fff;
  border-bottom: 1px solid var(--border-color);
  font-size: 0.8rem;
}
.bc-app { color: var(--text-muted); }
.bc-page { color: var(--text-primary); font-weight: 600; }

.main-content {
  flex: 1;
  padding: 32px;
  max-width: 100%;
  box-sizing: border-box;
}

/* Overlay móvil */
.sidebar-overlay {
  position: fixed; inset: 0;
  background: rgba(15,23,42,0.35);
  z-index: 45; backdrop-filter: blur(2px);
}

/* ═══ RESPONSIVE ═══ */
@media (max-width: 768px) {
  .sidebar { transform: translateX(-100%); }
  .sidebar.open { transform: translateX(0); }
  .main-wrapper { margin-left: 0; }
  .topbar { display: flex; }
  .breadcrumb-bar { display: none; }
  .main-content { padding: 20px 16px; }
}
</style>
