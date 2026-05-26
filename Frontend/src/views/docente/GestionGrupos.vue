<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth.js'
import apolloClient from '../../graphql/client.js'
import {
  CURSOS_POR_DOCENTE,
  CREAR_CURSO,
  ACTUALIZAR_CURSO,
  ELIMINAR_CURSO
} from '../../graphql/queries.js'

const router = useRouter()
const { usuario } = useAuth()

const cursos = ref([])
const cargando = ref(true)
const errorMsg = ref('')
const toast = ref({ show: false, message: '', type: 'success' })

/* ── Modal Nuevo Grupo ── */
const mostrarModalNuevo = ref(false)
const pasoActual = ref(1)
const nuevoGrupo = ref({ nombre: '' })
const creandoGrupo = ref(false)

/* ── Modal Editar ── */
const mostrarModalEditar = ref(false)
const grupoEditando = ref(null)
const editandoGrupo = ref(false)

/* ── Modal Confirmar Eliminar ── */
const mostrarModalEliminar = ref(false)
const grupoAEliminar = ref(null)
const eliminandoGrupo = ref(false)

/* ── Búsqueda ── */
const busqueda = ref('')

const cursosFiltrados = computed(() => {
  if (!busqueda.value.trim()) return cursos.value
  const q = busqueda.value.toLowerCase()
  return cursos.value.filter(c =>
    c.nombre_curso.toLowerCase().includes(q)
  )
})

const totalAlumnos = computed(() =>
  cursos.value.reduce((sum, c) => sum + (c.estudiantes?.length || 0), 0)
)

async function cargarCursos() {
  cargando.value = true
  errorMsg.value = ''
  try {
    const { data } = await apolloClient.query({
      query: CURSOS_POR_DOCENTE,
      variables: { docenteId: usuario.value._id }
    })
    cursos.value = data.cursosPorDocente || []
    try {
      const gruposStorage = cursos.value.map(curso => ({
        id: curso._id,
        nombre: curso.nombre_curso
      }))
      localStorage.setItem('semilleros_utn_grupos', JSON.stringify(gruposStorage))
    } catch (storageError) {
      console.warn('No se pudo guardar grupos en storage', storageError)
    }
  } catch (err) {
    errorMsg.value = 'Error al cargar los grupos'
    console.error(err)
  } finally {
    cargando.value = false
  }
}

/* ── Crear Grupo (máximo 3 pasos: RNF-08) ── */
function abrirModalNuevo() {
  nuevoGrupo.value = { nombre: '' }
  pasoActual.value = 1
  mostrarModalNuevo.value = true
}

function cerrarModalNuevo() {
  mostrarModalNuevo.value = false
  pasoActual.value = 1
}

async function crearGrupo() {
  if (!nuevoGrupo.value.nombre.trim()) return
  creandoGrupo.value = true
  try {
    await apolloClient.mutate({
      mutation: CREAR_CURSO,
      variables: {
        input: {
          nombre_curso: nuevoGrupo.value.nombre.trim(),
          id_docente: usuario.value._id,
          activo: true,
          estudiantes: []
        }
      }
    })
    pasoActual.value = 3
    mostrarToast('Grupo creado exitosamente', 'success')
    await cargarCursos()
  } catch (err) {
    mostrarToast('Error al crear el grupo', 'error')
    console.error(err)
  } finally {
    creandoGrupo.value = false
  }
}

/* ── Editar Grupo ── */
function abrirModalEditar(curso) {
  grupoEditando.value = { ...curso }
  mostrarModalEditar.value = true
}

async function guardarEdicion() {
  editandoGrupo.value = true
  try {
    await apolloClient.mutate({
      mutation: ACTUALIZAR_CURSO,
      variables: {
        id: grupoEditando.value._id,
        input: { nombre_curso: grupoEditando.value.nombre_curso }
      }
    })
    mostrarToast('Grupo actualizado', 'success')
    mostrarModalEditar.value = false
    await cargarCursos()
  } catch (err) {
    mostrarToast('Error al actualizar', 'error')
  } finally {
    editandoGrupo.value = false
  }
}

/* ── Eliminar Grupo ── */
function confirmarEliminar(curso) {
  grupoAEliminar.value = curso
  mostrarModalEliminar.value = true
}

async function eliminarGrupo() {
  eliminandoGrupo.value = true
  try {
    await apolloClient.mutate({
      mutation: ELIMINAR_CURSO,
      variables: { id: grupoAEliminar.value._id }
    })
    mostrarToast('Grupo eliminado', 'success')
    mostrarModalEliminar.value = false
    await cargarCursos()
  } catch (err) {
    mostrarToast('Error al eliminar', 'error')
  } finally {
    eliminandoGrupo.value = false
  }
}

function verDetalle(cursoId) {
  router.push(`/docente/grupos/${cursoId}`)
}

function mostrarToast(message, type) {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}

onMounted(cargarCursos)
</script>

<template>
  <div class="gestion-grupos">
    <!-- Header -->
    <div class="page-header animate-fade-in">
      <div>
        <h1>Mis Grupos</h1>
        <p class="page-subtitle">Gestiona tus grupos de estudiantes</p>
      </div>
      <button class="btn btn-primary" @click="abrirModalNuevo">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Nuevo Grupo
      </button>
    </div>

    <!-- Stats cards -->
    <div class="stats-row animate-slide-up">
      <div class="stat-card">
        <div class="stat-card-icon sc-blue">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
        <div>
          <div class="stat-card-value">{{ cursos.length }}</div>
          <div class="stat-card-label">Grupos</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon sc-gold">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
        <div>
          <div class="stat-card-value">{{ totalAlumnos }}</div>
          <div class="stat-card-label">Alumnos Total</div>
        </div>
      </div>
    </div>

    <!-- Search -->
    <div class="search-bar animate-slide-up">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input
        v-model="busqueda"
        type="text"
        class="form-input"
        placeholder="Buscar grupo..."
      />
    </div>

    <!-- Loading -->
    <div v-if="cargando" class="loading-state">
      <div class="spinner spinner-lg"></div>
      <p>Cargando grupos...</p>
    </div>

    <!-- Error -->
    <div v-else-if="errorMsg" class="error-state">
      <p>{{ errorMsg }}</p>
      <button class="btn btn-ghost" @click="cargarCursos">Reintentar</button>
    </div>

    <!-- Empty state -->
    <div v-else-if="cursosFiltrados.length === 0 && !busqueda" class="empty-state">
      <div class="empty-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      </div>
      <h3>No tienes grupos aún</h3>
      <p>Crea tu primer grupo de estudiantes para comenzar</p>
      <button class="btn btn-primary" @click="abrirModalNuevo">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Crear primer grupo
      </button>
    </div>

    <!-- No results -->
    <div v-else-if="cursosFiltrados.length === 0 && busqueda" class="empty-state">
      <p>No se encontraron grupos con "{{ busqueda }}"</p>
    </div>

    <!-- Grupo cards -->
    <div v-else class="groups-grid">
      <div
        v-for="(curso, i) in cursosFiltrados"
        :key="curso._id"
        class="group-card"
        :style="{ animationDelay: `${i * 0.08}s` }"
      >
        <div class="group-card-header">
          <div class="group-card-info" @click="verDetalle(curso._id)" style="cursor: pointer;">
            <h3>{{ curso.nombre_curso }}</h3>
            <div class="group-meta">
              <span class="badge badge-primary">
                {{ curso.estudiantes?.length || 0 }} alumnos
              </span>
              <span class="badge" :class="curso.activo ? 'badge-success' : 'badge-danger'">
                {{ curso.activo ? 'Activo' : 'Inactivo' }}
              </span>
            </div>
          </div>
          <div class="group-actions">
            <button class="action-btn" title="Ver detalle" @click="verDetalle(curso._id)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
            <button class="action-btn" title="Editar" @click="abrirModalEditar(curso)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="action-btn action-btn-danger" title="Eliminar" @click="confirmarEliminar(curso)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </div>

        <div class="group-students-preview" @click="verDetalle(curso._id)" style="cursor: pointer;">
          <div
            v-for="est in (curso.estudiantes || []).slice(0, 4)"
            :key="est.id_estudiante"
            class="student-chip"
          >
            <div class="student-chip-avatar">{{ est.nombre?.[0]?.toUpperCase() || '?' }}</div>
            <span>{{ est.nombre?.split(' ').slice(0, 2).join(' ') }}</span>
          </div>
          <div v-if="(curso.estudiantes?.length || 0) > 4" class="student-chip student-chip-more">
            +{{ curso.estudiantes.length - 4 }} más
          </div>
          <div v-if="!curso.estudiantes?.length" class="no-students">
            Sin alumnos asignados
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ MODAL: Nuevo Grupo (3 pasos - RNF-08) ═══ -->
    <div v-if="mostrarModalNuevo" class="modal-overlay" @click.self="cerrarModalNuevo">
      <div class="modal-content">
        <div class="modal-header">
          <h3>
            <span v-if="pasoActual === 1">Nuevo Grupo</span>
            <span v-else-if="pasoActual === 2">Confirmar</span>
            <span v-else>¡Listo!</span>
          </h3>
          <button class="modal-close" @click="cerrarModalNuevo">✕</button>
        </div>

        <!-- Stepper -->
        <div class="stepper">
          <div class="step" :class="{ active: pasoActual >= 1, done: pasoActual > 1 }">
            <div class="step-dot">1</div>
            <span>Datos</span>
          </div>
          <div class="step-line" :class="{ active: pasoActual >= 2 }"></div>
          <div class="step" :class="{ active: pasoActual >= 2, done: pasoActual > 2 }">
            <div class="step-dot">2</div>
            <span>Confirmar</span>
          </div>
          <div class="step-line" :class="{ active: pasoActual >= 3 }"></div>
          <div class="step" :class="{ active: pasoActual >= 3 }">
            <div class="step-dot">3</div>
            <span>Resultado</span>
          </div>
        </div>

        <!-- Paso 1: Nombre del grupo -->
        <div v-if="pasoActual === 1" class="step-content">
          <div class="form-group">
            <label class="form-label">Nombre del grupo</label>
            <input
              v-model="nuevoGrupo.nombre"
              type="text"
              class="form-input"
              placeholder='Ej: "Cuarto semestre A"'
              @keyup.enter="nuevoGrupo.nombre.trim() && (pasoActual = 2)"
              autofocus
            />
          </div>
          <div class="modal-actions">
            <button class="btn btn-ghost" @click="cerrarModalNuevo">Cancelar</button>
            <button
              class="btn btn-primary"
              :disabled="!nuevoGrupo.nombre.trim()"
              @click="pasoActual = 2"
            >
              Siguiente
            </button>
          </div>
        </div>

        <!-- Paso 2: Confirmar -->
        <div v-else-if="pasoActual === 2" class="step-content">
          <div class="confirm-card">
            <p class="confirm-label">Se creará el grupo:</p>
            <p class="confirm-value">{{ nuevoGrupo.nombre }}</p>
            <p class="confirm-note">Podrás agregar alumnos después de crear el grupo.</p>
          </div>
          <div class="modal-actions">
            <button class="btn btn-ghost" @click="pasoActual = 1">Atrás</button>
            <button
              class="btn btn-primary"
              :disabled="creandoGrupo"
              @click="crearGrupo"
            >
              <span v-if="creandoGrupo" class="spinner"></span>
              <span v-else>Crear Grupo</span>
            </button>
          </div>
        </div>

        <!-- Paso 3: Resultado -->
        <div v-else class="step-content">
          <div class="success-state">
            <div class="success-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <h3>Grupo creado exitosamente</h3>
            <p>Ya puedes agregar alumnos al grupo</p>
          </div>
          <div class="modal-actions">
            <button class="btn btn-ghost" @click="cerrarModalNuevo">Cerrar</button>
            <button class="btn btn-primary" @click="cerrarModalNuevo">Aceptar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ MODAL: Editar Grupo ═══ -->
    <div v-if="mostrarModalEditar" class="modal-overlay" @click.self="mostrarModalEditar = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Editar Grupo</h3>
          <button class="modal-close" @click="mostrarModalEditar = false">✕</button>
        </div>
        <div class="form-group">
          <label class="form-label">Nombre del grupo</label>
          <input
            v-model="grupoEditando.nombre_curso"
            type="text"
            class="form-input"
            autofocus
          />
        </div>
        <div class="modal-actions">
          <button class="btn btn-ghost" @click="mostrarModalEditar = false">Cancelar</button>
          <button class="btn btn-primary" :disabled="editandoGrupo" @click="guardarEdicion">
            <span v-if="editandoGrupo" class="spinner"></span>
            <span v-else>Guardar</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ═══ MODAL: Confirmar Eliminar ═══ -->
    <div v-if="mostrarModalEliminar" class="modal-overlay" @click.self="mostrarModalEliminar = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Eliminar Grupo</h3>
          <button class="modal-close" @click="mostrarModalEliminar = false">✕</button>
        </div>
        <p style="margin-bottom: 8px;">¿Estás seguro de que deseas eliminar el grupo?</p>
        <div class="confirm-card" style="border-color: var(--danger-600);">
          <p class="confirm-value">{{ grupoAEliminar?.nombre_curso }}</p>
          <p class="confirm-note" style="color: var(--danger-400);">Esta acción no se puede deshacer.</p>
        </div>
        <div class="modal-actions">
          <button class="btn btn-ghost" @click="mostrarModalEliminar = false">Cancelar</button>
          <button class="btn btn-danger" :disabled="eliminandoGrupo" @click="eliminarGrupo">
            <span v-if="eliminandoGrupo" class="spinner"></span>
            <span v-else>Eliminar</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ═══ TOAST ═══ -->
    <Transition name="toast">
      <div v-if="toast.show" class="toast" :class="'toast-' + toast.type">
        <svg v-if="toast.type === 'success'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--success-400)" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--danger-400)" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        {{ toast.message }}
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.gestion-grupos {
  animation: fadeIn var(--transition-slow) ease-out;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 28px;
  gap: 16px;
  flex-wrap: wrap;
}

.page-header h1 {
  font-size: 1.8rem;
  margin-bottom: 4px;
}

.page-subtitle {
  font-size: 0.9rem;
  color: var(--text-muted);
}

/* ═══ STATS ═══ */
.stats-row {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 22px;
  background: var(--bg-card);
  backdrop-filter: blur(16px);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  flex: 1;
  min-width: 180px;
}

.stat-card-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.sc-blue {
  background: rgba(76,110,245,0.12);
  color: var(--primary-400);
}

.sc-gold {
  background: rgba(252,196,25,0.12);
  color: var(--accent-400);
}

.stat-card-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1;
}

.stat-card-label {
  font-size: 0.78rem;
  color: var(--text-muted);
  margin-top: 2px;
}

/* ═══ SEARCH ═══ */
.search-bar {
  position: relative;
  margin-bottom: 24px;
}

.search-bar svg {
  position: absolute;
  top: 50%;
  left: 14px;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}

.search-bar .form-input {
  padding-left: 42px;
}

/* ═══ GROUPS GRID ═══ */
.groups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 16px;
}

.group-card {
  background: var(--bg-card);
  backdrop-filter: blur(16px);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 22px;
  transition: all var(--transition-base);
  animation: slideUp 0.4s ease-out both;
}

.group-card:hover {
  border-color: var(--border-color-hover);
  box-shadow: var(--shadow-md);
}

.group-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.group-card-info h3 {
  font-size: 1.05rem;
  margin-bottom: 8px;
  line-height: 1.3;
}

.group-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.group-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.action-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.action-btn:hover {
  background: var(--bg-glass-hover);
  color: var(--text-primary);
  border-color: var(--border-color-hover);
}

.action-btn-danger:hover {
  background: rgba(250,82,82,0.12);
  color: var(--danger-400);
  border-color: var(--danger-500);
}

/* ═══ STUDENTS PREVIEW ═══ */
.group-students-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.student-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px 4px 4px;
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-full);
  font-size: 0.78rem;
  color: var(--text-secondary);
}

.student-chip-avatar {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(76,110,245,0.15);
  color: var(--primary-400);
  border-radius: 50%;
  font-size: 0.7rem;
  font-weight: 700;
}

.student-chip-more {
  background: rgba(252,196,25,0.08);
  border-color: rgba(252,196,25,0.2);
  color: var(--accent-400);
  padding: 4px 12px;
}

.no-students {
  font-size: 0.82rem;
  color: var(--text-muted);
  font-style: italic;
}

/* ═══ STEPPER ═══ */
.stepper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  margin-bottom: 28px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.step span {
  font-size: 0.72rem;
  color: var(--text-muted);
}

.step.active span {
  color: var(--primary-400);
}

.step-dot {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--bg-glass);
  border: 2px solid var(--border-color);
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-muted);
  transition: all var(--transition-base);
}

.step.active .step-dot {
  background: var(--primary-600);
  border-color: var(--primary-500);
  color: #fff;
}

.step.done .step-dot {
  background: var(--success-600);
  border-color: var(--success-500);
  color: #fff;
}

.step-line {
  width: 60px;
  height: 2px;
  background: var(--border-color);
  margin: 0 8px;
  margin-bottom: 20px;
  transition: background var(--transition-base);
}

.step-line.active {
  background: var(--primary-500);
}

.step-content {
  animation: fadeIn var(--transition-fast) ease-out;
}

/* ═══ CONFIRM ═══ */
.confirm-card {
  padding: 20px;
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  margin-bottom: 8px;
}

.confirm-label {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 6px;
}

.confirm-value {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.confirm-note {
  font-size: 0.82rem;
  color: var(--text-muted);
}

/* ═══ SUCCESS ═══ */
.success-state {
  text-align: center;
  padding: 20px 0;
}

.success-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(64,192,87,0.12);
  color: var(--success-400);
  border-radius: 50%;
  margin: 0 auto 16px;
}

.success-state h3 {
  margin-bottom: 6px;
}

.success-state p {
  font-size: 0.9rem;
  color: var(--text-muted);
}

/* ═══ EMPTY / LOADING / ERROR ═══ */
.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.loading-state .spinner {
  margin: 0 auto 16px;
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

.empty-state h3 {
  margin-bottom: 8px;
}

.empty-state p {
  margin-bottom: 20px;
  font-size: 0.9rem;
}

/* ═══ TOAST TRANSITION ═══ */
.toast-enter-active { animation: slideUp var(--transition-base) ease-out; }
.toast-leave-active { animation: fadeIn var(--transition-fast) ease-out reverse; }

/* ═══ RESPONSIVE ═══ */
@media (max-width: 640px) {
  .groups-grid {
    grid-template-columns: 1fr;
  }

  .stats-row {
    flex-direction: column;
  }

  .page-header {
    flex-direction: column;
  }

  .page-header .btn {
    width: 100%;
  }

  .step-line {
    width: 30px;
  }
}
</style>
