<script setup>
import { ref, onMounted } from 'vue'
import apolloClient from '../graphql/client.js'
import {
  OBTENER_UNIDADES_DIDACTICAS,
  CREAR_UNIDAD_DIDACTICA_CRUD,
  ACTUALIZAR_UNIDAD_DIDACTICA,
  CLONAR_UNIDAD_DIDACTICA,
  ARCHIVAR_UNIDAD_DIDACTICA,
  AGREGAR_ACTIVIDAD_A_UNIDAD
} from '../graphql/queries.js'

const currentStep = ref(1)
const steps = ['Información General', 'Objetivos y Destrezas', 'Descripción', 'Revisión']
const activeTab = ref('guardadas')

const savedUnits = ref([])
const cargando = ref(false)
const guardando = ref(false)
const toast = ref({ show: false, message: '', type: 'success' })

// Modo edición
const modoEdicion = ref(false)
const editandoId = ref(null)

// Modal agregar actividad
const modalActividad = ref(false)
const unidadParaActividad = ref(null)
const guardandoActividad = ref(false)
const formActividad = ref({
  descripcion_actividad: '',
  tipo_actividad: 'CLASE',
  criterios_evaluacion: []
})
const opcionesCriterios = [
  { id: 'crit-001', label: 'Clasificación' },
  { id: 'crit-002', label: 'Seriación' },
  { id: 'crit-003', label: 'Asimilación y Acomodación' },
  { id: 'crit-004', label: 'Justificación (Lógica)' },
  { id: 'crit-005', label: 'Autorregulación' }
]

const form = ref({
  ambito: '',
  semanas_previstas: 1,
  objetivo_general: '',
  objetivos_aprendizaje: [],
  destrezas: [],
  descripcion: '',
  tecnica_didactica: '',
  actividades: []
})
const destrezasInput = ref('')
const objetivosInput = ref('')

const nextStep = () => { if (currentStep.value < 4) currentStep.value++ }
const prevStep = () => { if (currentStep.value > 1) currentStep.value-- }

async function cargarUnidades() {
  cargando.value = true
  try {
    const { data } = await apolloClient.query({
      query: OBTENER_UNIDADES_DIDACTICAS,
      fetchPolicy: 'network-only'
    })
    savedUnits.value = data.unidadesDidacticas || []
  } catch (e) {
    console.error(e)
    mostrarToast('Error al cargar las unidades', 'error')
  } finally {
    cargando.value = false
  }
}

function iniciarNueva() {
  modoEdicion.value = false
  editandoId.value = null
  currentStep.value = 1
  form.value = { ambito: '', semanas_previstas: 1, objetivo_general: '', objetivos_aprendizaje: [], destrezas: [], descripcion: '', tecnica_didactica: '', actividades: [] }
  destrezasInput.value = ''
  objetivosInput.value = ''
  activeTab.value = 'nueva'
}

function iniciarEdicion(unit) {
  modoEdicion.value = true
  editandoId.value = unit._id
  form.value = {
    ambito: unit.ambito || '',
    semanas_previstas: unit.semanas_previstas || 1,
    objetivo_general: unit.objetivo_general || '',
    objetivos_aprendizaje: unit.objetivos_aprendizaje || [],
    destrezas: unit.destrezas || [],
    descripcion: unit.descripcion || '',
    tecnica_didactica: unit.tecnica_didactica || '',
    actividades: unit.actividades || []
  }
  destrezasInput.value = (unit.destrezas || []).join(', ')
  objetivosInput.value = (unit.objetivos_aprendizaje || []).join('\n')
  currentStep.value = 1
  activeTab.value = 'nueva'
}

const save = async () => {
  guardando.value = true
  try {
    const destrezasArray = destrezasInput.value.split(',').map(d => d.trim()).filter(d => d.length > 0)
    const objetivosArray = objetivosInput.value.split('\n').map(o => o.trim()).filter(o => o.length > 0)

    const input = {
      ambito: form.value.ambito,
      semanas_previstas: Number(form.value.semanas_previstas),
      objetivo_general: form.value.objetivo_general,
      objetivos_aprendizaje: objetivosArray,
      destrezas: destrezasArray,
      descripcion: form.value.descripcion || '',
      tecnica_didactica: form.value.tecnica_didactica,
      activo: true,
      actividades: []
    }

    if (modoEdicion.value) {
      await apolloClient.mutate({
        mutation: ACTUALIZAR_UNIDAD_DIDACTICA,
        variables: { id: editandoId.value, input }
      })
      mostrarToast('Unidad actualizada exitosamente', 'success')
    } else {
      await apolloClient.mutate({
        mutation: CREAR_UNIDAD_DIDACTICA_CRUD,
        variables: { input }
      })
      mostrarToast('Unidad Didáctica creada exitosamente', 'success')
    }

    activeTab.value = 'guardadas'
    await cargarUnidades()
  } catch (error) {
    console.error('Error al guardar unidad:', error)
    mostrarToast('Error al guardar la unidad didáctica', 'error')
  } finally {
    guardando.value = false
  }
}

async function clonarUnidad(id) {
  try {
    await apolloClient.mutate({ mutation: CLONAR_UNIDAD_DIDACTICA, variables: { id } })
    mostrarToast('Unidad clonada exitosamente', 'success')
    await cargarUnidades()
  } catch (e) {
    mostrarToast('Error al clonar', 'error')
  }
}

async function archivarUnidad(id) {
  try {
    await apolloClient.mutate({ mutation: ARCHIVAR_UNIDAD_DIDACTICA, variables: { id } })
    mostrarToast('Unidad archivada', 'success')
    await cargarUnidades()
  } catch (e) {
    mostrarToast('Error al archivar', 'error')
  }
}

function abrirModalActividad(unit) {
  unidadParaActividad.value = unit
  formActividad.value = {
    descripcion_actividad: '',
    tipo_actividad: 'CLASE',
    criterios_evaluacion: []
  }
  modalActividad.value = true
}

async function guardarActividad() {
  if (!formActividad.value.descripcion_actividad.trim()) {
    mostrarToast('Debes escribir una descripción para la actividad', 'error')
    return
  }
  if (formActividad.value.criterios_evaluacion.length === 0) {
    mostrarToast('Debes seleccionar al menos un criterio', 'error')
    return
  }
  guardandoActividad.value = true
  try {
    const input = {
      id_actividad: `act-${Date.now()}`,
      tipo_actividad: formActividad.value.tipo_actividad,
      descripcion_actividad: formActividad.value.descripcion_actividad.trim(),
      fecha_actividad: new Date().toISOString(),
      activo: true,
      archivos_adjuntos: [],
      criterios_evaluacion: formActividad.value.criterios_evaluacion.map(c => ({
        id_criterio: c,
        tipo: 'RUBRICA'
      }))
    }
    await apolloClient.mutate({
      mutation: AGREGAR_ACTIVIDAD_A_UNIDAD,
      variables: { unidadId: unidadParaActividad.value._id, input }
    })
    mostrarToast('Actividad agregada exitosamente', 'success')
    modalActividad.value = false
    await cargarUnidades()
  } catch (error) {
    console.error(error)
    mostrarToast(`Error: ${error.message}`, 'error')
  } finally {
    guardandoActividad.value = false
  }
}

function mostrarToast(message, type) {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}

onMounted(cargarUnidades)
</script>

<template>
  <div class="view-container">
    <header class="page-header">
      <div>
        <h1 class="title">Planificación de Actividades</h1>
        <p class="subtitle">Crea y gestiona tus unidades didácticas (RF-D02).</p>
      </div>
      <button class="btn-primary" @click="iniciarNueva">+ Nueva Unidad</button>
    </header>

    <div class="wizard-container">
      <div class="tabs">
        <button class="tab" :class="{ active: activeTab === 'guardadas' }" @click="activeTab = 'guardadas'">
          Planificaciones guardadas
        </button>
        <button class="tab" :class="{ active: activeTab === 'nueva' }" @click="iniciarNueva">
          {{ modoEdicion ? 'Editando unidad' : 'Nueva planificación' }}
        </button>
      </div>

      <!-- LISTADO GUARDADO -->
      <div v-if="activeTab === 'guardadas'" class="saved-panel">
        <div v-if="cargando" class="loading-msg">Cargando unidades...</div>
        <div v-else-if="savedUnits.length === 0" class="saved-empty">
          No hay planificaciones guardadas todavía.
        </div>
        <div v-else class="saved-list">
          <div v-for="unit in savedUnits" :key="unit._id" class="saved-card" :class="{ archived: !unit.activo }">
            <div class="saved-header">
              <div>
                <h3>{{ unit.ambito }}</h3>
                <span class="saved-status" :class="unit.activo ? 'active' : 'inactive'">
                  {{ unit.activo ? 'Activa' : 'Archivada' }}
                </span>
              </div>
              <div class="card-actions">
                <button class="btn-icon" title="Agregar Actividad" @click="abrirModalActividad(unit)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
                <button class="btn-icon" title="Editar" @click="iniciarEdicion(unit)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                </button>
                <button class="btn-icon" title="Clonar" @click="clonarUnidad(unit._id)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                </button>
                <button class="btn-icon" title="Archivar" @click="archivarUnidad(unit._id)" v-if="unit.activo">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
                </button>
              </div>
            </div>
            <p><strong>Semanas:</strong> {{ unit.semanas_previstas }}</p>
            <p><strong>Técnica:</strong> {{ unit.tecnica_didactica || 'No especificada' }}</p>
            <p class="saved-goal"><strong>Objetivo:</strong> {{ unit.objetivo_general }}</p>
            <div v-if="unit.destrezas?.length" class="destrezas-tags">
              <span v-for="d in unit.destrezas" :key="d" class="destreza-tag">{{ d }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- FORMULARIO WIZARD -->
      <div v-else>
        <div class="stepper">
          <div
            v-for="(step, index) in steps"
            :key="index"
            class="step"
            :class="{ active: currentStep === index + 1, completed: currentStep > index + 1 }"
          >
            <div class="step-circle">{{ index + 1 }}</div>
            <span class="step-label">{{ step }}</span>
            <div class="step-line" v-if="index < steps.length - 1"></div>
          </div>
        </div>

        <div class="step-content">
          <transition name="slide" mode="out-in">
            <!-- Step 1 -->
            <div v-if="currentStep === 1" class="form-grid">
              <div class="form-group">
                <label>Ámbito *</label>
                <input type="text" v-model="form.ambito" placeholder="Ej. Lógico Matemático" class="input-base" />
              </div>
              <div class="form-group">
                <label>Semanas Previstas</label>
                <input type="number" v-model="form.semanas_previstas" min="1" class="input-base" />
              </div>
              <div class="form-group full-width">
                <label>Técnica Didáctica</label>
                <input type="text" v-model="form.tecnica_didactica" placeholder="Ej. Aprendizaje Basado en Proyectos" class="input-base" />
              </div>
            </div>

            <!-- Step 2 -->
            <div v-else-if="currentStep === 2" class="form-grid">
              <div class="form-group full-width">
                <label>Objetivo General *</label>
                <textarea v-model="form.objetivo_general" rows="3" class="input-base" placeholder="Describe el objetivo general de la unidad..."></textarea>
              </div>
              <div class="form-group full-width">
                <label>Objetivos de Aprendizaje (uno por línea)</label>
                <textarea v-model="objetivosInput" rows="3" class="input-base" placeholder="Objetivo 1&#10;Objetivo 2..."></textarea>
              </div>
              <div class="form-group full-width">
                <label>Destrezas (separadas por comas)</label>
                <input type="text" v-model="destrezasInput" placeholder="Ej. Clasificar, Ordenar, Sumar..." class="input-base" />
              </div>
            </div>

            <!-- Step 3 -->
            <div v-else-if="currentStep === 3" class="form-grid">
              <div class="form-group full-width">
                <label>Descripción de la Unidad</label>
                <textarea v-model="form.descripcion" rows="5" class="input-base" placeholder="Describe el contenido, contexto y metodología de la unidad..."></textarea>
              </div>
            </div>

            <!-- Step 4: Revisión -->
            <div v-else-if="currentStep === 4" class="review-section">
              <h3>Revisión Final</h3>
              <div class="review-card">
                <p><strong>Ámbito:</strong> {{ form.ambito || 'No especificado' }}</p>
                <p><strong>Semanas:</strong> {{ form.semanas_previstas }}</p>
                <p><strong>Técnica:</strong> {{ form.tecnica_didactica || 'No especificada' }}</p>
                <p><strong>Objetivo:</strong> {{ form.objetivo_general || 'No especificado' }}</p>
                <p v-if="destrezasInput"><strong>Destrezas:</strong> {{ destrezasInput }}</p>
                <p v-if="form.descripcion"><strong>Descripción:</strong> {{ form.descripcion.substring(0, 150) }}...</p>
              </div>
            </div>
          </transition>
        </div>

        <div class="wizard-actions">
          <button class="btn-secondary" @click="prevStep" :disabled="currentStep === 1 || guardando">Anterior</button>
          <button class="btn-primary" @click="nextStep" v-if="currentStep < 4">Siguiente</button>
          <button class="btn-success" @click="save" v-if="currentStep === 4" :disabled="guardando || !form.ambito">
            {{ guardando ? 'Guardando...' : (modoEdicion ? 'Actualizar Unidad' : 'Guardar Unidad') }}
          </button>
        </div>
      </div>
    </div>

    <Transition name="toast">
      <div v-if="toast.show" class="toast" :class="'toast-' + toast.type">
        {{ toast.message }}
      </div>
    </Transition>

    <!-- Modal Agregar Actividad -->
    <div v-if="modalActividad" class="modal-overlay" @click.self="modalActividad = false">
      <div class="modal-box">
        <h3>Agregar Actividad a "{{ unidadParaActividad?.ambito }}"</h3>
        
        <div class="form-group" style="margin-top: 16px;">
          <label>Descripción de la actividad *</label>
          <textarea v-model="formActividad.descripcion_actividad" class="input-base" rows="3" placeholder="Ej. Los alumnos participarán en una ronda de lectura..."></textarea>
        </div>

        <div class="form-group" style="margin-top: 16px;">
          <label>Tipo de Actividad</label>
          <select v-model="formActividad.tipo_actividad" class="input-base">
            <option value="CLASE">Trabajo en Clase</option>
            <option value="CASA">Trabajo en Casa</option>
            <option value="EXAMEN">Examen / Evaluación</option>
          </select>
        </div>

        <div class="form-group" style="margin-top: 16px;">
          <label>Criterios de Evaluación a observar</label>
          <div class="checkbox-group">
            <label v-for="crit in opcionesCriterios" :key="crit.id" class="check-label">
              <input type="checkbox" :value="crit.id" v-model="formActividad.criterios_evaluacion" />
              {{ crit.label }}
            </label>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn-secondary" @click="modalActividad = false">Cancelar</button>
          <button class="btn-primary" @click="guardarActividad" :disabled="guardandoActividad">
            {{ guardandoActividad ? 'Guardando...' : 'Guardar Actividad' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.view-container { display: flex; flex-direction: column; gap: 30px; max-width: 100%; min-width: 0; }
.page-header { display: flex; justify-content: space-between; align-items: center; }
.title { font-size: 2rem; font-weight: 700; color: var(--text-primary); margin: 0 0 8px 0; }
.subtitle { color: var(--text-secondary); margin: 0; }
.wizard-container { background: var(--bg-surface); border-radius: 12px; padding: 40px; box-sizing: border-box; overflow-x: hidden; border: 1px solid var(--border-color); }
.tabs { display: flex; gap: 12px; margin-bottom: 28px; }
.tab { padding: 10px 16px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-glass); color: var(--text-secondary); font-weight: 600; cursor: pointer; transition: all 0.2s; }
.tab.active { background: var(--bg-glass-hover); color: var(--text-primary); border-color: var(--border-color-hover); }
.loading-msg { text-align: center; padding: 40px; color: var(--text-muted); }
.saved-panel { display: flex; flex-direction: column; gap: 16px; }
.saved-list { display: grid; gap: 16px; }
.saved-card { background: var(--bg-glass); border: 1px solid var(--border-color); border-radius: 10px; padding: 16px; color: var(--text-secondary); }
.saved-card.archived { opacity: 0.6; }
.saved-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 8px; }
.saved-header h3 { margin: 0; color: var(--text-primary); font-size: 1.05rem; }
.saved-status { font-size: 0.75rem; padding: 2px 8px; border-radius: 999px; font-weight: 600; }
.saved-status.active { background: rgba(34,197,94,0.1); color: #16a34a; }
.saved-status.inactive { background: rgba(239,68,68,0.1); color: #ef4444; }
.card-actions { display: flex; gap: 6px; }
.btn-icon { background: none; border: 1px solid var(--border-color); border-radius: 6px; padding: 4px 8px; cursor: pointer; font-size: 0.9rem; transition: all 0.2s; }
.btn-icon:hover { background: var(--bg-glass-hover); }
.saved-goal { color: var(--text-secondary); }
.saved-empty { padding: 18px; border-radius: 8px; border: 1px dashed var(--border-color); color: var(--text-muted); }
.destrezas-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
.destreza-tag { padding: 3px 10px; border-radius: 999px; background: rgba(139,92,246,0.08); color: var(--primary-600); font-size: 0.8rem; border: 1px solid rgba(139,92,246,0.15); }
.stepper { display: flex; justify-content: space-between; margin-bottom: 50px; position: relative; }
.step { display: flex; flex-direction: column; align-items: center; gap: 12px; z-index: 2; position: relative; flex: 1; }
.step-line { position: absolute; top: 20px; left: calc(50% + 20px); width: calc(100% - 40px); height: 3px; background-color: var(--border-color); z-index: -1; }
.step.completed .step-line { background-color: var(--primary-500); }
.step-circle { width: 40px; height: 40px; border-radius: 50%; background-color: var(--bg-glass); color: var(--text-secondary); display: flex; align-items: center; justify-content: center; font-weight: 600; transition: all 0.3s ease; }
.step.active .step-circle { background-color: var(--primary-600); color: white; box-shadow: 0 0 0 4px rgba(139,92,246,0.15); }
.step.completed .step-circle { background-color: var(--primary-600); color: white; }
.step-label { font-size: 0.9rem; font-weight: 500; color: var(--text-secondary); }
.step.active .step-label { color: var(--text-primary); font-weight: 600; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.form-group { display: flex; flex-direction: column; gap: 8px; }
.full-width { grid-column: 1 / -1; }
.form-group label { font-weight: 500; color: var(--text-secondary); font-size: 0.95rem; }
.input-base { padding: 12px 16px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 1rem; transition: border-color 0.2s; font-family: inherit; background: var(--bg-glass); color: var(--text-primary); resize: vertical; }
.input-base:focus { outline: none; border-color: var(--primary-500); box-shadow: 0 0 0 3px rgba(139,92,246,0.1); }
.review-section h3 { margin: 0 0 16px; color: var(--text-primary); }
.review-card { background-color: var(--bg-glass); padding: 24px; border-radius: 8px; border: 1px solid var(--border-color); }
.review-card p { margin: 10px 0; color: var(--text-secondary); }
.wizard-actions { display: flex; justify-content: flex-end; gap: 16px; margin-top: 40px; padding-top: 24px; border-top: 1px solid var(--border-color); }
.btn-primary, .btn-secondary, .btn-success { padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; border: none; font-size: 0.95rem; display: inline-flex; align-items: center; justify-content: center; gap: 8px; }
.btn-primary { background: linear-gradient(135deg, var(--primary-600), var(--primary-500)); color: white; box-shadow: 0 4px 15px rgba(139,92,246,0.2); }
.btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(139,92,246,0.3); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-secondary { background-color: var(--bg-glass); color: var(--text-primary); border: 1px solid var(--border-color); }
.btn-secondary:hover:not(:disabled) { background: var(--bg-glass-hover); transform: translateY(-1px); }
.btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-success { background: linear-gradient(135deg, #16a34a, #22c55e); color: white; box-shadow: 0 4px 15px rgba(34,197,94,0.2); }
.btn-success:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(34,197,94,0.3); }
.btn-success:disabled { opacity: 0.6; cursor: not-allowed; }
.toast { position: fixed; bottom: 24px; right: 24px; padding: 14px 20px; border-radius: 10px; color: white; font-weight: 600; z-index: 9999; }
.toast-success { background: #22c55e; }
.toast-error { background: #ef4444; }
.toast-enter-active, .toast-leave-active { transition: all 0.3s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(10px); }
.slide-enter-active, .slide-leave-active { transition: all 0.3s ease-out; }
.slide-enter-from { opacity: 0; transform: translateX(20px); }
.slide-leave-to { opacity: 0; transform: translateX(-20px); }

/* Modal Actividad */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 100; display: flex; align-items: center; justify-content: center; }
.modal-box { background: var(--bg-surface); border-radius: 12px; padding: 24px; width: 500px; max-width: 90vw; border: 1px solid var(--border-color); box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
.modal-box h3 { margin: 0 0 8px; color: var(--text-primary); font-size: 1.2rem; }
.checkbox-group { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }
.check-label { display: flex; align-items: center; gap: 8px; color: var(--text-secondary); cursor: pointer; font-size: 0.95rem; }
.modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }

@media (max-width: 768px) {
  .page-header { flex-direction: column; align-items: flex-start; gap: 15px; }
  .wizard-container { padding: 20px; }
  .form-grid { grid-template-columns: 1fr; }
  .step-label { display: none; }
  .wizard-actions { flex-direction: column; gap: 10px; }
  .wizard-actions button { width: 100%; }
}
</style>
