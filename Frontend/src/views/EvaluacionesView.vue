<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth.js'
import apolloClient from '../graphql/client.js'
import {
  CURSOS_POR_DOCENTE,
  OBTENER_UNIDADES_DIDACTICAS,
  OBTENER_EVALUACIONES_ESTUDIANTE,
  REGISTRAR_NUEVA_VERSION_EVALUACION,
  REGISTRAR_EVALUACION
} from '../graphql/queries.js'

const { usuario } = useAuth()

// Estado
const cursos = ref([])
const cursoSeleccionado = ref(null)
const unidades = ref([])
const evaluaciones = ref([])
const cargando = ref(false)
const guardando = ref(false)
const toast = ref({ show: false, message: '', type: 'success' })

// Modal nota escrita
const modalNota = ref({ show: false, studentId: null, studentName: '' })
const notaEscrita = ref('')

const CRITERIA_LABELS = {
  'crit-001': 'Clasificación',
  'crit-002': 'Seriación',
  'crit-003': 'Asimilación y Acomodación',
  'crit-004': 'Justificación (Lógica)',
  'crit-005': 'Autorregulación'
}

function getCriterioLabel(id) {
  return CRITERIA_LABELS[id] || id
}

// Computed: estudiantes del curso seleccionado
const students = computed(() => {
  if (!cursoSeleccionado.value) return []
  return cursoSeleccionado.value.estudiantes || []
})

const actividadSeleccionadaId = ref('')

const actividadesDisponibles = computed(() => {
  const acts = []
  unidades.value.forEach(u => {
    ;(u.actividades || []).forEach(a => {
      acts.push({
        id_actividad: a.id_actividad,
        descripcion: a.descripcion_actividad,
        unidad: u.ambito,
        criterios: a.criterios_evaluacion || []
      })
    })
  })
  return acts
})

// Criterios específicos de la actividad seleccionada
const criteria = computed(() => {
  if (!actividadSeleccionadaId.value) return []
  const act = actividadesDisponibles.value.find(a => a.id_actividad === actividadSeleccionadaId.value)
  if (!act) return []
  return act.criterios.map(c => ({
    id: c.id_criterio,
    label: getCriterioLabel(c.id_criterio)
  }))
})

// Estado local de evaluaciones del form (pendientes de guardar)
const evaluationsLocal = ref({})

async function cargarDatos() {
  if (!usuario.value?._id) return
  cargando.value = true
  try {
    const { data } = await apolloClient.query({
      query: CURSOS_POR_DOCENTE,
      variables: { docenteId: usuario.value._id },
      fetchPolicy: 'network-only'
    })
    cursos.value = data.cursosPorDocente || []
    if (cursos.value.length > 0) {
      cursoSeleccionado.value = cursos.value[0]
    }

    const resUnidades = await apolloClient.query({
      query: OBTENER_UNIDADES_DIDACTICAS,
      fetchPolicy: 'network-only'
    })
    unidades.value = resUnidades.data.unidadesDidacticas || []
    
    if (actividadesDisponibles.value.length > 0) {
      actividadSeleccionadaId.value = actividadesDisponibles.value[0].id_actividad
    }

    await cargarEvaluaciones()
  } catch (e) {
    console.error(e)
    mostrarToast('Error al cargar datos', 'error')
  } finally {
    cargando.value = false
  }
}

async function cargarEvaluaciones() {
  const resEvals = await apolloClient.query({
    query: OBTENER_EVALUACIONES_ESTUDIANTE,
    fetchPolicy: 'network-only'
  })
  const evals = resEvals.data.evaluacionesEstudiantes || []

  // Inicializar evaluationsLocal con última versión de cada alumno/criterio
  const local = {}
  evals.forEach(ev => {
    const ultima = ev.historial_versiones?.[ev.historial_versiones.length - 1]
    if (!ultima) return
    if (!local[ev.id_estudiante]) local[ev.id_estudiante] = {}
    if (!local[ev.id_estudiante][ev.id_actividad]) local[ev.id_estudiante][ev.id_actividad] = {}
    ultima.evaluaciones_criterio?.forEach(c => {
      local[ev.id_estudiante][ev.id_actividad][c.id_criterio] = c.nivel_logro
    })
  })
  evaluationsLocal.value = local
  evaluaciones.value = evals
}

function cambiarCurso(curso) {
  cursoSeleccionado.value = curso
}

function setScore(studentId, criteriaId, score) {
  const actId = actividadSeleccionadaId.value
  if (!actId) return
  if (!evaluationsLocal.value[studentId]) evaluationsLocal.value[studentId] = {}
  if (!evaluationsLocal.value[studentId][actId]) evaluationsLocal.value[studentId][actId] = {}
  evaluationsLocal.value[studentId][actId][criteriaId] = score
}

function getScoreClass(studentId, criteriaId, targetScore) {
  const actId = actividadSeleccionadaId.value
  if (!actId) return ''
  const score = evaluationsLocal.value[studentId]?.[actId]?.[criteriaId]
  if (score === targetScore) {
    if (score === 'LOGRADO') return 'logrado-active'
    if (score === 'EN PROCESO') return 'proceso-active'
    if (score === 'INICIADO') return 'iniciado-active'
  }
  return ''
}

function abrirNota(student) {
  modalNota.value = { show: true, studentId: student.id_estudiante, studentName: student.nombre }
  const ev = evaluaciones.value.find(e => e.id_estudiante === student.id_estudiante)
  const ultima = ev?.historial_versiones?.[ev.historial_versiones.length - 1]
  notaEscrita.value = ultima?.evaluaciones_criterio?.[0]?.observaciones || ''
}

async function guardarCambios() {
  const actId = actividadSeleccionadaId.value
  if (!usuario.value || !actId) return
  guardando.value = true
  let guardados = 0
  let errores = 0
  try {
    for (const student of students.value) {
      const evLocal = evaluationsLocal.value[student.id_estudiante]?.[actId]
      if (!evLocal || Object.keys(evLocal).length === 0) continue

      const criteriosInput = Object.entries(evLocal).map(([id_criterio, nivel_logro]) => ({
        id_criterio,
        nivel_logro,
        observaciones: ''
      }))

      const evExistente = evaluaciones.value.find(e => e.id_estudiante === student.id_estudiante && e.id_actividad === actId)

      if (evExistente) {
        await apolloClient.mutate({
          mutation: REGISTRAR_NUEVA_VERSION_EVALUACION,
          variables: {
            id_evaluacion: evExistente._id,
            docente_evaluador: usuario.value._id,
            evaluaciones_criterio: criteriosInput
          }
        })
      } else {
        await apolloClient.mutate({
          mutation: REGISTRAR_EVALUACION,
          variables: {
            estudianteId: student.id_estudiante,
            actividadId: actId,
            docenteId: usuario.value._id,
            criteriosInput,
            fichaInput: {}
          }
        })
      }
      guardados++
    }

    mostrarToast(`Cambios guardados (${guardados} alumnos actualizados)`, 'success')
    await cargarEvaluaciones()
  } catch (e) {
    console.error(e)
    mostrarToast('Error al guardar cambios', 'error')
  } finally {
    guardando.value = false
  }
}

function mostrarToast(message, type) {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3500)
}

onMounted(cargarDatos)
</script>

<template>
  <div class="view-container">
    <header class="page-header">
      <div>
        <h1 class="title">Matriz de Evaluaciones</h1>
        <p class="subtitle">Registro de logros por estudiante y criterio (RF-D03).</p>
      </div>
      <div class="header-actions">
        <button class="btn-primary" @click="guardarCambios" :disabled="guardando || cargando">
          {{ guardando ? 'Guardando...' : 'Guardar Cambios' }}
        </button>
      </div>
    </header>

    <!-- Controles de filtrado -->
    <div class="filters-card">
      <div v-if="cursos.length > 1" class="filter-group">
        <label>Curso:</label>
        <div class="curso-btns">
          <button
            v-for="c in cursos"
            :key="c._id"
            class="curso-btn"
            :class="{ active: cursoSeleccionado?._id === c._id }"
            @click="cambiarCurso(c)"
          >{{ c.nombre_curso }}</button>
        </div>
      </div>

      <div class="filter-group" v-if="actividadesDisponibles.length > 0">
        <label>Actividad a Evaluar:</label>
        <div class="select-wrapper">
          <select v-model="actividadSeleccionadaId" class="input-select premium-select">
            <option v-for="act in actividadesDisponibles" :key="act.id_actividad" :value="act.id_actividad">
              {{ act.descripcion }} ({{ act.unidad }})
            </option>
          </select>
          <div class="select-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Cargando -->
    <div v-if="cargando" class="loading-msg">Cargando datos...</div>

    <!-- Sin alumnos -->
    <div v-else-if="students.length === 0" class="empty-state">
      <p>No hay alumnos en este grupo o no tienes cursos asignados.</p>
    </div>
    
    <!-- Sin actividades -->
    <div v-else-if="actividadesDisponibles.length === 0" class="empty-state">
      <p>No hay actividades creadas en tus unidades. Ve a Planificación para crear actividades y criterios.</p>
    </div>

    <!-- Sin criterios -->
    <div v-else-if="criteria.length === 0" class="empty-state">
      <p>No hay criterios de evaluación. Crea unidades didácticas con actividades y criterios en Planificación.</p>
    </div>

    <template v-else>
      <div class="legend-container">
        <span class="legend-item"><span class="legend-dot iniciado-dot"></span> I = Iniciado</span>
        <span class="legend-item"><span class="legend-dot proceso-dot"></span> EP = En Proceso</span>
        <span class="legend-item"><span class="legend-dot logrado-dot"></span> L = Logrado</span>
      </div>

      <div class="table-container">
        <table class="evaluation-matrix">
          <thead>
            <tr>
              <th class="sticky-col">Estudiante</th>
              <th v-for="crit in criteria" :key="crit.id">{{ crit.label }}</th>
              <th>Nota</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="student in students" :key="student.id_estudiante">
              <td class="sticky-col font-medium">{{ student.nombre }}</td>
              <td v-for="crit in criteria" :key="crit.id">
                <div class="score-buttons">
                  <button class="score-btn" :class="getScoreClass(student.id_estudiante, crit.id, 'INICIADO')" @click="setScore(student.id_estudiante, crit.id, 'INICIADO')" title="Iniciado">I</button>
                  <button class="score-btn" :class="getScoreClass(student.id_estudiante, crit.id, 'EN PROCESO')" @click="setScore(student.id_estudiante, crit.id, 'EN PROCESO')" title="En Proceso">EP</button>
                  <button class="score-btn" :class="getScoreClass(student.id_estudiante, crit.id, 'LOGRADO')" @click="setScore(student.id_estudiante, crit.id, 'LOGRADO')" title="Logrado">L</button>
                </div>
              </td>
              <td>
                <button class="btn-icon" title="Nota escrita" @click="abrirNota(student)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- Modal nota -->
    <div v-if="modalNota.show" class="modal-overlay" @click.self="modalNota.show = false">
      <div class="modal-box">
        <h3>Nota para {{ modalNota.studentName }}</h3>
        <textarea v-model="notaEscrita" rows="4" class="input-base" placeholder="Observaciones generales del alumno..."></textarea>
        <div class="modal-actions">
          <button class="btn-secondary" @click="modalNota.show = false">Cerrar</button>
        </div>
      </div>
    </div>

    <Transition name="toast">
      <div v-if="toast.show" class="toast" :class="'toast-' + toast.type">{{ toast.message }}</div>
    </Transition>
  </div>
</template>

<style scoped>
.view-container { display: flex; flex-direction: column; gap: 24px; max-width: 100%; min-width: 0; }
.page-header { display: flex; justify-content: space-between; align-items: center; }
.title { font-size: 2rem; font-weight: 700; color: var(--text-primary); margin: 0 0 8px 0; }
.subtitle { color: var(--text-secondary); margin: 0; }
.header-actions { display: flex; gap: 12px; }
.loading-msg, .empty-state { text-align: center; padding: 40px; color: var(--text-muted); background: var(--bg-surface); border-radius: 12px; border: 1px dashed var(--border-color); }
.filters-card { display: flex; flex-direction: column; gap: 20px; padding: 24px; background: linear-gradient(145deg, var(--bg-surface), var(--bg-glass)); border-radius: 16px; border: 1px solid var(--border-color); box-shadow: 0 4px 24px rgba(0,0,0,0.04); }
.filter-group { display: flex; flex-direction: column; gap: 10px; }
.filter-group label { font-weight: 600; color: var(--text-secondary); font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px; }
.curso-btns { display: flex; gap: 10px; flex-wrap: wrap; }
.curso-btn { padding: 8px 18px; border-radius: 10px; border: 1px solid var(--border-color); background: var(--bg-glass); color: var(--text-secondary); cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); font-weight: 500; font-size: 0.95rem; }
.curso-btn:hover { background: var(--bg-glass-hover); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
.curso-btn.active { background: linear-gradient(135deg, var(--primary-600), var(--primary-500)); color: white; border-color: transparent; box-shadow: 0 4px 15px rgba(139,92,246,0.25); }
.select-wrapper { position: relative; width: 100%; max-width: 400px; }
.premium-select { width: 100%; appearance: none; padding: 12px 40px 12px 16px; border-radius: 10px; border: 1px solid var(--border-color); background: var(--bg-glass); color: var(--text-primary); font-size: 1rem; font-weight: 500; transition: all 0.2s; cursor: pointer; }
.premium-select:focus { outline: none; border-color: var(--primary-500); box-shadow: 0 0 0 3px rgba(139,92,246,0.15); background: var(--bg-surface); }
.select-icon { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--text-secondary); }
.btn-primary, .btn-secondary { padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; border: none; font-size: 0.95rem; }
.btn-primary { background-color: var(--primary-600); color: white; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-secondary { background: var(--bg-glass); color: var(--text-primary); border: 1px solid var(--border-color); }
.legend-container { display: flex; gap: 20px; background: var(--bg-surface); padding: 12px 20px; border-radius: 8px; width: fit-content; border: 1px solid var(--border-color); }
.legend-item { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; color: var(--text-secondary); font-weight: 500; }
.legend-dot { width: 12px; height: 12px; border-radius: 50%; }
.iniciado-dot { background-color: #ef4444; }
.proceso-dot { background-color: #f59e0b; }
.logrado-dot { background-color: #22c55e; }
.table-container { background: var(--bg-surface); border-radius: 12px; overflow-x: auto; border: 1px solid var(--border-color); max-width: 100%; }
.evaluation-matrix { width: 100%; border-collapse: collapse; text-align: left; }
.evaluation-matrix th, .evaluation-matrix td { padding: 14px 16px; border-bottom: 1px solid var(--border-color); border-right: 1px solid var(--border-color); white-space: nowrap; }
.evaluation-matrix th { background-color: var(--bg-glass); color: var(--text-secondary); font-weight: 600; font-size: 0.85rem; }
.sticky-col { position: sticky; left: 0; background-color: var(--bg-glass); z-index: 2; }
.font-medium { font-weight: 500; color: var(--text-primary); }
.score-buttons { display: flex; gap: 6px; justify-content: center; }
.score-btn { width: 34px; height: 34px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-glass); color: var(--text-secondary); font-weight: 600; cursor: pointer; transition: all 0.2s; font-size: 0.78rem; }
.score-btn:hover { background: var(--bg-glass-hover); }
.iniciado-active { background: rgba(239,68,68,0.1) !important; color: #ef4444 !important; border-color: #fca5a5 !important; }
.proceso-active { background: rgba(245,158,11,0.1) !important; color: #f59e0b !important; border-color: #fcd34d !important; }
.logrado-active { background: rgba(34,197,94,0.1) !important; color: #22c55e !important; border-color: #86efac !important; }
.btn-icon { background: none; border: none; cursor: pointer; padding: 6px; border-radius: 6px; transition: all 0.2s; font-size: 1rem; }
.btn-icon:hover { background: var(--bg-glass-hover); }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 100; display: flex; align-items: center; justify-content: center; }
.modal-box { background: var(--bg-surface); border-radius: 12px; padding: 24px; width: 440px; max-width: 90vw; border: 1px solid var(--border-color); }
.modal-box h3 { margin: 0 0 16px; color: var(--text-primary); }
.input-base { width: 100%; padding: 12px 16px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 1rem; font-family: inherit; background: var(--bg-glass); color: var(--text-primary); resize: vertical; box-sizing: border-box; }
.modal-actions { display: flex; justify-content: flex-end; margin-top: 16px; }
.toast { position: fixed; bottom: 24px; right: 24px; padding: 14px 20px; border-radius: 10px; color: white; font-weight: 600; z-index: 9999; }
.toast-success { background: #22c55e; }
.toast-error { background: #ef4444; }
.toast-enter-active, .toast-leave-active { transition: all 0.3s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(10px); }
@media (max-width: 768px) {
  .page-header { flex-direction: column; align-items: flex-start; gap: 15px; }
  .score-btn { width: 28px; height: 28px; font-size: 0.7rem; }
}
</style>
