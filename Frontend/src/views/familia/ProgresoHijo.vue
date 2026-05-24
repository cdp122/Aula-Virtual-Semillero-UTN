<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import apolloClient from '../../graphql/client.js'
import { OBTENER_PROGRESO_HIJO } from '../../graphql/queries.js'

const props = defineProps({ id: String, actividadId: String })
const router = useRouter()

const progreso = ref(null)
const cargando = ref(true)

async function cargarProgreso() {
  cargando.value = true
  try {
    const res = await apolloClient.query({
      query: OBTENER_PROGRESO_HIJO,
      variables: {
        estudianteId: props.id,
        actividadId: props.actividadId
      }
    })
    
    progreso.value = res.data.obtenerProgresoHijo
  } catch (err) {
    console.error("Error al cargar progreso", err)
  } finally {
    cargando.value = false
  }
}

function volver() {
  router.push(`/familia/hijo/${props.id}`)
}

// Helpers
function getBadgeClass(nivel) {
  switch (nivel) {
    case 'I': return 'badge-warning';
    case 'EP': return 'badge-primary';
    case 'A': return 'badge-success';
    case 'NE': return 'badge-outline';
    default: return 'badge-outline';
  }
}

function getLabel(nivel) {
  switch (nivel) {
    case 'I': return 'Iniciado';
    case 'EP': return 'En Proceso';
    case 'A': return 'Adquirido';
    case 'NE': return 'No Evaluado';
    default: return nivel;
  }
}

onMounted(cargarProgreso)
</script>

<template>
  <div class="progreso-hijo animate-fade-in">
    <!-- Header/Back -->
    <div class="page-header">
      <button class="btn btn-ghost btn-sm btn-back" @click="volver">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        Volver al perfil
      </button>
      <h1>Seguimiento Individual</h1>
      <p class="subtitle">Evaluación de la Actividad: {{ actividadId.substring(0, 8) }}...</p>
    </div>

    <div v-if="cargando" class="loading-state">
      <div class="spinner spinner-lg"></div>
      <p>Cargando rúbrica...</p>
    </div>

    <div v-else-if="!progreso" class="empty-state">
      <div class="empty-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
      </div>
      <h3>Sin progreso registrado</h3>
      <p>El docente aún no ha registrado la evaluación para esta actividad.</p>
    </div>

    <div v-else class="progreso-content">
      <!-- Trazabilidad (RNF-06) -->
      <div class="trazabilidad-banner">
        <div class="traz-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <span>Evaluado el: <strong>{{ new Date(parseInt(progreso.fecha_registro)).toLocaleString() }}</strong></span>
        </div>
        <div class="traz-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span>Docente Autor</span>
        </div>
        <div class="traz-item version-badge">
          v{{ progreso.version }}
        </div>
      </div>

      <!-- Rúbrica de Criterios (Solo lectura) -->
      <section class="rubrica-section animate-slide-up">
        <h2>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          Rúbrica de Criterios
        </h2>

        <div class="criterios-grid">
          <div 
            v-for="crit in progreso.evaluaciones_criterio" 
            :key="crit.id_criterio" 
            class="criterio-card"
          >
            <div class="criterio-header">
              <h3>{{ crit.id_criterio }}</h3>
              <span class="badge" :class="getBadgeClass(crit.nivel_logro)">
                {{ getLabel(crit.nivel_logro) }}
              </span>
            </div>
            
            <div v-if="crit.observaciones" class="criterio-obs">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              {{ crit.observaciones }}
            </div>
            <div v-else class="criterio-obs empty">
              Sin observaciones específicas.
            </div>
          </div>
        </div>
      </section>

      <!-- Ficha de Monitoreo -->
      <section v-if="progreso.ficha_monitoreo" class="ficha-section animate-slide-up" style="animation-delay: 0.1s">
        <h2>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          Ficha de Monitoreo y Observaciones
        </h2>

        <div class="ficha-grid">
          <div class="ficha-item" v-if="progreso.ficha_monitoreo.clasificacion">
            <span class="label">Clasificación</span>
            <p>{{ progreso.ficha_monitoreo.clasificacion }}</p>
          </div>
          <div class="ficha-item" v-if="progreso.ficha_monitoreo.seriacion">
            <span class="label">Seriación</span>
            <p>{{ progreso.ficha_monitoreo.seriacion }}</p>
          </div>
          <div class="ficha-item" v-if="progreso.ficha_monitoreo.asimilacion_acomodacion">
            <span class="label">Asimilación y Acomodación</span>
            <p>{{ progreso.ficha_monitoreo.asimilacion_acomodacion }}</p>
          </div>
          <div class="ficha-item" v-if="progreso.ficha_monitoreo.justificacion">
            <span class="label">Justificación del Alumno</span>
            <p>{{ progreso.ficha_monitoreo.justificacion }}</p>
          </div>
          <div class="ficha-item full-width" v-if="progreso.ficha_monitoreo.observaciones">
            <span class="label">Observaciones Generales</span>
            <p>{{ progreso.ficha_monitoreo.observaciones }}</p>
          </div>
          <div class="ficha-item full-width highlight" v-if="progreso.ficha_monitoreo.acciones_apoyo">
            <span class="label text-primary">Acciones de Apoyo (Para el Hogar)</span>
            <p>{{ progreso.ficha_monitoreo.acciones_apoyo }}</p>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: 28px;
}
.btn-back {
  padding-left: 0;
  color: var(--text-muted);
  margin-bottom: 8px;
}
.btn-back:hover {
  color: var(--text-primary);
}
.page-header h1 {
  font-size: 1.8rem;
  margin-bottom: 4px;
}
.subtitle {
  color: var(--text-muted);
  font-size: 0.95rem;
}

/* ═══ TRAZABILIDAD (RNF-06) ═══ */
.trazabilidad-banner {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  background: rgba(76,110,245,0.1);
  border: 1px solid rgba(76,110,245,0.2);
  padding: 16px 24px;
  border-radius: var(--radius-lg);
  margin-bottom: 32px;
}

.traz-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.traz-item strong {
  color: var(--text-primary);
}

.traz-item svg {
  color: var(--primary-400);
}

.version-badge {
  margin-left: auto;
  background: var(--primary-600);
  color: white;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.05em;
}

/* ═══ RÚBRICA ═══ */
.rubrica-section {
  margin-bottom: 40px;
}

.rubrica-section h2, .ficha-section h2 {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.3rem;
  margin-bottom: 20px;
  color: var(--text-primary);
}

.rubrica-section h2 svg, .ficha-section h2 svg {
  color: var(--primary-400);
}

.criterios-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.criterio-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.criterio-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}

.criterio-header h3 {
  font-size: 1rem;
  color: var(--text-primary);
  line-height: 1.4;
}

.criterio-obs {
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px dashed var(--border-color);
  font-size: 0.9rem;
  color: var(--text-secondary);
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.criterio-obs svg {
  color: var(--text-muted);
  margin-top: 2px;
  flex-shrink: 0;
}

.criterio-obs.empty {
  font-style: italic;
  color: var(--text-muted);
}

/* ═══ FICHA MONITOREO ═══ */
.ficha-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.ficha-item {
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 16px;
}

.ficha-item.full-width {
  grid-column: 1 / -1;
}

.ficha-item.highlight {
  background: rgba(76,110,245,0.05);
  border-color: rgba(76,110,245,0.2);
}

.ficha-item .label {
  display: block;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  margin-bottom: 8px;
  font-weight: 700;
}

.text-primary {
  color: var(--primary-400) !important;
}

.ficha-item p {
  font-size: 0.95rem;
  color: var(--text-primary);
  line-height: 1.5;
}

/* ═══ ESTADOS ═══ */
.empty-state, .loading-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-glass);
  border-radius: 50%;
  margin: 0 auto 20px;
  color: var(--text-muted);
}

@media (max-width: 640px) {
  .trazabilidad-banner {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .version-badge {
    margin-left: 0;
    margin-top: 4px;
  }
}
</style>
