<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth.js'
import apolloClient from '../graphql/client.js'
import {
  CURSOS_POR_DOCENTE,
  OBTENER_UNIDADES_DIDACTICAS,
  OBTENER_EVALUACIONES_ESTUDIANTE,
  REGISTRAR_NUEVA_VERSION_EVALUACION
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

// Computed: estudiantes del curso seleccionado
const students = computed(() => {
  if (!cursoSeleccionado.value) return []
  return cursoSeleccionado.value.estudiantes || []
})

// Computed: criterios desde unidades didácticas activas
const criteria = computed(() => {
  const set = new Map()
  unidades.value.forEach(u => {
    ;(u.actividades || []).forEach(act => {
      ;(act.criterios_evaluacion || []).forEach(c => {
        if (!set.has(c.id_criterio)) {
          set.set(c.id_criterio, { id: c.id_criterio, label: c.id_criterio })
        }
      })
    })
  })
  return Array.from(set.values())
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
    ultima.evaluaciones_criterio?.forEach(c => {
      local[ev.id_estudiante][c.id_criterio] = c.nivel_logro
    })
  })
  evaluationsLocal.value = local
  evaluaciones.value = evals
}

function cambiarCurso(curso) {
  cursoSeleccionado.value = curso
}

function setScore(studentId, criteriaId, score) {
  if (!evaluationsLocal.value[studentId]) evaluationsLocal.value[studentId] = {}
  evaluationsLocal.value[studentId][criteriaId] = score
}

function getScoreClass(studentId, criteriaId, targetScore) {
  const score = evaluationsLocal.value[studentId]?.[criteriaId]
  if (score === targetScore) {
    if (score === 'LOGRADO') return 'logrado-active'
    if (score === 'EN PROCESO') return 'proceso-active'
    if (score === 'INICIADO') return 'iniciado-active'
  }
  return ''
}

function getScoreLabel(studentId, criteriaId) {
  const score = evaluationsLocal.value[studentId]?.[criteriaId]
  if (score === 'LOGRADO') return 'L'
  if (score === 'EN PROCESO') return 'EP'
  if (score === 'INICIADO') return 'I'
  return '-'
}

function abrirNota(student) {
  modalNota.value = { show: true, studentId: student.id_estudiante, studentName: student.nombre }
  const ev = evaluaciones.value.find(e => e.id_estudiante === student.id_estudiante)
  const ultima = ev?.historial_versiones?.[ev.historial_versiones.length - 1]
  notaEscrita.value = ultima?.evaluaciones_criterio?.[0]?.observaciones || ''
}

async function guardarCambios() {
  if (!usuario.value) return
  guardando.value = true
  let guardados = 0
  let errores = 0
  try {
    for (const student of students.value) {
      const evLocal = evaluationsLocal.value[student.id_estudiante]
      if (!evLocal || Object.keys(evLocal).length === 0) continue

      const criteriosInput = Object.entries(evLocal).map(([id_criterio, nivel_logro]) => ({
        id_criterio,
        nivel_logro,
        observaciones: ''
      }))

      // Buscar evaluación existente para este alumno
      const evExistente = evaluaciones.value.find(e => e.id_estudiante === student.id_estudiante)

      if (evExistente) {
        await apolloClient.mutate({
          mutation: REGISTRAR_NUEVA_VERSION_EVALUACION,
          variables: {
            id_evaluacion: evExistente._id,
            docente_evaluador: usuario.value._id,
            evaluaciones_criterio: criteriosInput
          }
        })
        guardados++
      }
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

    <!-- Selector de curso -->
    <div v-if="cursos.length > 1" class="curso-selector">
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

    <!-- Cargando -->
    <div v-if="cargando" class="loading-msg">Cargando datos...</div>

    <!-- Sin alumnos -->
    <div v-else-if="students.length === 0" class="empty-state">
      <p>No hay alumnos en este grupo o no tienes cursos asignados.</p>
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
                <button class="btn-icon" title="Nota escrita" @click="abrirNota(student)">✏️</button>
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
.loading-msg, .empty-state { text-align: center; padding: 40px; color: var(--text-muted); }
.curso-selector { display: flex; align-items: center; gap: 12px; }
.curso-selector label { font-weight: 600; color: var(--text-secondary); }
.curso-btns { display: flex; gap: 8px; flex-wrap: wrap; }
.curso-btn { padding: 6px 14px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-glass); color: var(--text-secondary); cursor: pointer; transition: all 0.2s; font-size: 0.9rem; }
.curso-btn.active { background: rgba(76,110,245,0.12); color: var(--primary-400); border-color: var(--primary-400); }
.btn-primary, .btn-secondary { padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; border: none; font-size: 0.95rem; }
.btn-primary { background-color: #4CAF50; color: white; }
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
