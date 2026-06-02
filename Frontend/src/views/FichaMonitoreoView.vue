<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth.js'
import apolloClient from '../graphql/client.js'
import {
  CURSOS_POR_DOCENTE,
  OBTENER_EVALUACIONES_ESTUDIANTE,
  ACTUALIZAR_FICHA_MONITOREO_ESTUDIANTE
} from '../graphql/queries.js'
import { gql } from 'graphql-tag'

const { usuario } = useAuth()

const cursos = ref([])
const cursoSeleccionado = ref(null)
const students = ref([])
const selectedStudent = ref(null)
const evaluaciones = ref([])
const cargando = ref(false)
const guardando = ref(false)
const toast = ref({ show: false, message: '', type: 'success' })

// RNF-09: Campos configurables mediante estructura de datos (JSON)
const fichaConfig = ref([
  { id: 'clasificacion', label: 'Clasificación', type: 'select', options: ['INICIADO', 'EN PROCESO', 'LOGRADO'] },
  { id: 'seriacion', label: 'Seriación', type: 'select', options: ['INICIADO', 'EN PROCESO', 'LOGRADO'] },
  { id: 'asimilacion_acomodacion', label: 'Asimilación y Acomodación', type: 'select', options: ['INICIADO', 'EN PROCESO', 'LOGRADO'] },
  { id: 'justificacion', label: 'Justificación Lógica', type: 'textarea', placeholder: 'Razonamiento del alumno...' },
  { id: 'autoregulacion', label: 'Autorregulación', type: 'select', options: ['INICIADO', 'EN PROCESO', 'LOGRADO'] },
  { id: 'observaciones', label: 'Campo de Observaciones', type: 'textarea', placeholder: 'Observaciones generales...' },
  { id: 'acciones_apoyo', label: 'Acciones de Apoyo', type: 'textarea', placeholder: 'Estrategias de intervención...' }
])

const formData = ref({})

// Mutation para registrar evaluación con ficha (si no existe un documento)
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
      students.value = cursoSeleccionado.value.estudiantes || []
      if (students.value.length > 0) {
        await selectStudent(students.value[0])
      }
    }
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
  evaluaciones.value = resEvals.data.evaluacionesEstudiantes || []
}

async function selectStudent(student) {
  selectedStudent.value = student
  await cargarEvaluaciones()
  // Cargar ficha existente del alumno
  const ev = evaluaciones.value.find(e => e.id_estudiante === student.id_estudiante)
  if (ev?.ficha_monitoreo) {
    formData.value = { ...ev.ficha_monitoreo }
  } else {
    formData.value = {}
  }
}

async function cambiarCurso(cursoId) {
  const curso = cursos.value.find(c => c._id === cursoId)
  if (curso) {
    cursoSeleccionado.value = curso
    students.value = curso.estudiantes || []
    selectedStudent.value = null
    if (students.value.length > 0) {
      await selectStudent(students.value[0])
    }
  }
}

async function saveFicha() {
  if (!selectedStudent.value || !usuario.value) return
  guardando.value = true
  try {
    const fichaInput = {
      clasificacion: formData.value.clasificacion || 'INICIADO',
      seriacion: formData.value.seriacion || 'INICIADO',
      asimilacion_acomodacion: formData.value.asimilacion_acomodacion || 'INICIADO',
      justificacion: formData.value.justificacion || '',
      autoregulacion: formData.value.autoregulacion || 'INICIADO',
      observaciones: formData.value.observaciones || '',
      acciones_apoyo: formData.value.acciones_apoyo || ''
    }

    const ev = evaluaciones.value.find(e => e.id_estudiante === selectedStudent.value.id_estudiante)
    if (ev) {
      await apolloClient.mutate({
        mutation: ACTUALIZAR_FICHA_MONITOREO_ESTUDIANTE,
        variables: { id_evaluacion: ev._id, ficha: fichaInput }
      })
    } else {
      // Crear una evaluación base con la ficha (necesita una actividad)
      mostrarToast('El alumno no tiene evaluaciones previas. Registra primero una evaluación.', 'error')
      guardando.value = false
      return
    }

    mostrarToast(`Ficha de ${selectedStudent.value.nombre} guardada exitosamente`, 'success')
  } catch (e) {
    console.error(e)
    mostrarToast('Error al guardar la ficha', 'error')
  } finally {
    guardando.value = false
  }
}

function getLabel(val) {
  if (val === 'INICIADO') return 'Iniciado'
  if (val === 'EN PROCESO') return 'En Proceso'
  if (val === 'LOGRADO') return 'Logrado'
  return val || '-'
}

function mostrarToast(message, type) {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}

onMounted(cargarDatos)
</script>

<template>
  <div class="view-container">
    <header class="page-header">
      <div>
        <h1 class="title">Ficha de Monitoreo Individual</h1>
        <p class="subtitle">Registra el progreso cognitivo detallado por alumno (RF-D06).</p>
      </div>
      <button class="btn-primary" @click="saveFicha" :disabled="guardando || !selectedStudent">
        {{ guardando ? 'Guardando...' : 'Guardar Ficha' }}
      </button>
    </header>

    <div class="filters-card" v-if="cursos.length > 0">
      <div class="filter-group">
        <label>Curso Seleccionado:</label>
        <div class="select-wrapper">
          <select 
            :value="cursoSeleccionado?._id" 
            @change="e => cambiarCurso(e.target.value)" 
            class="input-select premium-select"
          >
            <option v-for="c in cursos" :key="c._id" :value="c._id">{{ c.nombre_curso }}</option>
          </select>
          <div class="select-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
          </div>
        </div>
      </div>
    </div>

    <div v-if="cargando" class="loading-msg">Cargando datos...</div>

    <div v-else-if="students.length === 0" class="empty-state">
      No hay alumnos disponibles. Asegúrate de tener un curso con alumnos asignados.
    </div>

    <div v-else class="layout-grid">
      <!-- Selector de alumnos -->
      <aside class="students-list">
        <h3>Alumnos ({{ students.length }})</h3>
        <ul>
          <li
            v-for="student in students"
            :key="student.id_estudiante"
            :class="{ active: selectedStudent?.id_estudiante === student.id_estudiante }"
            @click="selectStudent(student)"
          >
            <div class="avatar">{{ student.nombre.charAt(0) }}</div>
            <span>{{ student.nombre }}</span>
          </li>
        </ul>
      </aside>

      <!-- Formulario Dinámico -->
      <main class="ficha-form" v-if="selectedStudent">
        <div class="form-header">
          <h2>Monitoreo de {{ selectedStudent.nombre }}</h2>
          <span class="date-badge">Actualizado: {{ new Date().toLocaleDateString() }}</span>
        </div>

        <div class="dynamic-fields">
          <div v-for="field in fichaConfig" :key="field.id" class="form-group" :class="{ 'full-width': field.type === 'textarea' }">
            <label>{{ field.label }}</label>
            <textarea
              v-if="field.type === 'textarea'"
              v-model="formData[field.id]"
              :placeholder="field.placeholder"
              rows="3"
              class="input-base"
            ></textarea>
            <select v-else-if="field.type === 'select'" v-model="formData[field.id]" class="input-base">
              <option value="" disabled>Selecciona un nivel</option>
              <option v-for="option in field.options" :key="option" :value="option">{{ getLabel(option) }}</option>
            </select>
          </div>
        </div>
      </main>
    </div>

    <Transition name="toast">
      <div v-if="toast.show" class="toast" :class="'toast-' + toast.type">{{ toast.message }}</div>
    </Transition>
  </div>
</template>

<style scoped>
.view-container { display: flex; flex-direction: column; gap: 30px; height: 100%; max-width: 100%; min-width: 0; }
.page-header { display: flex; justify-content: space-between; align-items: center; }
.title { font-size: 2rem; font-weight: 700; color: var(--text-primary); margin: 0 0 8px 0; }
.subtitle { color: var(--text-secondary); margin: 0; }
.loading-msg, .empty-state { text-align: center; padding: 40px; color: var(--text-muted); background: var(--bg-surface); border-radius: 12px; border: 1px dashed var(--border-color); }
.btn-primary { padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; background: linear-gradient(135deg, var(--primary-600), var(--primary-500)); color: white; border: none; font-size: 0.95rem; transition: all 0.2s; box-shadow: 0 4px 15px rgba(139,92,246,0.2); }
.btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(139,92,246,0.3); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.layout-grid { display: grid; grid-template-columns: 280px 1fr; gap: 24px; align-items: start; max-width: 100%; }
.filters-card { display: flex; flex-direction: column; gap: 20px; padding: 24px; background: linear-gradient(145deg, var(--bg-surface), var(--bg-glass)); border-radius: 16px; border: 1px solid var(--border-color); box-shadow: 0 4px 24px rgba(0,0,0,0.04); margin-bottom: 24px; }
.filter-group { display: flex; flex-direction: column; gap: 10px; }
.filter-group label { font-weight: 600; color: var(--text-secondary); font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px; }
.select-wrapper { position: relative; width: 100%; max-width: 400px; }
.premium-select { width: 100%; appearance: none; padding: 12px 40px 12px 16px; border-radius: 10px; border: 1px solid var(--border-color); background: var(--bg-glass); color: var(--text-primary); font-size: 1rem; font-weight: 500; transition: all 0.2s; cursor: pointer; }
.premium-select:focus { outline: none; border-color: var(--primary-500); box-shadow: 0 0 0 3px rgba(139,92,246,0.15); background: var(--bg-surface); }
.select-icon { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--text-secondary); }
.students-list { background: var(--bg-surface); border-radius: 12px; padding: 20px; border: 1px solid var(--border-color); }
.students-list h3 { margin: 0 0 16px 0; color: var(--text-primary); font-size: 1.1rem; }
.students-list ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
.students-list li { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 8px; cursor: pointer; transition: all 0.2s; color: var(--text-secondary); font-weight: 500; }
.students-list li:hover { background-color: var(--bg-glass-hover); }
.students-list li.active { background-color: rgba(139,92,246,0.08); color: var(--text-primary); }
.avatar { width: 32px; height: 32px; border-radius: 50%; background-color: var(--bg-glass); color: var(--text-secondary); display: flex; align-items: center; justify-content: center; font-weight: bold; }
.students-list li.active .avatar { background-color: var(--primary-600); color: white; }
.ficha-form { background: var(--bg-surface); border-radius: 12px; padding: 30px; border: 1px solid var(--border-color); max-width: 100%; box-sizing: border-box; }
.form-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid var(--border-color); }
.form-header h2 { margin: 0; color: var(--text-primary); font-size: 1.4rem; }
.date-badge { background-color: var(--bg-glass); color: var(--text-secondary); padding: 6px 12px; border-radius: 20px; font-size: 0.85rem; }
.dynamic-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.form-group { display: flex; flex-direction: column; gap: 8px; }
.full-width { grid-column: 1 / -1; }
.form-group label { font-weight: 500; color: var(--text-secondary); font-size: 0.95rem; }
.input-base { padding: 12px 16px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 1rem; font-family: inherit; resize: vertical; background: var(--bg-glass); color: var(--text-primary); }
.input-base:focus { outline: none; border-color: var(--primary-500); box-shadow: 0 0 0 3px rgba(139,92,246,0.1); }
.toast { position: fixed; bottom: 24px; right: 24px; padding: 14px 20px; border-radius: 10px; color: white; font-weight: 600; z-index: 9999; }
.toast-success { background: #22c55e; }
.toast-error { background: #ef4444; }
.toast-enter-active, .toast-leave-active { transition: all 0.3s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(10px); }
@media (max-width: 768px) {
  .page-header { flex-direction: column; align-items: flex-start; gap: 15px; }
  .layout-grid { grid-template-columns: 1fr; }
  .dynamic-fields { grid-template-columns: 1fr; }
  .form-header { flex-direction: column; align-items: flex-start; gap: 10px; }
}
</style>
