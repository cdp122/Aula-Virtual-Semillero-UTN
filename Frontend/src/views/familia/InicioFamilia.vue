<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth.js'
import apolloClient from '../../graphql/client.js'
import { OBTENER_USUARIO_POR_ID } from '../../graphql/queries.js'

const router = useRouter()
const { usuario, nombreUsuario } = useAuth()

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

function verPerfil(id) {
  router.push(`/familia/hijo/${id}`)
}

onMounted(cargarHijos)
</script>

<template>
  <div class="inicio-familia">
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
        <div 
          v-for="hijo in hijos" 
          :key="hijo._id" 
          class="hijo-card"
          @click="verPerfil(hijo._id)"
        >
          <div class="hijo-avatar">{{ hijo.nombre?.[0]?.toUpperCase() || '?' }}</div>
          <div class="hijo-info">
            <h3>{{ hijo.nombre }}</h3>
            <span class="badge badge-primary">Estudiante</span>
          </div>
          <div class="hijo-action">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
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
  cursor: pointer;
}

.hijo-card:hover {
  border-color: var(--accent-500);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
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

.hijo-info {
  flex: 1;
}

.hijo-info h3 {
  font-size: 1rem;
  margin-bottom: 6px;
}

.hijo-action {
  color: var(--text-muted);
  transition: color var(--transition-fast);
}

.hijo-card:hover .hijo-action {
  color: var(--accent-400);
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

@media (max-width: 640px) {
  .welcome-section h1 {
    font-size: 1.5rem;
  }
  .hijos-grid {
    grid-template-columns: 1fr;
  }
}
</style>
