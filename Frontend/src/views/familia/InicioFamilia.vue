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
  return nombreUsuario.value.split(' ').slice(0, 2).map(p => p[0]?.toUpperCase() || '').join('')
})

const saludo = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 18) return 'Buenas tardes'
  return 'Buenas noches'
})

async function cargarHijos() {
  cargando.value = true
  try {
    const ids = usuario.value?.hijos || []
    const res = await Promise.all(
      ids.map(id =>
        apolloClient.query({ query: OBTENER_USUARIO_POR_ID, variables: { id } })
          .then(r => r.data.usuarioPorId).catch(() => null)
      )
    )
    hijos.value = res.filter(Boolean)
  } catch (err) {
    console.error(err)
  } finally {
    cargando.value = false
  }
}

onMounted(cargarHijos)
</script>

<template>
  <div class="inicio-familia animate-fade-in">
    <!-- Bienvenida -->
    <div class="welcome-banner">
      <div class="welcome-avatar" aria-hidden="true">{{ iniciales }}</div>
      <div class="welcome-text">
        <h1>{{ saludo }}, <span class="gradient-text">{{ nombreUsuario.split(' ')[0] }}</span></h1>
        <p>Desde aquí puedes seguir el progreso educativo de tus hijos.</p>
      </div>
    </div>

    <!-- Hijos -->
    <section class="hijos-section" aria-labelledby="hijos-titulo">
      <div class="section-top">
        <h2 id="hijos-titulo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          Mis Hijos
        </h2>
        <span v-if="hijos.length" class="hijos-count">{{ hijos.length }} {{ hijos.length === 1 ? 'estudiante' : 'estudiantes' }}</span>
      </div>

      <!-- Cargando -->
      <div v-if="cargando" class="state-block" role="status" aria-live="polite">
        <div class="state-spinner" aria-hidden="true">
          <div class="spinner spinner-lg"></div>
        </div>
        <p>Cargando información...</p>
      </div>

      <!-- Sin hijos -->
      <div v-else-if="hijos.length === 0" class="state-block state-empty" role="status">
        <div class="state-icon" aria-hidden="true">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
        </div>
        <h3>No hay estudiantes vinculados</h3>
        <p>Contacta al docente para que vincule a tu hijo con tu cuenta.</p>
      </div>

      <!-- Lista de hijos -->
      <div v-else class="hijos-grid">
        <button
          v-for="hijo in hijos"
          :key="hijo._id"
          class="hijo-card"
          @click="router.push(`/familia/hijo/${hijo._id}`)"
          :aria-label="`Ver perfil de ${hijo.nombre}`"
        >
          <div class="hijo-card-left">
            <div class="hijo-avatar" aria-hidden="true">
              {{ hijo.nombre?.[0]?.toUpperCase() || '?' }}
            </div>
            <div class="hijo-info">
              <h3>{{ hijo.nombre }}</h3>
              <div class="hijo-tags">
                <span class="tag tag-student">Estudiante</span>
              </div>
            </div>
          </div>
          <div class="hijo-card-right">
            <span class="hijo-cta-text">Ver progreso</span>
            <div class="hijo-arrow" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>
        </button>
      </div>
    </section>

    <!-- Guía rápida -->
    <section class="quick-guide" aria-labelledby="guide-titulo">
      <h2 id="guide-titulo" class="guide-title">¿Qué puedes hacer aquí?</h2>
      <div class="guide-grid">
        <div class="guide-item">
          <div class="guide-icon gi-purple" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <h3>Ver el Perfil</h3>
          <p>Consulta el historial de evaluaciones y fichas de monitoreo de tu hijo.</p>
        </div>
        <div class="guide-item">
          <div class="guide-icon gi-green" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          </div>
          <h3>Registrar Logros</h3>
          <p>Confirma las actividades que tu hijo completó en casa.</p>
        </div>
        <div class="guide-item">
          <div class="guide-icon gi-blue" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <h3>Actividades en Casa</h3>
          <p>Revisa qué tareas pendientes tiene tu hijo para reforzar en el hogar.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.inicio-familia { max-width: 860px; margin: 0 auto; }

/* ═══ BIENVENIDA ═══ */
.welcome-banner {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 28px 32px;
  background: linear-gradient(135deg, rgba(14,165,233,0.07), rgba(139,92,246,0.06));
  border: 1px solid rgba(14,165,233,0.15);
  border-radius: var(--radius-xl);
  margin-bottom: 36px;
}
.welcome-avatar {
  width: 64px; height: 64px;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, var(--accent-500), var(--primary-500));
  border-radius: 18px; font-size: 1.4rem; font-weight: 800; color: #fff; flex-shrink: 0;
}
.welcome-text h1 { font-size: clamp(1.4rem, 3vw, 1.8rem); margin-bottom: 6px; }
.welcome-text p { font-size: 0.9rem; color: var(--text-secondary); }
.gradient-text {
  background: linear-gradient(135deg, var(--accent-500), var(--primary-500));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}

/* ═══ HIJOS ═══ */
.hijos-section { margin-bottom: 40px; }
.section-top {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 18px;
}
.hijos-section h2 {
  display: flex; align-items: center; gap: 10px;
  font-size: 1.15rem; color: var(--text-primary);
}
.hijos-count {
  font-size: 0.78rem; font-weight: 600;
  background: rgba(14,165,233,0.1); color: var(--accent-600);
  padding: 3px 10px; border-radius: var(--radius-full);
}

.hijos-grid { display: flex; flex-direction: column; gap: 12px; }

.hijo-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px;
  background: #fff;
  border: 1.5px solid var(--border-color);
  border-radius: var(--radius-lg);
  cursor: pointer;
  width: 100%;
  text-align: left;
  transition: all var(--transition-base);
  font-family: var(--font-sans);
}
.hijo-card:hover {
  border-color: var(--accent-400);
  box-shadow: var(--shadow-md), 0 0 0 3px rgba(14,165,233,0.08);
  transform: translateY(-2px);
}
.hijo-card-left { display: flex; align-items: center; gap: 16px; }
.hijo-avatar {
  width: 52px; height: 52px;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, rgba(14,165,233,0.15), rgba(139,92,246,0.12));
  color: var(--accent-600);
  border-radius: 14px; font-size: 1.2rem; font-weight: 800; flex-shrink: 0;
}
.hijo-info h3 { font-size: 1.05rem; font-weight: 700; color: var(--text-primary); margin-bottom: 6px; }
.hijo-tags { display: flex; gap: 6px; }
.tag {
  display: inline-flex; align-items: center;
  padding: 3px 10px; border-radius: var(--radius-full);
  font-size: 0.72rem; font-weight: 600;
}
.tag-student { background: rgba(14,165,233,0.1); color: var(--accent-600); }

.hijo-card-right { display: flex; align-items: center; gap: 10px; }
.hijo-cta-text { font-size: 0.8rem; font-weight: 600; color: var(--text-muted); }
.hijo-arrow {
  width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
  background: var(--gray-100); border-radius: 8px; color: var(--text-muted);
  transition: all var(--transition-fast);
}
.hijo-card:hover .hijo-arrow { background: var(--accent-500); color: #fff; }
.hijo-card:hover .hijo-cta-text { color: var(--accent-600); }

/* Estados */
.state-block {
  text-align: center; padding: 48px 24px;
  background: #fff; border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
}
.state-spinner { display: flex; justify-content: center; margin-bottom: 16px; }
.state-icon {
  width: 72px; height: 72px;
  display: flex; align-items: center; justify-content: center;
  background: var(--gray-100); border-radius: 50%;
  margin: 0 auto 16px; color: var(--text-muted);
}
.state-block h3 { font-size: 1.05rem; margin-bottom: 8px; }
.state-block p { font-size: 0.88rem; color: var(--text-muted); }

/* ═══ GUÍA RÁPIDA ═══ */
.quick-guide { margin-top: 8px; }
.guide-title { font-size: 1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 16px; }
.guide-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.guide-item {
  padding: 22px 20px;
  background: #fff; border: 1px solid var(--border-color);
  border-radius: var(--radius-lg); transition: all var(--transition-base);
}
.guide-item:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
.guide-icon {
  width: 40px; height: 40px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 10px; margin-bottom: 14px;
}
.gi-purple { background: rgba(139,92,246,0.1); color: var(--primary-600); }
.gi-green { background: rgba(34,197,94,0.1); color: var(--success-600); }
.gi-blue { background: rgba(14,165,233,0.1); color: var(--accent-600); }
.guide-item h3 { font-size: 0.9rem; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); }
.guide-item p { font-size: 0.82rem; color: var(--text-secondary); line-height: 1.6; }

/* Responsive */
@media (max-width: 640px) {
  .welcome-banner { flex-direction: column; text-align: center; padding: 24px 20px; }
  .guide-grid { grid-template-columns: 1fr; }
  .hijo-cta-text { display: none; }
}
</style>
