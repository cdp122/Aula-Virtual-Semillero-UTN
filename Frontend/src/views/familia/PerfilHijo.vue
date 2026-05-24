<script setup>
import { ref, onMounted } from 'vue'
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

async function cargarDatosPerfil() {
  cargando.value = true
  try {
    // Validar que el hijo pertenezca al usuario logueado
    if (!usuario.value.hijos?.includes(props.id)) {
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
      .slice(0, 3)
      
    // 5. Obtener Evaluaciones (Progreso)
    const resEvaluaciones = await apolloClient.query({
      query: OBTENER_EVALUACIONES_ESTUDIANTE
    })
    
    // Asignar al ref 'evaluaciones' (necesitamos crearlo arriba)
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
</script>

<template>
  <div class="perfil-hijo animate-fade-in">
    <!-- Header/Back -->
    <div class="page-header">
      <button class="btn btn-ghost btn-sm btn-back" @click="irAInicio">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        Volver
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
              <span class="label">Docente:</span>
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
                Actividades en Casa
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Unidades Activas -->
      <section class="unidades-section animate-slide-up" style="animation-delay: 0.1s">
        <div class="section-header">
          <h2>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            Unidades Didácticas Activas
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

      <!-- Evaluaciones / Progreso -->
      <section class="evaluaciones-section animate-slide-up" style="animation-delay: 0.2s">
        <div class="section-header">
          <h2>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            Progreso y Evaluaciones
          </h2>
        </div>

        <div v-if="evaluaciones.length === 0" class="empty-state-small">
          <p>Aún no hay evaluaciones registradas para este alumno.</p>
        </div>

        <div v-else class="evaluaciones-list">
          <div 
            v-for="ev in evaluaciones" 
            :key="ev._id" 
            class="evaluacion-card"
            @click="verProgreso(ev.id_actividad)"
          >
            <div class="eval-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <div class="eval-info">
              <h4>Evaluación de Actividad (ID: {{ ev.id_actividad.substring(0, 8) }}...)</h4>
              <p v-if="ev.historial_versiones?.length > 0">
                Última actualización: {{ new Date(parseInt(ev.historial_versiones[ev.historial_versiones.length - 1].fecha_registro)).toLocaleDateString() }}
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

/* ═══ HEADER ALUMNO ═══ */
.alumno-header-card {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 32px;
  background: var(--gradient-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  margin-bottom: 24px;
}

.alumno-avatar-lg {
  width: 90px;
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(252,196,25,0.15);
  color: var(--accent-400);
  border-radius: 20px;
  font-size: 2.5rem;
  font-weight: 800;
  box-shadow: 0 8px 32px rgba(252,196,25,0.1);
}

.alumno-main-info h1 {
  font-size: 1.8rem;
  margin-bottom: 4px;
  color: var(--text-primary);
}

.alumno-username {
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 0.9rem;
  margin-bottom: 12px;
}

.tags-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* ═══ GRID INFO ═══ */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.info-card {
  display: flex;
  gap: 16px;
  padding: 24px;
  background: var(--bg-card);
  backdrop-filter: blur(16px);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
}

.card-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  flex-shrink: 0;
}
.card-icon.blue {
  background: rgba(76,110,245,0.12);
  color: var(--primary-400);
}
.card-icon.orange {
  background: rgba(253,126,20,0.12);
  color: #fd7e14;
}

.card-content h3 {
  font-size: 1.05rem;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.valor-destacado {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.valor-desc {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-bottom: 16px;
}

.docente-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.docente-info .label {
  font-size: 0.8rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.docente-perfil {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
  color: var(--text-primary);
}

.doc-avatar {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: 50%;
  font-size: 0.75rem;
}

.accesos-acciones {
  margin-top: auto;
}

/* ═══ UNIDADES ═══ */
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

/* ═══ EVALUACIONES ═══ */
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

.eval-info p {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.eval-action {
  color: var(--text-muted);
  transition: color var(--transition-fast);
}

.evaluacion-card:hover .eval-action {
  color: var(--success-400);
}

/* ═══ UTIL ═══ */
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
