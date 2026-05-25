<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth.js'
import apolloClient from '../../graphql/client.js'
import { 
  OBTENER_USUARIO_POR_ID,
  OBTENER_CURSO_POR_ID,
  OBTENER_UNIDADES_DIDACTICAS,
  OBTENER_EVALUACIONES_ESTUDIANTE
} from '../../graphql/queries.js'

const props = defineProps({ id: String })
const router = useRouter()
const { usuario } = useAuth()

const hijo = ref(null)
const curso = ref(null)
const docente = ref(null)
const unidadesActivas = ref([])
const evaluaciones = ref([])
const cargando = ref(true)

// Helper: Convertir ID del criterio a texto legible
function getCriterioTexto(id) {
  if (id === 'crit-001') return 'Clasificación de Información'
  if (id === 'crit-002') return 'Seriación y Ordenamiento'
  return id
}

// Helper: Convertir nivel a formato amigable
function getLabel(nivel) {
  switch (nivel) {
    case 'INICIADO':
    case 'I':
      return 'Iniciado'
    case 'EN PROCESO':
    case 'EP':
      return 'En Proceso'
    case 'LOGRADO':
    case 'L':
      return 'Logrado'
    default:
      return nivel
  }
}

function getNivelClass(nivel) {
  const n = String(nivel).toUpperCase()
  if (n.includes('LOGRADO') || n === 'L') return 'nivel-logrado'
  if (n.includes('PROCESO') || n === 'EP') return 'nivel-proceso'
  return 'nivel-iniciado'
}

// Agrupar evaluaciones por fecha (Línea de tiempo cronológica)
const evaluacionesOrdenadas = computed(() => {
  if (!evaluaciones.value?.length) return []
  return [...evaluaciones.value].sort((a, b) => {
    const dateA = a.historial_versiones?.[0]?.fecha_registro || 0
    const dateB = b.historial_versiones?.[0]?.fecha_registro || 0
    return parseInt(dateB) - parseInt(dateA) // Descendente (más reciente primero)
  })
})

// Comparación de criterios a lo largo del tiempo
const comparativaCriterios = computed(() => {
  if (!evaluaciones.value?.length) return []
  const mapCriterios = {}

  // Ordenamos cronológicamente (más antiguo a más reciente para ver avance)
  const cronoEvals = [...evaluaciones.value].sort((a, b) => {
    const dateA = a.historial_versiones?.[0]?.fecha_registro || 0
    const dateB = b.historial_versiones?.[0]?.fecha_registro || 0
    return parseInt(dateA) - parseInt(dateB)
  })

  cronoEvals.forEach(ev => {
    const ultima = ev.historial_versiones?.[ev.historial_versiones.length - 1]
    if (ultima?.evaluaciones_criterio) {
      ultima.evaluaciones_criterio.forEach(c => {
        if (!mapCriterios[c.id_criterio]) {
          mapCriterios[c.id_criterio] = []
        }
        mapCriterios[c.id_criterio].push({
          actividadId: ev.id_actividad,
          fecha: ultima.fecha_registro,
          nivel: c.nivel_logro,
          observaciones: c.observaciones
        })
      })
    }
  })

  return Object.entries(mapCriterios).map(([id_criterio, historico]) => ({
    id_criterio,
    nombre: getCriterioTexto(id_criterio),
    historico
  }))
})

async function cargarDatosPerfil() {
  cargando.value = true
  try {
    // Validar que el hijo pertenezca al usuario logueado (RNF-02)
    if (!usuario.value?.hijos?.includes(props.id)) {
      router.push('/familia')
      return
    }

    // 1. Obtener datos del hijo
    const resHijo = await apolloClient.query({
      query: OBTENER_USUARIO_POR_ID,
      variables: { id: props.id }
    })
    hijo.value = resHijo.data.usuarioPorId

    if (hijo.value && hijo.value.id_cursos?.length > 0) {
      // 2. Obtener datos del curso principal
      const idCurso = hijo.value.id_cursos[0]
      const resCurso = await apolloClient.query({
        query: OBTENER_CURSO_POR_ID,
        variables: { id: idCurso }
      })
      curso.value = resCurso.data.cursoPorId

      if (curso.value?.id_docente) {
        // 3. Obtener datos del docente
        const resDocente = await apolloClient.query({
          query: OBTENER_USUARIO_POR_ID,
          variables: { id: curso.value.id_docente }
        })
        docente.value = resDocente.data.usuarioPorId
      }
    }

    // 4. Obtener unidades didácticas activas
    const resUnidades = await apolloClient.query({
      query: OBTENER_UNIDADES_DIDACTICAS
    })
    
    unidadesActivas.value = (resUnidades.data.unidadesDidacticas || [])
      .filter(u => u.activo)
      
    // 5. Obtener Evaluaciones (Progreso)
    const resEvaluaciones = await apolloClient.query({
      query: OBTENER_EVALUACIONES_ESTUDIANTE
    })
    
    evaluaciones.value = (resEvaluaciones.data.evaluacionesEstudiantes || [])
      .filter(e => e.id_estudiante === props.id)
      
  } catch (err) {
    console.error("Error al cargar perfil", err)
  } finally {
    cargando.value = false
  }
}

function irAInicio() {
  router.push('/familia')
}

function irAActividades() {
  router.push(`/familia/hijo/${props.id}/actividades`)
}

function verProgreso(actividadId) {
  router.push(`/familia/hijo/${props.id}/progreso/${actividadId}`)
}

onMounted(cargarDatosPerfil)

watch(() => props.id, (nuevoId) => {
  if (nuevoId) {
    cargarDatosPerfil()
  }
})
</script>

<template>
  <div class="perfil-hijo animate-fade-in">
    <!-- Header/Back -->
    <div class="page-header">
      <button class="btn btn-ghost btn-sm btn-back" @click="irAInicio">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        Volver a la selección
      </button>
    </div>

    <div v-if="cargando" class="loading-state">
      <div class="spinner spinner-lg"></div>
      <p>Cargando información del alumno...</p>
    </div>

    <div v-else-if="!hijo" class="empty-state">
      <p>No se pudo cargar la información del alumno.</p>
    </div>

    <div v-else class="perfil-content">
      <!-- Tarjeta Principal del Alumno (RF-F01) -->
      <div class="alumno-header-card">
        <div class="alumno-avatar-lg">
          {{ hijo.nombre?.[0]?.toUpperCase() || '?' }}
        </div>
        <div class="alumno-main-info">
          <h1>{{ hijo.nombre }}</h1>
          <p class="alumno-username">@{{ hijo.username }}</p>
          <div class="tags-row">
            <span class="badge badge-success">Estudiante Activo</span>
            <span class="badge badge-outline">ID: {{ hijo._id }}</span>
          </div>
        </div>
      </div>

      <!-- Grid de Información Académica -->
      <div class="info-grid animate-slide-up">
        <!-- Grupo y Docente -->
        <div class="info-card">
          <div class="card-icon blue">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div class="card-content">
            <h3>Grupo Asignado</h3>
            <p class="valor-destacado">{{ curso ? curso.nombre_curso : 'No asignado' }}</p>
            
            <div v-if="docente" class="docente-info">
              <span class="label">Docente Responsable:</span>
              <div class="docente-perfil">
                <div class="doc-avatar">{{ docente.nombre?.[0] || 'D' }}</div>
                <span>{{ docente.nombre }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Accesos Rápidos -->
        <div class="info-card">
          <div class="card-icon orange">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          </div>
          <div class="card-content">
            <h3>Tareas y Seguimiento</h3>
            <p class="valor-desc">Revisa el avance de tu representado</p>
            
            <div class="accesos-acciones">
              <button class="btn btn-primary w-full" @click="irAActividades">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                Ver Actividades en Casa
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Comparativa de Logros por Criterio (RF-F03) -->
      <section class="comparativa-section animate-slide-up" style="animation-delay: 0.1s">
        <div class="section-header">
          <h2>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            Comparación de Logros entre Períodos
          </h2>
          <p class="section-subtitle">Visualiza la evolución de los criterios evaluados a lo largo del tiempo</p>
        </div>

        <div v-if="comparativaCriterios.length === 0" class="empty-state-small">
          <p>No hay evaluaciones suficientes para generar una comparación.</p>
        </div>

        <div v-else class="comparativa-grid">
          <div v-for="criterio in comparativaCriterios" :key="criterio.id_criterio" class="comparativa-card">
            <div class="comp-card-header">
              <h4>{{ criterio.nombre }}</h4>
            </div>
            
            <!-- Flujo de avance -->
            <div class="comp-flow">
              <div v-for="(hist, idx) in criterio.historico" :key="idx" class="comp-step">
                <div class="step-badge" :class="getNivelClass(hist.nivel)">
                  {{ getLabel(hist.nivel) }}
                </div>
                <div class="step-date">
                  {{ new Date(parseInt(hist.fecha)).toLocaleDateString() }}
                </div>
                <div v-if="idx < criterio.historico.length - 1" class="step-arrow">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Unidades Activas -->
      <section class="unidades-section animate-slide-up" style="animation-delay: 0.15s">
        <div class="section-header">
          <h2>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            Planificación y Unidades Activas
          </h2>
        </div>

        <div v-if="unidadesActivas.length === 0" class="empty-state-small">
          <p>No hay unidades activas actualmente para este curso.</p>
        </div>

        <div v-else class="unidades-list">
          <div v-for="unidad in unidadesActivas" :key="unidad._id" class="unidad-card">
            <div class="unidad-info">
              <div class="unidad-ambito">{{ unidad.ambito }}</div>
              <h4>{{ unidad.objetivo_general }}</h4>
              <p class="unidad-meta">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                {{ new Date(parseInt(unidad.fecha_inicio)).toLocaleDateString() }} - {{ new Date(parseInt(unidad.fecha_fin)).toLocaleDateString() }}
              </p>
            </div>
            <div class="unidad-stats">
              <div class="stat">
                <span class="stat-val">{{ (unidad.actividades || []).length }}</span>
                <span class="stat-lbl">Actividades</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Evaluaciones / Progreso (Línea de Tiempo - RF-F03) -->
      <section class="evaluaciones-section animate-slide-up" style="animation-delay: 0.2s">
        <div class="section-header">
          <h2>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            Historial de Evaluaciones
          </h2>
        </div>

        <div v-if="evaluacionesOrdenadas.length === 0" class="empty-state-small">
          <p>Aún no hay evaluaciones registradas para este alumno.</p>
        </div>

        <div v-else class="evaluaciones-list timeline">
          <div 
            v-for="ev in evaluacionesOrdenadas" 
            :key="ev._id" 
            class="evaluacion-card timeline-item"
            @click="verProgreso(ev.id_actividad)"
          >
            <div class="eval-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <div class="eval-info">
              <h4>Evaluación registrada para Actividad</h4>
              <p class="eval-meta">ID Actividad: <code>{{ ev.id_actividad }}</code></p>
              <p v-if="ev.historial_versiones?.length > 0" class="eval-time">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Última versión (v{{ ev.historial_versiones.length }}): {{ new Date(parseInt(ev.historial_versiones[ev.historial_versiones.length - 1].fecha_registro)).toLocaleString() }}
              </p>
            </div>
            <div class="eval-action">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: 24px;
}
.btn-back {
  padding-left: 0;
  color: var(--text-muted);
}
.btn-back:hover {
  color: var(--text-primary);
}

.perfil-content {
  display: flex;
  flex-direction: column;
  gap: 36px;
}

/* ── CABECERA ALUMNO ── */
.alumno-header-card {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 30px;
  background: var(--gradient-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.alumno-avatar-lg {
  width: 80px;
  height: 80px;
  background: var(--gradient-accent);
  color: var(--gray-900);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.2rem;
  font-weight: 800;
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.alumno-main-info h1 {
  font-size: 1.8rem;
  font-weight: 800;
  margin-bottom: 4px;
  letter-spacing: -0.02em;
}

.alumno-username {
  color: var(--accent-400);
  font-size: 0.95rem;
  font-weight: 500;
  margin-bottom: 12px;
}

.tags-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* ── INFO GRID ── */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
}

.info-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 24px;
  display: flex;
  gap: 16px;
  transition: all var(--transition-base);
}

.info-card:hover {
  border-color: var(--border-color-hover);
  transform: translateY(-2px);
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-icon.blue {
  background: rgba(76,110,245,0.12);
  color: var(--primary-400);
}

.card-icon.orange {
  background: rgba(253,150,68,0.12);
  color: #fd9644;
}

.card-content {
  flex: 1;
}

.card-content h3 {
  font-size: 1.05rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.valor-destacado {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.valor-desc {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.docente-info {
  border-top: 1px solid var(--border-color);
  padding-top: 12px;
  font-size: 0.85rem;
}

.docente-info .label {
  color: var(--text-muted);
  display: block;
  margin-bottom: 6px;
}

.docente-perfil {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: var(--text-secondary);
}

.doc-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--gradient-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.72rem;
  font-weight: bold;
}

/* ── COMPARATIVA SECCIÓN ── */
.comparativa-section {
  background: rgba(255,255,255,0.01);
  border: 1px solid var(--border-color);
  padding: 28px;
  border-radius: var(--radius-lg);
}

.section-subtitle {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-top: 4px;
  margin-bottom: 24px;
}

.comparativa-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comparativa-card {
  background: rgba(11,15,26,0.6);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 16px 20px;
}

.comp-card-header h4 {
  font-size: 0.95rem;
  color: var(--text-secondary);
  margin-bottom: 14px;
  font-weight: 700;
}

.comp-flow {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.comp-step {
  display: flex;
  align-items: center;
  gap: 12px;
}

.step-badge {
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.nivel-logrado {
  background: rgba(64,192,87,0.15);
  color: var(--success-400);
  border: 1px solid rgba(64,192,87,0.3);
}

.nivel-proceso {
  background: rgba(76,110,245,0.15);
  color: var(--primary-400);
  border: 1px solid rgba(76,110,245,0.3);
}

.nivel-iniciado {
  background: rgba(252,196,25,0.12);
  color: var(--accent-400);
  border: 1px solid rgba(252,196,25,0.3);
}

.step-date {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.step-arrow {
  color: var(--text-muted);
  display: flex;
  align-items: center;
}

/* ── PLANIFICACIÓN ── */
.unidades-section .section-header h2 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.2rem;
  margin-bottom: 20px;
}

.unidades-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.unidad-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  gap: 20px;
}

.unidad-ambito {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--primary-400);
  margin-bottom: 6px;
  font-weight: 700;
}

.unidad-info h4 {
  font-size: 1.05rem;
  margin-bottom: 8px;
  line-height: 1.4;
}

.unidad-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.unidad-stats {
  display: flex;
  gap: 16px;
  flex-shrink: 0;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 16px;
  background: rgba(0,0,0,0.2);
  border-radius: var(--radius-md);
}

.stat-val {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-lbl {
  font-size: 0.7rem;
  color: var(--text-muted);
  text-transform: uppercase;
}

/* ── EVALUACIONES ── */
.evaluaciones-section {
  margin-top: 32px;
}

.evaluaciones-section .section-header h2 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.2rem;
  margin-bottom: 20px;
}

.evaluaciones-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.evaluacion-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.evaluacion-card:hover {
  border-color: var(--success-400);
  background: rgba(64,192,87,0.05);
}

.eval-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(64,192,87,0.15);
  color: var(--success-400);
  border-radius: 50%;
  flex-shrink: 0;
}

.eval-info {
  flex: 1;
}

.eval-info h4 {
  font-size: 1rem;
  margin-bottom: 4px;
}

.eval-meta code {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  background: rgba(255,255,255,0.05);
  padding: 2px 6px;
  border-radius: 4px;
}

.eval-time {
  margin-top: 6px;
  font-size: 0.8rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 4px;
}

.eval-action {
  color: var(--text-muted);
  transition: color var(--transition-fast);
}

.evaluacion-card:hover .eval-action {
  color: var(--success-400);
}

/* ── UTIL ── */
.empty-state-small {
  padding: 24px;
  text-align: center;
  background: var(--bg-glass);
  border: 1px dashed var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-muted);
  font-size: 0.9rem;
}

.w-full { width: 100%; }

@media (max-width: 768px) {
  .alumno-header-card {
    flex-direction: column;
    text-align: center;
    gap: 16px;
    padding: 24px;
  }
  .tags-row {
    justify-content: center;
  }
  .unidad-card {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
