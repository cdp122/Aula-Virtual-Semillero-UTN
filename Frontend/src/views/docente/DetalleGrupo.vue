<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth.js'
import apolloClient from '../../graphql/client.js'
import {
  OBTENER_CURSO_POR_ID,
  ACTUALIZAR_CURSO,
  CREAR_USUARIO,
  OBTENER_USUARIOS,
  ACTUALIZAR_USUARIO,
  ELIMINAR_USUARIO,
  OBTENER_UNIDADES_DIDACTICAS,
  OBTENER_EVALUACIONES_ESTUDIANTE
} from '../../graphql/queries.js'

const props = defineProps({ id: String })
const router = useRouter()
const { usuario } = useAuth()

const curso = ref(null)
const cargando = ref(true)
const toast = ref({ show: false, message: '', type: 'success' })

/* ── Pestaña Activa ── */
const pestañaActiva = ref('alumnos') // 'alumnos' o 'grupal'

/* ── Datos para Seguimiento Grupal ── */
const unidades = ref([])
const evaluaciones = ref([])
const filtroActividad = ref('')
const cargandoEvals = ref(false)

/* ── Modal: Nuevo / Editar Alumno ── */
const mostrarModalAlumno = ref(false)
const modoEdicion = ref(false)
const alumnoForm = ref({
  nombre: '',
  username: '',
  contrasena: '',
  contacto: { numero: '', correo: '' },
  representante: ''
})
const alumnoEditId = ref(null)
const guardandoAlumno = ref(false)

/* ── Modal: Vincular Existente ── */
const mostrarModalVincular = ref(false)
const todosUsuarios = ref([])
const busquedaVincular = ref('')
const cargandoUsuarios = ref(false)

/* ── Modal: Confirmar desvincular ── */
const mostrarModalDesvincular = ref(false)
const alumnoADesvincular = ref(null)

/* ── Búsqueda ── */
const busqueda = ref('')

const estudiantesFiltrados = computed(() => {
  if (!curso.value?.estudiantes) return []
  if (!busqueda.value.trim()) return curso.value.estudiantes
  const q = busqueda.value.toLowerCase()
  return curso.value.estudiantes.filter(e =>
    e.nombre.toLowerCase().includes(q)
  )
})

const usuariosDisponibles = computed(() => {
  const idsEnCurso = new Set((curso.value?.estudiantes || []).map(e => e.id_estudiante))
  const q = busquedaVincular.value.toLowerCase()
  return todosUsuarios.value.filter(u =>
    u.roles?.includes('rol-est') &&
    !idsEnCurso.has(u._id) &&
    (u.nombre.toLowerCase().includes(q) || u.username.toLowerCase().includes(q))
  )
})

// Actividades de las unidades para el selector
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

// ID Set de estudiantes en este grupo
const studentIds = computed(() => {
  if (!curso.value?.estudiantes) return new Set()
  return new Set(curso.value.estudiantes.map(e => e.id_estudiante))
})

// Criterio texto helper
function getCriterioTexto(id) {
  if (id === 'crit-001') return 'Clasificación de Información'
  if (id === 'crit-002') return 'Seriación y Ordenamiento'
  return id
}

// Estadísticas del grupo por cada criterio de la actividad seleccionada
const reporteCriterios = computed(() => {
  if (!filtroActividad.value) return []
  const stats = {}

  // Buscar criterios configurados para la actividad
  const act = actividadesDisponibles.value.find(a => a.id_actividad === filtroActividad.value)
  const criteriosAct = act ? act.criterios : []

  // Inicializar acumuladores
  criteriosAct.forEach(c => {
    stats[c.id_criterio] = { iniciado: 0, proceso: 0, logrado: 0, total: 0 }
  })

  // Filtrar evaluaciones que pertenezcan a la actividad y al grupo
  const evalsAct = evaluaciones.value.filter(e => 
    e.id_actividad === filtroActividad.value && 
    studentIds.value.has(e.id_estudiante)
  )

  evalsAct.forEach(ev => {
    const ultima = ev.historial_versiones?.[ev.historial_versiones.length - 1]
    if (ultima?.evaluaciones_criterio) {
      ultima.evaluaciones_criterio.forEach(c => {
        if (stats[c.id_criterio]) {
          const nivel = String(c.nivel_logro).toUpperCase()
          if (nivel.includes('LOGRADO') || nivel === 'L') {
            stats[c.id_criterio].logrado++
          } else if (nivel.includes('PROCESO') || nivel === 'EP') {
            stats[c.id_criterio].proceso++
          } else {
            stats[c.id_criterio].iniciado++
          }
        }
      })
    }
  })

  // Calcular "No Evaluados" (Alumnos del grupo sin evaluación en esta actividad)
  criteriosAct.forEach(c => {
    const totalEst = studentIds.value.size
    const evalEstCount = stats[c.id_criterio].logrado + stats[c.id_criterio].proceso + stats[c.id_criterio].iniciado
    stats[c.id_criterio].no_evaluado = Math.max(0, totalEst - evalEstCount)
    stats[c.id_criterio].total = totalEst
  })

  return Object.entries(stats).map(([id_criterio, val]) => ({
    id_criterio,
    nombre: getCriterioTexto(id_criterio),
    ...val
  }))
})

// Alertas de refuerzo (si Iniciado + No Evaluado superan el 50% del total)
const criteriosRefuerzo = computed(() => {
  return reporteCriterios.value.filter(c => {
    const totalFalta = c.iniciado + c.no_evaluado
    return totalFalta > (c.total / 2)
  })
})

async function cargarCurso() {
  cargando.value = true
  try {
    const { data } = await apolloClient.query({
      query: OBTENER_CURSO_POR_ID,
      variables: { id: props.id },
      fetchPolicy: 'network-only'
    })
    curso.value = data.cursoPorId

    // Validar que el docente sea el dueño (RNF-02)
    if (curso.value && curso.value.id_docente !== usuario.value._id) {
      router.push('/docente/grupos')
      return
    }
  } catch (err) {
    console.error(err)
    mostrarToast('Error al cargar el grupo', 'error')
  } finally {
    cargando.value = false
  }
}

async function cargarDatosGrupal() {
  cargandoEvals.value = true
  try {
    // 1. Cargar unidades del curso
    const resUnidades = await apolloClient.query({
      query: OBTENER_UNIDADES_DIDACTICAS
    })
    unidades.value = resUnidades.data.unidadesDidacticas || []

    // 2. Cargar evaluaciones de estudiantes
    const resEvals = await apolloClient.query({
      query: OBTENER_EVALUACIONES_ESTUDIANTE,
      fetchPolicy: 'network-only'
    })
    evaluaciones.value = resEvals.data.evaluacionesEstudiantes || []

    // Seleccionar la primera actividad por defecto si existe
    if (actividadesDisponibles.value.length > 0 && !filtroActividad.value) {
      filtroActividad.value = actividadesDisponibles.value[0].id_actividad
    }
  } catch (err) {
    console.error(err)
    mostrarToast('Error al cargar métricas grupales', 'error')
  } finally {
    cargandoEvals.value = false
  }
}

async function cambiarPestaña(tab) {
  pestañaActiva.value = tab
  if (tab === 'grupal') {
    await cargarDatosGrupal()
  }
}

/* ── Crear alumno nuevo y vincularlo ── */
function abrirNuevoAlumno() {
  modoEdicion.value = false
  alumnoForm.value = {
    nombre: '',
    username: '',
    contrasena: '',
    contacto: { numero: '', correo: '' },
    representante: ''
  }
  alumnoEditId.value = null
  mostrarModalAlumno.value = true
}

function abrirEditarAlumno(est) {
  modoEdicion.value = true
  alumnoEditId.value = est.id_estudiante
  alumnoForm.value = {
    nombre: est.nombre || '',
    username: '',
    contrasena: '',
    contacto: { numero: '', correo: '' },
    representante: ''
  }
  mostrarModalAlumno.value = true
}

async function guardarAlumno() {
  if (!alumnoForm.value.nombre.trim()) return
  guardandoAlumno.value = true

  try {
    if (modoEdicion.value) {
      await apolloClient.mutate({
        mutation: ACTUALIZAR_USUARIO,
        variables: {
          id: alumnoEditId.value,
          input: { nombre: alumnoForm.value.nombre.trim() }
        }
      })

      const nuevosEstudiantes = curso.value.estudiantes.map(e => {
        if (e.id_estudiante === alumnoEditId.value) {
          return { id_estudiante: e.id_estudiante, nombre: alumnoForm.value.nombre.trim() }
        }
        return { id_estudiante: e.id_estudiante, nombre: e.nombre }
      })

      await apolloClient.mutate({
        mutation: ACTUALIZAR_CURSO,
        variables: {
          id: props.id,
          input: { estudiantes: nuevosEstudiantes }
        }
      })

      mostrarToast('Alumno actualizado', 'success')
    } else {
      const { data } = await apolloClient.mutate({
        mutation: CREAR_USUARIO,
        variables: {
          input: {
            nombre: alumnoForm.value.nombre.trim(),
            username: alumnoForm.value.username.trim() || alumnoForm.value.nombre.trim().toLowerCase().replace(/\s+/g, '.'),
            contrasena: alumnoForm.value.contrasena || '1234',
            roles: ['rol-est'],
            contacto: {
              numero: alumnoForm.value.contacto.numero || null,
              correo: alumnoForm.value.contacto.correo || null
            },
            activo: true,
            id_representante: alumnoForm.value.representante || null,
            id_cursos: [props.id]
          }
        }
      })

      const nuevosEstudiantes = [
        ...(curso.value.estudiantes || []).map(e => ({
          id_estudiante: e.id_estudiante,
          nombre: e.nombre
        })),
        { id_estudiante: data.crearUsuario._id, nombre: data.crearUsuario.nombre }
      ]

      await apolloClient.mutate({
        mutation: ACTUALIZAR_CURSO,
        variables: {
          id: props.id,
          input: { estudiantes: nuevosEstudiantes }
        }
      })

      mostrarToast('Alumno creado y vinculado', 'success')
    }

    mostrarModalAlumno.value = false
    await cargarCurso()
  } catch (err) {
    console.error(err)
    mostrarToast('Error al guardar alumno', 'error')
  } finally {
    guardandoAlumno.value = false
  }
}

/* ── Vincular alumno existente ── */
async function abrirVincular() {
  mostrarModalVincular.value = true
  busquedaVincular.value = ''
  cargandoUsuarios.value = true
  try {
    const { data } = await apolloClient.query({ query: OBTENER_USUARIOS })
    todosUsuarios.value = data.usuarios || []
  } catch (err) {
    console.error(err)
  } finally {
    cargandoUsuarios.value = false
  }
}

async function vincularAlumno(usr) {
  try {
    const nuevosEstudiantes = [
      ...(curso.value.estudiantes || []).map(e => ({
        id_estudiante: e.id_estudiante,
        nombre: e.nombre
      })),
      { id_estudiante: usr._id, nombre: usr.nombre }
    ]

    await apolloClient.mutate({
      mutation: ACTUALIZAR_CURSO,
      variables: {
        id: props.id,
        input: { estudiantes: nuevosEstudiantes }
      }
    })

    mostrarToast(`${usr.nombre} vinculado al grupo`, 'success')
    mostrarModalVincular.value = false
    await cargarCurso()
  } catch (err) {
    mostrarToast('Error al vincular', 'error')
  }
}

/* ── Desvincular alumno ── */
function confirmarDesvincular(est) {
  alumnoADesvincular.value = est
  mostrarModalDesvincular.value = true
}

async function desvincularAlumno() {
  try {
    const nuevosEstudiantes = curso.value.estudiantes
      .filter(e => e.id_estudiante !== alumnoADesvincular.value.id_estudiante)
      .map(e => ({ id_estudiante: e.id_estudiante, nombre: e.nombre }))

    await apolloClient.mutate({
      mutation: ACTUALIZAR_CURSO,
      variables: {
        id: props.id,
        input: { estudiantes: nuevosEstudiantes }
      }
    })

    mostrarToast('Alumno desvinculado', 'success')
    mostrarModalDesvincular.value = false
    await cargarCurso()
  } catch (err) {
    mostrarToast('Error al desvincular', 'error')
  }
}

function mostrarToast(message, type) {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}

onMounted(cargarCurso)
</script>

<template>
  <div class="detalle-grupo">
    <!-- Botón Volver -->
    <button class="back-btn" @click="router.push('/docente/grupos')">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      Volver a Grupos
    </button>

    <!-- Cargando -->
    <div v-if="cargando" class="loading-state">
      <div class="spinner spinner-lg"></div>
      <p>Cargando grupo...</p>
    </div>

    <!-- No Encontrado -->
    <div v-else-if="!curso" class="empty-state">
      <h3>Grupo no encontrado</h3>
      <button class="btn btn-ghost" @click="router.push('/docente/grupos')">Volver</button>
    </div>

    <template v-else>
      <!-- Cabecera -->
      <div class="page-header animate-fade-in">
        <div>
          <h1>{{ curso.nombre_curso }}</h1>
          <p class="page-subtitle">{{ curso.estudiantes?.length || 0 }} alumnos en el grupo</p>
        </div>
        <div class="header-actions" v-if="pestañaActiva === 'alumnos'">
          <button class="btn btn-ghost" @click="abrirVincular">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
            Vincular Existente
          </button>
          <button class="btn btn-primary" @click="abrirNuevoAlumno">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nuevo Alumno
          </button>
        </div>
      </div>

      <!-- Barra de Pestañas -->
      <div class="tabs-header-group">
        <button 
          class="tab-btn" 
          :class="{ active: pestañaActiva === 'alumnos' }" 
          @click="cambiarPestaña('alumnos')"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          Listado de Alumnos
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: pestañaActiva === 'grupal' }" 
          @click="cambiarPestaña('grupal')"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          Seguimiento Grupal
        </button>
      </div>

      <!-- PESTAÑA: ALUMNOS -->
      <div v-if="pestañaActiva === 'alumnos'" class="tab-content animate-fade-in">
        <!-- Búsqueda -->
        <div class="search-bar animate-slide-up" v-if="curso.estudiantes?.length">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            v-model="busqueda"
            type="text"
            class="form-input"
            placeholder="Buscar alumno..."
          />
        </div>

        <div v-if="!curso.estudiantes?.length" class="empty-state">
          <div class="empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <h3>No hay alumnos en este grupo</h3>
          <p>Agrega o vincula alumnos para comenzar</p>
        </div>

        <div v-else class="students-table-wrap animate-slide-up">
          <table class="students-table">
            <thead>
              <tr>
                <th></th>
                <th>Nombre</th>
                <th>ID</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(est, i) in estudiantesFiltrados"
                :key="est.id_estudiante"
                :style="{ animationDelay: `${i * 0.05}s` }"
                class="student-row"
              >
                <td>
                  <div class="student-avatar">
                    {{ est.nombre?.[0]?.toUpperCase() || '?' }}
                  </div>
                </td>
                <td>
                  <div class="student-name">{{ est.nombre }}</div>
                </td>
                <td>
                  <span class="student-id">{{ est.id_estudiante }}</span>
                </td>
                <td>
                  <div class="row-actions">
                    <button class="action-btn" title="Seguimiento" @click="router.push(`/docente/grupos/${props.id}/alumno/${est.id_estudiante}`)">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                    </button>
                    <button class="action-btn" title="Editar" @click="abrirEditarAlumno(est)">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button class="action-btn action-btn-danger" title="Desvincular" @click="confirmarDesvincular(est)">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="18" y1="11" x2="23" y2="11"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- PESTAÑA: SEGUIMIENTO GRUPAL (RF-D05) -->
      <div v-else class="tab-content animate-fade-in">
        <div v-if="cargandoEvals" class="loading-state">
          <div class="spinner"></div>
          <p>Cargando información del grupo...</p>
        </div>

        <div v-else-if="actividadesDisponibles.length === 0" class="empty-state">
          <h3>No hay actividades planificadas</h3>
          <p>Debes crear unidades didácticas y actividades en la sección de Planificación.</p>
        </div>

        <div v-else class="seguimiento-grupal-wrap">
          <!-- Filtro de Actividad -->
          <div class="filtro-panel animate-slide-up">
            <label class="form-label" for="actividad-select">Actividad del Semillero:</label>
            <select id="actividad-select" v-model="filtroActividad" class="form-input select-filtro">
              <option v-for="act in actividadesDisponibles" :key="act.id_actividad" :value="act.id_actividad">
                [{{ act.unidadAmbito }}] {{ act.descripcion.substring(0, 70) }}...
              </option>
            </select>
          </div>

          <!-- Alert de Refuerzo Grupal -->
          <div v-if="criteriosRefuerzo.length > 0" class="alert-refuerzo-box animate-slide-up">
            <div class="alert-icon">⚠️</div>
            <div>
              <h4>Alerta de Refuerzo Colectivo</h4>
              <p>Se identificaron criterios donde más del 50% de los alumnos requieren apoyo o no han sido evaluados:</p>
              <ul>
                <li v-for="crit in criteriosRefuerzo" :key="crit.id_criterio">
                  <strong>{{ crit.nombre }}</strong> (Iniciados: {{ crit.iniciado }}, Sin Evaluar: {{ crit.no_evaluado }} de {{ crit.total }})
                </li>
              </ul>
            </div>
          </div>

          <!-- Cuadrícula de Métricas de Logro -->
          <div class="metricas-grid animate-slide-up" style="animation-delay: 0.05s">
            <div v-for="crit in reporteCriterios" :key="crit.id_criterio" class="metric-card">
              <div class="metric-header">
                <h4>{{ crit.nombre }}</h4>
                <span class="total-badge">{{ crit.total }} alumnos</span>
              </div>

              <!-- Barras de Progreso Acumuladas -->
              <div class="progress-bar-group">
                <div class="bar-container">
                  <!-- Logrado (Verde) -->
                  <div 
                    class="bar-chunk logrado" 
                    :style="{ width: `${(crit.logrado / crit.total) * 100}%` }"
                    title="Logrado"
                  ></div>
                  <!-- En Proceso (Azul) -->
                  <div 
                    class="bar-chunk proceso" 
                    :style="{ width: `${(crit.proceso / crit.total) * 100}%` }"
                    title="En Proceso"
                  ></div>
                  <!-- Iniciado (Dorado) -->
                  <div 
                    class="bar-chunk iniciado" 
                    :style="{ width: `${(crit.iniciado / crit.total) * 100}%` }"
                    title="Iniciado"
                  ></div>
                  <!-- No Evaluado (Gris) -->
                  <div 
                    class="bar-chunk no-evaluado" 
                    :style="{ width: `${(crit.no_evaluado / crit.total) * 100}%` }"
                    title="No Evaluado"
                  ></div>
                </div>
              </div>

              <!-- Leyenda Detallada -->
              <div class="metric-details">
                <div class="detail-item">
                  <span class="dot dot-logrado"></span>
                  <span class="label">Logrado:</span>
                  <strong>{{ crit.logrado }}</strong>
                </div>
                <div class="detail-item">
                  <span class="dot dot-proceso"></span>
                  <span class="label">En Proceso:</span>
                  <strong>{{ crit.proceso }}</strong>
                </div>
                <div class="detail-item">
                  <span class="dot dot-iniciado"></span>
                  <span class="label">Iniciado:</span>
                  <strong>{{ crit.iniciado }}</strong>
                </div>
                <div class="detail-item text-muted">
                  <span class="dot dot-no-eval"></span>
                  <span class="label">Sin Evaluar:</span>
                  <strong>{{ crit.no_evaluado }}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ═══ MODAL: Nuevo / Editar Alumno ═══ -->
    <div v-if="mostrarModalAlumno" class="modal-overlay" @click.self="mostrarModalAlumno = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ modoEdicion ? 'Editar Alumno' : 'Nuevo Alumno' }}</h3>
          <button class="modal-close" @click="mostrarModalAlumno = false">✕</button>
        </div>

        <form @submit.prevent="guardarAlumno" class="alumno-form">
          <div class="form-group">
            <label class="form-label">Nombre completo *</label>
            <input
              v-model="alumnoForm.nombre"
              type="text"
              class="form-input"
              placeholder="Nombre del alumno"
              required
              autofocus
            />
          </div>

          <template v-if="!modoEdicion">
            <div class="form-group">
              <label class="form-label">Nombre de usuario</label>
              <input
                v-model="alumnoForm.username"
                type="text"
                class="form-input"
                placeholder="Se genera automáticamente si no se proporciona"
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Teléfono representante</label>
                <input
                  v-model="alumnoForm.contacto.numero"
                  type="text"
                  class="form-input"
                  placeholder="0991234567"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Correo representante</label>
                <input
                  v-model="alumnoForm.contacto.correo"
                  type="email"
                  class="form-input"
                  placeholder="correo@ejemplo.com"
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">ID Representante</label>
              <input
                v-model="alumnoForm.representante"
                type="text"
                class="form-input"
                placeholder="ID del padre/madre (opcional)"
              />
            </div>
          </template>

          <div class="modal-actions">
            <button type="button" class="btn btn-ghost" @click="mostrarModalAlumno = false">Cancelar</button>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="guardandoAlumno || !alumnoForm.nombre.trim()"
            >
              <span v-if="guardandoAlumno" class="spinner"></span>
              <span v-else>{{ modoEdicion ? 'Guardar' : 'Crear y Vincular' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ═══ MODAL: Vincular Existente ═══ -->
    <div v-if="mostrarModalVincular" class="modal-overlay" @click.self="mostrarModalVincular = false">
      <div class="modal-content modal-lg">
        <div class="modal-header">
          <h3>Vincular Alumno Existente</h3>
          <button class="modal-close" @click="mostrarModalVincular = false">✕</button>
        </div>

        <div class="search-bar" style="margin-bottom: 16px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            v-model="busquedaVincular"
            type="text"
            class="form-input"
            placeholder="Buscar por nombre o usuario..."
            autofocus
          />
        </div>

        <div v-if="cargandoUsuarios" class="loading-state" style="padding: 30px;">
          <div class="spinner"></div>
        </div>

        <div v-else-if="usuariosDisponibles.length === 0" class="empty-state" style="padding: 30px;">
          <p>No hay alumnos disponibles para vincular</p>
        </div>

        <div v-else class="vincular-list">
          <div
            v-for="usr in usuariosDisponibles"
            :key="usr._id"
            class="vincular-item"
          >
            <div class="vincular-info">
              <div class="student-avatar">{{ usr.nombre?.[0]?.toUpperCase() || '?' }}</div>
              <div>
                <div class="student-name">{{ usr.nombre }}</div>
                <div class="student-id">@{{ usr.username }}</div>
              </div>
            </div>
            <button class="btn btn-sm btn-primary" @click="vincularAlumno(usr)">
              Vincular
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ MODAL: Confirmar Desvincular ═══ -->
    <div v-if="mostrarModalDesvincular" class="modal-overlay" @click.self="mostrarModalDesvincular = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Desvincular Alumno</h3>
          <button class="modal-close" @click="mostrarModalDesvincular = false">✕</button>
        </div>
        <p>¿Deseas desvincular a este alumno del grupo?</p>
        <div class="confirm-card" style="margin-top: 12px;">
          <p class="confirm-value">{{ alumnoADesvincular?.nombre }}</p>
          <p class="confirm-note">El alumno no será eliminado del sistema, solo se desvinculará del grupo.</p>
        </div>
        <div class="modal-actions">
          <button class="btn btn-ghost" @click="mostrarModalDesvincular = false">Cancelar</button>
          <button class="btn btn-danger" @click="desvincularAlumno">Desvincular</button>
        </div>
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
  </div>
</template>

<style scoped>
.detalle-grupo {
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

.header-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

/* Pestañas */
.tabs-header-group {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 28px;
  padding-bottom: 1px;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  padding: 12px 20px;
  color: var(--text-secondary);
  font-family: var(--font-sans);
  font-weight: 600;
  font-size: 0.92rem;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all var(--transition-fast);
}

.tab-btn:hover {
  color: var(--text-primary);
  background: var(--bg-glass-hover);
}

.tab-btn.active {
  color: var(--primary-400);
  border-bottom-color: var(--primary-400);
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

/* ── Seguimiento Grupal UI ── */
.seguimiento-grupal-wrap {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.filtro-panel {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  padding: 16px 20px;
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.select-filtro {
  max-width: 100%;
}

.alert-refuerzo-box {
  background: rgba(250,82,82,0.06);
  border: 1px solid rgba(250,82,82,0.2);
  border-radius: var(--radius-md);
  padding: 18px 24px;
  display: flex;
  gap: 16px;
  align-items: flex-start;
  color: var(--text-secondary);
}

.alert-icon {
  font-size: 1.5rem;
  line-height: 1;
}

.alert-refuerzo-box h4 {
  color: var(--danger-400);
  font-size: 1rem;
  margin-bottom: 6px;
  font-weight: 700;
}

.alert-refuerzo-box p {
  font-size: 0.88rem;
  margin-bottom: 8px;
}

.alert-refuerzo-box ul {
  padding-left: 20px;
  font-size: 0.85rem;
}

.alert-refuerzo-box li {
  margin-bottom: 4px;
}

.metricas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 20px;
}

.metric-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  padding: 24px;
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
}

.metric-header h4 {
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.4;
}

.total-badge {
  background: var(--bg-glass);
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--text-muted);
  border: 1px solid var(--border-color);
}

.progress-bar-group {
  margin-bottom: 20px;
}

.bar-container {
  height: 12px;
  display: flex;
  background: rgba(255,255,255,0.05);
  border-radius: var(--radius-full);
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.bar-chunk {
  height: 100%;
  transition: width 0.4s ease;
}

.bar-chunk.logrado {
  background: var(--success-600);
}

.bar-chunk.proceso {
  background: var(--primary-600);
}

.bar-chunk.iniciado {
  background: var(--accent-600);
}

.bar-chunk.no-evaluado {
  background: var(--gray-700);
}

.metric-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: auto;
  border-top: 1px dashed var(--border-color);
  padding-top: 16px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.dot.dot-logrado { background: var(--success-600); }
.dot.dot-proceso { background: var(--primary-600); }
.dot.dot-iniciado { background: var(--accent-600); }
.dot.dot-no-eval { background: var(--gray-700); }

.detail-item .label {
  color: var(--text-secondary);
}

.detail-item strong {
  margin-left: auto;
  color: var(--text-primary);
}

/* Tabla y general */
.students-table-wrap {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow-x: auto;
  box-shadow: var(--shadow-sm);
}

.students-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.students-table th {
  padding: 14px 24px;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-body);
}

.students-table td {
  padding: 18px 24px;
  border-bottom: 1px solid var(--border-color);
  vertical-align: middle;
}

.student-row:last-child td {
  border-bottom: none;
}

.student-row {
  transition: background var(--transition-fast);
}

.student-row:hover {
  background: var(--bg-glass);
}

.student-avatar {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(139,92,246,0.1);
  color: var(--primary-600);
  border-radius: var(--radius-md);
  font-weight: 800;
  font-size: 1rem;
  flex-shrink: 0;
}

.student-name {
  font-weight: 700;
  color: var(--text-primary);
  font-size: 1rem;
}

.student-id {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-family: var(--font-mono);
  background: var(--bg-body);
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
}

.row-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.action-btn:hover {
  background: var(--bg-glass-hover);
  color: var(--text-primary);
}
.action-btn-danger:hover {
  background: rgba(250,82,82,0.12);
  color: var(--danger-400);
  border-color: var(--danger-500);
}

/* ═══ FORM ═══ */
.alumno-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

/* ═══ VINCULAR LIST ═══ */
.vincular-list {
  max-height: 320px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.vincular-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.vincular-item:hover {
  border-color: var(--border-color-hover);
}

.vincular-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-lg {
  max-width: 580px;
}

/* ═══ STATES ═══ */
.loading-state,
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
.empty-state h3 { margin-bottom: 8px; }
.empty-state p { margin-bottom: 20px; font-size: 0.9rem; }

.confirm-card {
  padding: 20px;
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
}
.confirm-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 6px;
}
.confirm-note {
  font-size: 0.82rem;
  color: var(--text-muted);
}

.toast-enter-active { animation: slideUp var(--transition-base) ease-out; }
.toast-leave-active { animation: fadeIn var(--transition-fast) ease-out reverse; }

/* ═══ RESPONSIVE ═══ */
@media (max-width: 640px) {
  .header-actions {
    width: 100%;
  }
  .header-actions .btn {
    flex: 1;
  }
  .form-row {
    grid-template-columns: 1fr;
  }
  .page-header {
    flex-direction: column;
  }
  .tabs-header-group {
    flex-wrap: wrap;
  }
  .tab-btn {
    flex: 1;
    text-align: center;
    padding: 10px;
  }
  .metricas-grid {
    grid-template-columns: 1fr;
  }
}
</style>
