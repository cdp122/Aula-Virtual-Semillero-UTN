<script setup>
</script>

<template>
  <div class="app-layout">
    <aside class="sidebar">
      <div class="logo">
        <h2>Aula Virtual</h2>
        <span class="subtitle">Semillero UTN</span>
      </div>
      <nav class="nav-menu">
        <router-link to="/planificacion" class="nav-item">Planificación</router-link>
        <router-link to="/evaluaciones" class="nav-item">Evaluaciones</router-link>
        <router-link to="/fichas" class="nav-item">Ficha de Monitoreo</router-link>
        <router-link to="/autoevaluacion" class="nav-item">Autoevaluación Docente</router-link>
        <router-link to="/informes" class="nav-item">Informes PDF</router-link>
      </nav>
    </aside>
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  width: 100vw;
  background-color: #f4f6f8;
  color: #333;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  overflow-x: hidden;
}

.sidebar {
  width: 260px;
  background-color: #1a1b26;
  color: #fff;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 15px rgba(0,0,0,0.1);
  z-index: 10;
}

.logo {
  padding: 30px 24px;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.logo h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #4CAF50;
  letter-spacing: 0.5px;
}

.logo .subtitle {
  font-size: 0.85rem;
  color: #8892b0;
  margin-top: 4px;
  display: block;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  padding: 20px 0;
  gap: 8px;
}

.nav-item {
  padding: 14px 24px;
  color: #a9b1d6;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
  font-size: 0.95rem;
  border-left: 4px solid transparent;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.03);
  color: #fff;
  padding-left: 28px;
}

.nav-item.router-link-active {
  background-color: rgba(76, 175, 80, 0.1);
  color: #4CAF50;
  border-left: 4px solid #4CAF50;
}

.main-content {
  flex: 1;
  padding: 40px;
  overflow-y: auto;
  position: relative;
}

/* Page Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
