<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth.js'
import apolloClient from '../../graphql/client.js'
import {
  OBTENER_USUARIO_POR_ID,
  OBTENER_UNIDADES_DIDACTICAS,
  OBTENER_EVALUACIONES_ESTUDIANTE,
  ACTUALIZAR_FICHA_MONITOREO_ESTUDIANTE
} from '../../graphql/queries.js'
import { gql } from 'graphql-tag'

const props = defineProps({ id: String, alumnoId: String }) // id represents cursoId, alumnoId is the student
const router = useRouter()
const { usuario } = useAuth()

const alumno = ref(null)
const representante = ref(null)
const unidades = ref([])
const evaluaciones = ref([])
const cargando = ref(true)
const guardando = ref(false)

// Modales y formularios
const mostrarModalEvaluar = ref(false)
const mostrarModalFicha = ref(false)
const toast = ref({ show: false, message: '', type: 'success' })

// Formulario de evaluación
const actividadSeleccionada = ref('')
const evaluacionForm = ref([]) // Array de { id_criterio, nivel_logro, observaciones }

// Formulario de ficha
const fichaForm = ref({
  clasificacion: 'INICIADO',
  seriacion: 'INICIADO',
  asimilacion_acomodacion: 'INICIADO',
  justificacion: '',
  autoregulacion: 'INICIADO',
  observaciones: '',
  acciones_apoyo: ''
})

const actividadesDisponibles = computed(() => {
  const list = []
  unidades.value.forEach(u => {
    (u.actividades || []).forEach(act => {
      list.push({
        id_actividad: act.id_actividad,
        descripcion: act.descripcion_actividad,
        criterios: act.criterios_evaluacion || [],
        unidadAmbito: u.ambito
      })
    })
  })
  return list
})

// Criterios de la actividad seleccionada para el formulario
const criteriosActividadSeleccionada = computed(() => {
  const act = actividadesDisponibles.value.find(a => a.id_actividad === actividadSeleccionada.value)
  return act ? act.criterios : []
})

// Historial de evaluaciones del alumno
const evaluacionesAlumno = computed(() => {
  return evaluaciones.value.filter(e => e.id_estudiante === props.alumnoId)
})

// Cargar todos los datos
async function cargarDatos() {
  cargando.value = true
  try {
    // 1. Cargar datos del alumno
    const resAlumno = await apolloClient.query({
      query: OBTENER_USUARIO_POR_ID,
      variables: { id: props.alumnoId }
    })
    alumno.value = resAlumno.data.usuarioPorId

    // 2. Cargar representante
    if (alumno.value?.id_representante) {
      const resRep = await apolloClient.query({
        query: OBTENER_USUARIO_POR_ID,
        variables: { id: alumno.value.id_representante }
      })
      representante.value = resRep.data.usuarioPorId
    }

    // 3. Cargar unidades del curso
    const resUnidades = await apolloClient.query({
      query: OBTENER_UNIDADES_DIDACTICAS
    })
    unidades.value = resUnidades.data.unidadesDidacticas || []

    // 4. Cargar evaluaciones de estudiantes
    await refrescarEvaluaciones()

    // Inicializar ficha si ya existe una evaluación con ficha
    const primeraEvalConFicha = evaluacionesAlumno.value.find(e => e.ficha_monitoreo)
    if (primeraEvalConFicha?.ficha_monitoreo) {
      fichaForm.value = { ...primeraEvalConFicha.ficha_monitoreo }
    }

  } catch (err) {
    console.error("Error al cargar datos del alumno", err)
    mostrarToast("Error al cargar datos", "error")
  } finally {
    cargando.value = false
  }
}

async function refrescarEvaluaciones() {
  const resEvals = await apolloClient.query({
    query: OBTENER_EVALUACIONES_ESTUDIANTE,
    fetchPolicy: 'network-only'
  })
  evaluaciones.value = resEvals.data.evaluacionesEstudiantes || []
}

function handleActividadChange() {
  const criterios = criteriosActividadSeleccionada.value
  evaluacionForm.value = criterios.map(c => ({
    id_criterio: c.id_criterio,
    nivel_logro: 'INICIADO',
    observaciones: ''
  }))
}

// Registrar nueva evaluación (crear o agregar versión)
const REGISTRAR_EVALUACION = gql`
  mutation RegistrarEvaluacion(
    $estudianteId: ID!
    $actividadId: ID!
    $docenteId: ID!
    $criteriosInput: [EvaluacionCriterioInput!]!
    $fichaInput: FichaMonitoreoInput!
  ) {
    registrarEvaluacion(
      estudianteId: $estudianteId
      actividadId: $actividadId
      docenteId: $docenteId
      criteriosInput: $criteriosInput
      fichaInput: $fichaInput
    ) {
      _id
    }
  }
`

async function guardarEvaluacion() {
  if (!actividadSeleccionada.value) return
  guardando.value = true
  try {
    await apolloClient.mutate({
      mutation: REGISTRAR_EVALUACION,
      variables: {
        estudianteId: props.alumnoId,
        actividadId: actividadSeleccionada.value,
        docenteId: usuario.value._id,
        criteriosInput: evaluacionForm.value.map(c => ({
          id_criterio: c.id_criterio,
          nivel_logro: c.nivel_logro,
          observaciones: c.observaciones || ''
        })),
        fichaInput: {
          clasificacion: fichaForm.value.clasificacion || 'INICIADO',
          seriacion: fichaForm.value.seriacion || 'INICIADO',
          asimilacion_acomodacion: fichaForm.value.asimilacion_acomodacion || 'INICIADO',
          justificacion: fichaForm.value.justificacion || '',
          autoregulacion: fichaForm.value.autoregulacion || 'INICIADO',
          observaciones: fichaForm.value.observaciones || '',
          acciones_apoyo: fichaForm.value.acciones_apoyo || ''
        }
      }
    })

    mostrarToast("Evaluación registrada con éxito", "success")
    mostrarModalEvaluar.value = false
    actividadSeleccionada.value = ''
    await refrescarEvaluaciones()
  } catch (err) {
    console.error(err)
    mostrarToast("Error al guardar evaluación", "error")
  } finally {
    guardando.value = false
  }
}

async function guardarFichaMonitoreo() {
  guardando.value = true
  try {
    // Buscar si hay un id de evaluación para el alumno, o crear una evaluación vacía
    let evalId = `eval-${props.alumnoId}-${actividadesDisponibles.value[0]?.id_actividad || 'general'}`
    if (evaluacionesAlumno.value.length > 0) {
      evalId = evaluacionesAlumno.value[0]._id
    } else {
      // Si no tiene evaluaciones, debemos crear una básica antes para poder registrar la ficha
      if (actividadesDisponibles.value.length > 0) {
        await apolloClient.mutate({
          mutation: REGISTRAR_EVALUACION,
          variables: {
            estudianteId: props.alumnoId,
            actividadId: actividadesDisponibles.value[0].id_actividad,
            docenteId: usuario.value._id,
            criteriosInput: [],
            fichaInput: fichaForm.value
          }
        })
        mostrarToast("Ficha de monitoreo creada", "success")
        mostrarModalFicha.value = false
        await refrescarEvaluaciones()
        guardando.value = false
        return
      } else {
        throw new Error("No hay actividades registradas para asociar la ficha")
      }
    }

    await apolloClient.mutate({
      mutation: ACTUALIZAR_FICHA_MONITOREO_ESTUDIANTE,
      variables: {
        id_evaluacion: evalId,
        ficha: {
          clasificacion: fichaForm.value.clasificacion || 'INICIADO',
          seriacion: fichaForm.value.seriacion || 'INICIADO',
          asimilacion_acomodacion: fichaForm.value.asimilacion_acomodacion || 'INICIADO',
          justificacion: fichaForm.value.justificacion || '',
          autoregulacion: fichaForm.value.autoregulacion || 'INICIADO',
          observaciones: fichaForm.value.observaciones || '',
          acciones_apoyo: fichaForm.value.acciones_apoyo || ''
        }
      }
    })

    mostrarToast("Ficha de monitoreo actualizada", "success")
    mostrarModalFicha.value = false
    await refrescarEvaluaciones()
  } catch (err) {
    console.error(err)
    mostrarToast("Error al guardar la ficha: " + err.message, "error")
  } finally {
    guardando.value = false
  }
}

function abrirNuevaEvaluacion() {
  actividadSeleccionada.value = ''
  evaluacionForm.value = []
  mostrarModalEvaluar.value = true
}

function abrirFicha() {
  mostrarModalFicha.value = true
}

function getCriterioTexto(id) {
  if (id === 'crit-001') return 'Clasificación de Información'
  if (id === 'crit-002') return 'Seriación y Ordenamiento'
  return id
}

function getLabel(nivel) {
  switch (nivel) {
    case 'INICIADO': return 'Iniciado'
    case 'EN PROCESO': return 'En Proceso'
    case 'LOGRADO': return 'Logrado'
    default: return nivel
  }
}

function getBadgeClass(nivel) {
  switch (nivel) {
    case 'LOGRADO': return 'badge-success'
    case 'EN PROCESO': return 'badge-primary'
    default: return 'badge-warning'
  }
}

function mostrarToast(message, type) {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}

onMounted(cargarDatos)
</script>

<template>
  <div class="seguimiento-alumno">
    <!-- Botón Volver -->
    <button class="back-btn" @click="router.push(`/docente/grupos/${props.id}`)">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      Volver al Grupo
    </button>

    <div v-if="cargando" class="loading-state">
      <div class="spinner spinner-lg"></div>
      <p>Cargando información de seguimiento...</p>
    </div>

    <div v-else-if="!alumno" class="empty-state">
      <h3>Alumno no encontrado</h3>
      <button class="btn btn-ghost" @click="router.push(`/docente/grupos/${props.id}`)">Volver</button>
    </div>

    <template v-else>
      <!-- Cabecera Alumno -->
      <div class="page-header animate-fade-in">
        <div class="alumno-profile-banner">
          <div class="student-avatar-lg">
            {{ alumno.nombre?.[0]?.toUpperCase() || '?' }}
          </div>
          <div>
            <h1>{{ alumno.nombre }}</h1>
            <p class="alumno-username">@{{ alumno.username }}</p>
            
            <div v-if="representante" class="rep-card">
              <span class="label">Representante:</span>
              <strong>{{ representante.nombre }}</strong>
              <span class="contact-info">
                {{ representante.contacto?.numero ? `📞 ${representante.contacto.numero}` : '' }}
                {{ representante.contacto?.correo ? `✉️ ${representante.contacto.correo}` : '' }}
              </span>
            </div>
          </div>
        </div>

        <div class="header-actions">
          <button class="btn btn-ghost" @click="abrirFicha">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            Ficha de Monitoreo
          </button>
          <button class="btn btn-primary" @click="abrirNuevaEvaluacion" :disabled="actividadesDisponibles.length === 0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Registrar Evaluación
          </button>
        </div>
      </div>

      <!-- Ficha de Monitoreo Actual (Resumen) -->
      <div class="ficha-resume-section animate-slide-up" style="animation-delay: 0.05s">
        <h3>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          Ficha de Monitoreo y Acciones de Apoyo
        </h3>
        <div class="ficha-details-grid">
          <div class="ficha-detail-item">
            <span class="lbl">Clasificación:</span>
            <span class="val">{{ getLabel(fichaForm.clasificacion) }}</span>
          </div>
          <div class="ficha-detail-item">
            <span class="lbl">Seriación:</span>
            <span class="val">{{ getLabel(fichaForm.seriacion) }}</span>
          </div>
          <div class="ficha-detail-item">
            <span class="lbl">Asimilación y Acomodación:</span>
            <span class="val">{{ getLabel(fichaForm.asimilacion_acomodacion) }}</span>
          </div>
          <div class="ficha-detail-item">
            <span class="lbl">Autorregulación:</span>
            <span class="val">{{ getLabel(fichaForm.autoregulacion) }}</span>
          </div>
          <div class="ficha-detail-item full-width" v-if="fichaForm.justificacion">
            <span class="lbl">Justificación lógica del alumno:</span>
            <p class="val-text">{{ fichaForm.justificacion }}</p>
          </div>
          <div class="ficha-detail-item full-width" v-if="fichaForm.observaciones">
            <span class="lbl">Observaciones Generales:</span>
            <p class="val-text">{{ fichaForm.observaciones }}</p>
          </div>
          <div class="ficha-detail-item full-width highlight" v-if="fichaForm.acciones_apoyo">
            <span class="lbl">Acciones de Apoyo (Asignadas para Casa):</span>
            <p class="val-text text-primary">{{ fichaForm.acciones_apoyo }}</p>
          </div>
        </div>
      </div>

      <!-- Historial de Evaluaciones -->
      <section class="timeline-section animate-slide-up" style="animation-delay: 0.1s">
        <h2>Historial de Evaluaciones y Trazabilidad (Inmutable)</h2>

        <div v-if="evaluacionesAlumno.length === 0" class="empty-state">
          <p>No se han registrado evaluaciones todavía para este alumno en este curso.</p>
        </div>

        <div v-else class="evaluaciones-list-crono">
          <div v-for="ev in evaluacionesAlumno" :key="ev._id" class="crono-eval-card">
            <div class="crono-card-header">
              <div>
                <h4>Actividad Evaluada: <code>{{ ev.id_actividad }}</code></h4>
                <p class="desc-corta">{{ actividadesDisponibles.find(a => a.id_actividad === ev.id_actividad)?.descripcion || 'Sin descripción' }}</p>
              </div>
            </div>

            <!-- Listado de Versiones inmutables (Trazabilidad RNF-06) -->
            <div class="versions-trace">
              <h5>Historial de Versiones (Versiones Anteriores y Actual):</h5>
              <div v-for="ver in ev.historial_versiones" :key="ver.version" class="version-item">
                <div class="version-badge">v{{ ver.version }}</div>
                <div class="version-details">
                  <div class="version-meta">
                    Registrado el: <strong>{{ new Date(parseInt(ver.fecha_registro)).toLocaleString() }}</strong>
                    por Docente ID: <code>{{ ver.docente_evaluador }}</code>
                  </div>
                  
                  <div class="criterios-evaluados">
                    <div v-for="c in ver.evaluaciones_criterio" :key="c.id_criterio" class="criterio-eval-item">
                      <div class="crit-head">
                        <strong>{{ getCriterioTexto(c.id_criterio) }}</strong>
                        <span class="badge" :class="getBadgeClass(c.nivel_logro)">{{ getLabel(c.nivel_logro) }}</span>
                      </div>
                      <p class="crit-obs" v-if="c.observaciones"><em>Observación:</em> {{ c.observaciones }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <!-- ═══ MODAL: REGISTRAR EVALUACIÓN ═══ -->
      <div v-if="mostrarModalEvaluar" class="modal-overlay" @click.self="mostrarModalEvaluar = false">
        <div class="modal-content modal-lg">
          <div class="modal-header">
            <h3>Registrar Evaluación de Alumno</h3>
            <button class="modal-close" @click="mostrarModalEvaluar = false">✕</button>
          </div>

          <form @submit.prevent="guardarEvaluacion" class="evaluar-form">
            <div class="form-group">
              <label class="form-label">Seleccionar Actividad *</label>
              <select v-model="actividadSeleccionada" @change="handleActividadChange" class="form-input" required>
                <option value="" disabled>Selecciona una actividad...</option>
                <option v-for="act in actividadesDisponibles" :key="act.id_actividad" :value="act.id_actividad">
                  [{{ act.unidadAmbito }}] {{ act.descripcion.substring(0, 60) }}...
                </option>
              </select>
            </div>

            <!-- Criterios de la Actividad Seleccionada -->
            <div v-if="actividadSeleccionada && evaluacionForm.length > 0" class="criterios-form-list">
              <h4>Criterios a Evaluar:</h4>
              <div v-for="(item, idx) in evaluacionForm" :key="item.id_criterio" class="criterio-form-card">
                <h5>{{ getCriterioTexto(item.id_criterio) }}</h5>
                <div class="form-group">
                  <label class="form-label">Nivel de Logro</label>
                  <div class="radio-group-criterio">
                    <label class="radio-btn">
                      <input type="radio" :name="'nivel-' + idx" value="INICIADO" v-model="item.nivel_logro">
                      <span>Iniciado</span>
                    </label>
                    <label class="radio-btn">
                      <input type="radio" :name="'nivel-' + idx" value="EN PROCESO" v-model="item.nivel_logro">
                      <span>En Proceso</span>
                    </label>
                    <label class="radio-btn">
                      <input type="radio" :name="'nivel-' + idx" value="LOGRADO" v-model="item.nivel_logro">
                      <span>Logrado</span>
                    </label>
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Observaciones específicas</label>
                  <input type="text" v-model="item.observaciones" class="form-input" placeholder="Ej. 'Identifica parcialmente...'">
                </div>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-ghost" @click="mostrarModalEvaluar = false">Cancelar</button>
              <button type="submit" class="btn btn-primary" :disabled="guardando || !actividadSeleccionada">
                <span v-if="guardando" class="spinner"></span>
                <span v-else>Guardar Evaluación</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- ═══ MODAL: FICHA DE MONITOREO ═══ -->
      <div v-if="mostrarModalFicha" class="modal-overlay" @click.self="mostrarModalFicha = false">
        <div class="modal-content modal-lg">
          <div class="modal-header">
            <h3>Ficha de Monitoreo Individual</h3>
            <button class="modal-close" @click="mostrarModalFicha = false">✕</button>
          </div>

          <form @submit.prevent="guardarFichaMonitoreo" class="ficha-form">
            <div class="form-grid-columns">
              <div class="form-group">
                <label class="form-label">Clasificación</label>
                <select v-model="fichaForm.clasificacion" class="form-input">
                  <option value="INICIADO">Iniciado</option>
                  <option value="EN PROCESO">En Proceso</option>
                  <option value="LOGRADO">Logrado</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Seriación</label>
                <select v-model="fichaForm.seriacion" class="form-input">
                  <option value="INICIADO">Iniciado</option>
                  <option value="EN PROCESO">En Proceso</option>
                  <option value="LOGRADO">Logrado</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Asimilación y Acomodación</label>
                <select v-model="fichaForm.asimilacion_acomodacion" class="form-input">
                  <option value="INICIADO">Iniciado</option>
                  <option value="EN PROCESO">En Proceso</option>
                  <option value="LOGRADO">Logrado</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Autorregulación</label>
                <select v-model="fichaForm.autoregulacion" class="form-input">
                  <option value="INICIADO">Iniciado</option>
                  <option value="EN PROCESO">En Proceso</option>
                  <option value="LOGRADO">Logrado</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Justificación Lógica del Alumno</label>
              <textarea v-model="fichaForm.justificacion" class="form-input text-area" rows="2" placeholder="Explicación o razonamiento del niño..."></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Observaciones Generales</label>
              <textarea v-model="fichaForm.observaciones" class="form-input text-area" rows="2" placeholder="Observaciones generales sobre el desempeño..."></textarea>
            </div>

            <div class="form-group">
              <label class="form-label text-primary">Acciones de Apoyo (Para el Hogar)</label>
              <textarea v-model="fichaForm.acciones_apoyo" class="form-input text-area highlight-border" rows="3" placeholder="Recomendaciones y actividades de refuerzo para la familia..."></textarea>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-ghost" @click="mostrarModalFicha = false">Cancelar</button>
              <button type="submit" class="btn btn-primary" :disabled="guardando">
                <span v-if="guardando" class="spinner"></span>
                <span v-else>Guardar Ficha</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Toast -->
      <Transition name="toast">
        <div v-if="toast.show" class="toast" :class="'toast-' + toast.type">
          <svg v-if="toast.type === 'success'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--success-400)" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--danger-400)" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          {{ toast.message }}
        </div>
      </Transition>
    </template>
  </div>
</template>

<style scoped>
.seguimiento-alumno {
  animation: fadeIn var(--transition-slow) ease-out;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: var(--text-muted);
  font-family: var(--font-sans);
  font-size: 0.88rem;
  cursor: pointer;
  padding: 6px 0;
  margin-bottom: 20px;
  transition: color var(--transition-fast);
}
.back-btn:hover {
  color: var(--primary-400);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 32px;
}

.alumno-profile-banner {
  display: flex;
  align-items: center;
  gap: 20px;
}

.student-avatar-lg {
  width: 72px;
  height: 72px;
  border-radius: var(--radius-md);
  background: var(--gradient-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 800;
  flex-shrink: 0;
}

.alumno-username {
  color: var(--primary-400);
  font-weight: 500;
  margin-top: 2px;
}

.rep-card {
  margin-top: 8px;
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.rep-card .label {
  color: var(--text-muted);
  margin-right: 4px;
}

.rep-card .contact-info {
  display: block;
  font-size: 0.72rem;
  color: var(--text-muted);
  margin-top: 2px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* Ficha de Monitoreo Resumen */
.ficha-resume-section {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 24px;
  margin-bottom: 36px;
}

.ficha-resume-section h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
  margin-bottom: 20px;
  color: var(--text-primary);
}

.ficha-resume-section h3 svg {
  color: var(--accent-400);
}

.ficha-details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.ficha-detail-item {
  background: rgba(0,0,0,0.15);
  border: 1px solid var(--border-color);
  padding: 12px;
  border-radius: var(--radius-sm);
}

.ficha-detail-item.full-width {
  grid-column: 1 / -1;
}

.ficha-detail-item.highlight {
  background: rgba(252,196,25,0.04);
  border-color: rgba(252,196,25,0.15);
}

.ficha-detail-item .lbl {
  display: block;
  font-size: 0.72rem;
  text-transform: uppercase;
  color: var(--text-muted);
  font-weight: 700;
  margin-bottom: 4px;
}

.ficha-detail-item .val {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
}

.val-text {
  font-size: 0.92rem;
  line-height: 1.5;
  color: var(--text-secondary);
}

.text-primary {
  color: var(--primary-400) !important;
}

/* Historial y Línea de Tiempo */
.timeline-section h2 {
  font-size: 1.25rem;
  margin-bottom: 24px;
  color: var(--text-primary);
}

.evaluaciones-list-crono {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.crono-eval-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 24px;
}

.crono-card-header h4 {
  font-size: 1.05rem;
  margin-bottom: 4px;
}

.desc-corta {
  font-size: 0.88rem;
  color: var(--text-muted);
  line-height: 1.4;
}

.versions-trace {
  margin-top: 20px;
  border-top: 1px solid var(--border-color);
  padding-top: 20px;
}

.versions-trace h5 {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.version-item {
  display: flex;
  gap: 16px;
  margin-bottom: 18px;
  position: relative;
}

.version-badge {
  background: var(--primary-600);
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.72rem;
  font-weight: bold;
  flex-shrink: 0;
  box-shadow: 0 0 10px rgba(76,110,245,0.3);
}

.version-details {
  flex: 1;
  background: rgba(0,0,0,0.15);
  padding: 16px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
}

.version-meta {
  font-size: 0.78rem;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.version-meta strong {
  color: var(--text-secondary);
}

.criterios-evaluados {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 12px;
}

.criterio-eval-item {
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--border-color);
  padding: 10px 14px;
  border-radius: var(--radius-sm);
}

.crit-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.88rem;
  margin-bottom: 6px;
}

.crit-obs {
  font-size: 0.82rem;
  color: var(--text-muted);
  margin-top: 4px;
  border-top: 1px dashed rgba(255,255,255,0.05);
  padding-top: 4px;
}

/* Modales */
.evaluar-form, .ficha-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-grid-columns {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.criterios-form-list {
  border-top: 1px solid var(--border-color);
  padding-top: 16px;
}

.criterios-form-list h4 {
  font-size: 0.95rem;
  margin-bottom: 14px;
  color: var(--text-secondary);
}

.criterio-form-card {
  background: rgba(0,0,0,0.2);
  border: 1px solid var(--border-color);
  padding: 16px;
  border-radius: var(--radius-md);
  margin-bottom: 14px;
}

.criterio-form-card h5 {
  font-size: 0.92rem;
  margin-bottom: 12px;
  color: var(--text-primary);
}

.radio-group-criterio {
  display: flex;
  gap: 12px;
}

.radio-btn {
  flex: 1;
  cursor: pointer;
}

.radio-btn input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.radio-btn span {
  display: block;
  text-align: center;
  padding: 8px 12px;
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 0.82rem;
  font-weight: 500;
  transition: all var(--transition-fast);
  color: var(--text-secondary);
}

.radio-btn input:checked + span {
  background: rgba(76,110,245,0.15);
  border-color: var(--primary-400);
  color: var(--text-primary);
  box-shadow: 0 0 10px rgba(76,110,245,0.15);
}

.text-area {
  resize: vertical;
}

.highlight-border {
  border-color: rgba(76,110,245,0.25) !important;
}

.highlight-border:focus {
  border-color: var(--primary-500) !important;
}

/* Responsividad */
@media (max-width: 640px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .header-actions {
    width: 100%;
  }
  .header-actions .btn {
    flex: 1;
  }
}
</style>
