<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth.js'
import apolloClient from '../graphql/client.js'
import {
  OBTENER_UNIDADES_DIDACTICAS,
  REGISTRAR_AUTOEVALUACION_DOCENTE
} from '../graphql/queries.js'

const { usuario } = useAuth()

// Las 6 preguntas predefinidas (RF-D07: 6 preguntas)
const PREGUNTAS_DEFAULT = [
  '¿Planifiqué mis actividades de forma clara y estructurada?',
  '¿Utilicé material didáctico adecuado para el desarrollo cognitivo?',
  '¿Fomenté la participación activa y atención de los alumnos?',
  '¿Evalué el progreso de los estudiantes según la rúbrica establecida?',
  '¿Atendí las necesidades individuales y apliqué acciones de apoyo?',
  '¿Logré los objetivos planteados para la unidad didáctica?'
]

const unidades = ref([])
const actividadSeleccionada = ref('')
const actividadesDisponibles = ref([])
const responses = ref(PREGUNTAS_DEFAULT.map(q => ({ pregunta: q, respuesta: '', reflexion: '' })))
const guardando = ref(false)
const guardado = ref(false)
const toast = ref({ show: false, message: '', type: 'success' })

async function cargarUnidades() {
  try {
    const { data } = await apolloClient.query({
      query: OBTENER_UNIDADES_DIDACTICAS,
      fetchPolicy: 'network-only'
    })
    unidades.value = (data.unidadesDidacticas || []).filter(u => u.activo)

    // Recopilar actividades disponibles
    const acts = []
    unidades.value.forEach(u => {
      ;(u.actividades || []).forEach(act => {
        acts.push({
          id_actividad: act.id_actividad,
          descripcion: act.descripcion_actividad,
          unidadAmbito: u.ambito
        })
      })
    })
    actividadesDisponibles.value = acts
    if (acts.length > 0) actividadSeleccionada.value = acts[0].id_actividad
  } catch (e) {
    console.error(e)
  }
}

async function saveEvaluation() {
  const isComplete = responses.value.every(r => r.respuesta !== '')
  if (!isComplete) {
    mostrarToast('Por favor selecciona una respuesta para todas las preguntas.', 'error')
    return
  }
  if (!actividadSeleccionada.value) {
    mostrarToast('Selecciona una actividad para vincular la autoevaluación.', 'error')
    return
  }
  guardando.value = true
  try {
    await apolloClient.mutate({
      mutation: REGISTRAR_AUTOEVALUACION_DOCENTE,
      variables: {
        actividadId: actividadSeleccionada.value,
        docenteId: usuario.value._id,
        respuestasInput: responses.value.map(r => ({
          pregunta: r.pregunta,
          respuesta: r.respuesta,
          reflexion: r.reflexion || ''
        }))
      }
    })
    guardado.value = true
    mostrarToast('Autoevaluación guardada con marca de tiempo ✓', 'success')
    // Reset
    responses.value = PREGUNTAS_DEFAULT.map(q => ({ pregunta: q, respuesta: '', reflexion: '' }))
  } catch (e) {
    console.error(e)
    mostrarToast('Error al guardar la autoevaluación', 'error')
  } finally {
    guardando.value = false
  }
}

function mostrarToast(message, type) {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3500)
}

onMounted(cargarUnidades)
</script>

<template>
  <div class="view-container">
    <header class="page-header">
      <div>
        <h1 class="title">Autoevaluación Docente</h1>
        <p class="subtitle">Reflexiona sobre tu desempeño (RF-D07 — guardada con marca de tiempo).</p>
      </div>
      <button class="btn-primary" @click="saveEvaluation" :disabled="guardando">
        {{ guardando ? 'Guardando...' : 'Guardar Evaluación' }}
      </button>
    </header>

    <!-- Selector de actividad -->
    <div class="actividad-selector">
      <label class="selector-label">Asociar a actividad:</label>
      <select v-model="actividadSeleccionada" class="input-select">
        <option value="" disabled>Selecciona una actividad...</option>
        <option v-for="act in actividadesDisponibles" :key="act.id_actividad" :value="act.id_actividad">
          [{{ act.unidadAmbito }}] {{ act.descripcion?.substring(0, 60) }}...
        </option>
      </select>
      <span v-if="actividadesDisponibles.length === 0" class="warn-msg">
        ⚠️ No hay actividades. Crea unidades didácticas primero.
      </span>
    </div>

    <div class="evaluation-form">
      <div v-for="(item, index) in responses" :key="index" class="question-card">
        <div class="question-header">
          <div class="question-number">{{ index + 1 }}</div>
          <h3>{{ item.pregunta }}</h3>
        </div>
        <div class="question-body">
          <div class="radio-group">
            <label class="radio-label">
              <input type="radio" :name="`q-${index}`" value="Sí" v-model="item.respuesta" />
              <span class="custom-radio"></span>
              Sí
            </label>
            <label class="radio-label">
              <input type="radio" :name="`q-${index}`" value="En Proceso" v-model="item.respuesta" />
              <span class="custom-radio"></span>
              En Proceso
            </label>
            <label class="radio-label">
              <input type="radio" :name="`q-${index}`" value="No" v-model="item.respuesta" />
              <span class="custom-radio"></span>
              No
            </label>
          </div>
          <div class="reflection-field">
            <textarea v-model="item.reflexion" placeholder="Reflexión o comentario opcional..." rows="2" class="input-base"></textarea>
          </div>
        </div>
      </div>
    </div>

    <Transition name="toast">
      <div v-if="toast.show" class="toast" :class="'toast-' + toast.type">{{ toast.message }}</div>
    </Transition>
  </div>
</template>

<style scoped>
.view-container { display: flex; flex-direction: column; gap: 30px; max-width: 900px; margin: 0 auto; }
.page-header { display: flex; justify-content: space-between; align-items: center; }
.title { font-size: 2rem; font-weight: 700; color: var(--text-primary); margin: 0 0 8px 0; }
.subtitle { color: var(--text-secondary); margin: 0; }
.btn-primary { padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; background-color: #3b82f6; color: white; border: none; font-size: 0.95rem; transition: background-color 0.2s; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.actividad-selector { display: flex; align-items: center; gap: 12px; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 10px; padding: 16px 20px; flex-wrap: wrap; }
.selector-label { font-weight: 600; color: var(--text-secondary); white-space: nowrap; }
.input-select { flex: 1; min-width: 200px; padding: 10px 14px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-glass); color: var(--text-primary); font-family: inherit; font-size: 0.95rem; }
.warn-msg { font-size: 0.85rem; color: #f59e0b; }
.evaluation-form { display: flex; flex-direction: column; gap: 24px; }
.question-card { background: var(--bg-surface); border-radius: 12px; padding: 24px; border: 1px solid var(--border-color); }
.question-header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
.question-number { background-color: rgba(59,130,246,0.15); color: #93c5fd; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.1rem; flex-shrink: 0; }
.question-card h3 { margin: 0; color: var(--text-primary); font-size: 1.05rem; font-weight: 600; }
.question-body { padding-left: 48px; display: flex; flex-direction: column; gap: 16px; }
.radio-group { display: flex; gap: 24px; flex-wrap: wrap; }
.radio-label { display: flex; align-items: center; gap: 8px; cursor: pointer; color: var(--text-secondary); font-weight: 500; }
.radio-label input[type="radio"] { display: none; }
.custom-radio { width: 20px; height: 20px; border: 2px solid var(--border-color); border-radius: 50%; display: inline-block; position: relative; transition: all 0.2s; flex-shrink: 0; }
.radio-label input[type="radio"]:checked + .custom-radio { border-color: #3b82f6; }
.radio-label input[type="radio"]:checked + .custom-radio::after { content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 10px; height: 10px; background-color: #3b82f6; border-radius: 50%; }
.input-base { width: 100%; padding: 12px 16px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 0.95rem; font-family: inherit; resize: vertical; background-color: var(--bg-glass); color: var(--text-primary); box-sizing: border-box; }
.input-base:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
.toast { position: fixed; bottom: 24px; right: 24px; padding: 14px 20px; border-radius: 10px; color: white; font-weight: 600; z-index: 9999; }
.toast-success { background: #22c55e; }
.toast-error { background: #ef4444; }
.toast-enter-active, .toast-leave-active { transition: all 0.3s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(10px); }
@media (max-width: 600px) {
  .radio-group { flex-direction: column; gap: 12px; }
  .question-body { padding-left: 0; }
  .actividad-selector { flex-direction: column; align-items: flex-start; }
}
</style>
