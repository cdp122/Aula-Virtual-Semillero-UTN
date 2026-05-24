<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import apolloClient from '../../graphql/client.js'
import { 
  OBTENER_ACTIVIDADES_CASA,
  MARCAR_ACTIVIDAD_COMPLETADA,
  OBTENER_EVALUACIONES_ESTUDIANTE
} from '../../graphql/queries.js'

const props = defineProps({ id: String })
const router = useRouter()

const actividades = ref([])
const actividadesCompletadas = ref(new Set())
const cargando = ref(true)
const enviando = ref({})
const comentarios = ref({})
const mensajeExito = ref('')

async function cargarDatos() {
  cargando.value = true
  try {
    // Obtener las actividades de casa disponibles
    const resActividades = await apolloClient.query({
      query: OBTENER_ACTIVIDADES_CASA,
      variables: { estudianteId: props.id }
    })
    
    // Obtener las evaluaciones para ver cuáles ya están completadas
    const resEvaluaciones = await apolloClient.query({
      query: OBTENER_EVALUACIONES_ESTUDIANTE
    })

    const evalsHijo = (resEvaluaciones.data.evaluacionesEstudiantes || [])
      .filter(e => e.id_estudiante === props.id)

    const completadas = new Set()
    evalsHijo.forEach(ev => {
      if (ev.actividades_casa_completadas) {
        ev.actividades_casa_completadas.forEach(ac => {
          completadas.add(ac.id_actividad)
        })
      }
    })

    actividadesCompletadas.value = completadas
    actividades.value = resActividades.data.obtenerActividadesCasa || []
    
    // Inicializar comentarios vacíos
    actividades.value.forEach(a => {
      if (!comentarios.value[a.actividad.id_actividad]) {
        comentarios.value[a.actividad.id_actividad] = ''
      }
    })

  } catch (err) {
    console.error("Error al cargar actividades", err)
  } finally {
    cargando.value = false
  }
}

async function marcarComoRealizada(actividadId) {
  if (actividadesCompletadas.value.has(actividadId)) return

  enviando.value[actividadId] = true
  try {
    await apolloClient.mutate({
      mutation: MARCAR_ACTIVIDAD_COMPLETADA,
      variables: {
        estudianteId: props.id,
        actividadId: actividadId,
        comentario: comentarios.value[actividadId] || ''
      }
    })

    actividadesCompletadas.value.add(actividadId)
    mensajeExito.value = '¡Actividad marcada como realizada!'
    setTimeout(() => { mensajeExito.value = '' }, 3000)
  } catch (err) {
    console.error("Error al completar", err)
    alert("Hubo un error al marcar la actividad.")
  } finally {
    enviando.value[actividadId] = false
  }
}

function volver() {
  router.push(`/familia/hijo/${props.id}`)
}

onMounted(cargarDatos)
</script>

<template>
  <div class="actividades-casa animate-fade-in">
    <!-- Header/Back -->
    <div class="page-header">
      <button class="btn btn-ghost btn-sm btn-back" @click="volver">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        Volver al perfil
      </button>
      <h1>Actividades en Casa</h1>
      <p class="subtitle">Bandeja de actividades asignadas por el docente</p>
    </div>

    <!-- Mensaje de éxito -->
    <Transition name="fade">
      <div v-if="mensajeExito" class="toast toast-success">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        {{ mensajeExito }}
      </div>
    </Transition>

    <div v-if="cargando" class="loading-state">
      <div class="spinner spinner-lg"></div>
      <p>Cargando bandeja...</p>
    </div>

    <div v-else-if="actividades.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
      </div>
      <h3>Sin actividades</h3>
      <p>No hay actividades para el hogar asignadas en este momento.</p>
    </div>

    <div v-else class="actividades-list animate-slide-up">
      <div 
        v-for="item in actividades" 
        :key="item.actividad.id_actividad" 
        class="actividad-card"
        :class="{ 'is-completed': actividadesCompletadas.has(item.actividad.id_actividad) }"
      >
        <div class="actividad-content">
          <!-- Status Badge -->
          <div class="status-badge">
            <span v-if="actividadesCompletadas.has(item.actividad.id_actividad)" class="badge badge-success">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              Completada
            </span>
            <span v-else class="badge badge-warning">Pendiente</span>
          </div>

          <h3 class="actividad-title">{{ item.actividad.descripcion_actividad }}</h3>
          
          <div v-if="item.actividad.fecha_actividad" class="actividad-meta">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Fecha: {{ new Date(parseInt(item.actividad.fecha_actividad)).toLocaleDateString() }}
          </div>

          <div v-if="item.actividad.archivos_adjuntos?.length > 0" class="archivos-adjuntos">
            <div class="label-small">Recursos adjuntos:</div>
            <a 
              v-for="(archivo, i) in item.actividad.archivos_adjuntos" 
              :key="i"
              :href="archivo.url" 
              target="_blank"
              class="adjunto-link"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
              Recurso {{ i + 1 }}
            </a>
          </div>

          <!-- Acción (Formulario para marcar realizada) -->
          <div v-if="!actividadesCompletadas.has(item.actividad.id_actividad)" class="actividad-action-area">
            <div class="form-group mb-0">
              <label class="form-label" :for="'comentario-' + item.actividad.id_actividad">Comentario (opcional):</label>
              <textarea 
                :id="'comentario-' + item.actividad.id_actividad"
                v-model="comentarios[item.actividad.id_actividad]"
                class="form-input text-area" 
                placeholder="Ej. 'Se le dificultó un poco al final, pero lo logró'"
                rows="2"
              ></textarea>
            </div>
            
            <label class="checkbox-container">
              <input type="checkbox" :id="'check-' + item.actividad.id_actividad" class="sr-only custom-checkbox">
              <div class="checkbox-box" @click="marcarComoRealizada(item.actividad.id_actividad)">
                <svg v-if="enviando[item.actividad.id_actividad]" class="spinner w-4 h-4" viewBox="0 0 24 24"></svg>
                <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <span class="checkbox-label" @click="marcarComoRealizada(item.actividad.id_actividad)">
                He revisado y realizado esta actividad con mi hijo/a
              </span>
            </label>
          </div>
          
          <!-- Vista completada -->
          <div v-else class="actividad-action-area completada">
            <p class="completada-msg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--success-400)" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              Actividad completada y reportada al docente.
            </p>
          </div>

        </div>
      </div>
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

/* ═══ LISTA DE ACTIVIDADES ═══ */
.actividades-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 800px;
}

.actividad-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 24px;
  transition: all var(--transition-base);
}

.actividad-card:hover {
  border-color: var(--border-color-hover);
  box-shadow: var(--shadow-sm);
}

.actividad-card.is-completed {
  background: rgba(43, 48, 64, 0.3);
  border-color: rgba(64,192,87,0.2);
}

.status-badge {
  margin-bottom: 12px;
}

.actividad-title {
  font-size: 1.15rem;
  color: var(--text-primary);
  margin-bottom: 12px;
  line-height: 1.4;
}

.actividad-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 16px;
}

/* ═══ RECURSOS ═══ */
.archivos-adjuntos {
  background: var(--bg-glass);
  padding: 12px 16px;
  border-radius: var(--radius-md);
  margin-bottom: 20px;
}

.label-small {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.adjunto-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: var(--primary-400);
  text-decoration: none;
  padding: 4px 10px;
  background: rgba(76,110,245,0.1);
  border-radius: var(--radius-sm);
  margin-right: 8px;
  margin-bottom: 8px;
  transition: background var(--transition-fast);
}

.adjunto-link:hover {
  background: rgba(76,110,245,0.2);
}

/* ═══ ACTION AREA ═══ */
.actividad-action-area {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.actividad-action-area.completada {
  border-top-color: rgba(64,192,87,0.2);
}

.text-area {
  resize: vertical;
  min-height: 60px;
  max-height: 120px;
}

.checkbox-container {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  padding: 12px;
  background: rgba(64,192,87,0.05);
  border: 1px dashed rgba(64,192,87,0.3);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.checkbox-container:hover {
  background: rgba(64,192,87,0.1);
  border-color: rgba(64,192,87,0.5);
}

.checkbox-box {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--text-muted);
  border-radius: 4px;
  background: transparent;
  flex-shrink: 0;
  transition: all 0.2s ease;
  margin-top: 2px;
}

.checkbox-container:hover .checkbox-box {
  border-color: var(--success-400);
}

.checkbox-label {
  font-size: 0.95rem;
  color: var(--text-secondary);
  line-height: 1.4;
  user-select: none;
}

.completada-msg {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  color: var(--success-400);
  font-weight: 500;
}

/* ═══ TOAST & STATES ═══ */
.toast-success {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: var(--success-600);
  color: white;
  padding: 12px 20px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 100;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.empty-state {
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
.empty-state h3 { margin-bottom: 8px; }
.empty-state p { font-size: 0.9rem; color: var(--text-muted); }

/* ═══ RESPONSIVE (RNF-03) ═══ */
@media (max-width: 480px) {
  .actividad-card {
    padding: 16px;
  }
  .page-header h1 {
    font-size: 1.5rem;
  }
  .checkbox-container {
    padding: 10px;
  }
}
</style>
