// stores/useEvaluacionesStore.js
// Pinia store para evaluaciones de estudiantes (RF-D03, RF-D06)
import { defineStore } from 'pinia'
import { ref } from 'vue'
import apolloClient from '../graphql/client.js'
import {
  OBTENER_EVALUACIONES_ESTUDIANTE,
  REGISTRAR_NUEVA_VERSION_EVALUACION,
  ACTUALIZAR_FICHA_MONITOREO_ESTUDIANTE
} from '../graphql/queries.js'

export const useEvaluacionesStore = defineStore('evaluaciones', () => {
  const evaluaciones = ref([])
  const cargando = ref(false)
  const error = ref(null)

  async function cargar() {
    cargando.value = true
    error.value = null
    try {
      const { data } = await apolloClient.query({
        query: OBTENER_EVALUACIONES_ESTUDIANTE,
        fetchPolicy: 'network-only'
      })
      evaluaciones.value = data.evaluacionesEstudiantes || []
    } catch (e) {
      error.value = e.message
    } finally {
      cargando.value = false
    }
  }

  // Obtiene evaluaciones de un alumno específico
  function porAlumno(alumnoId) {
    return evaluaciones.value.filter(e => e.id_estudiante === alumnoId)
  }

  // Última versión de evaluación de un alumno en una actividad
  function ultimaVersion(alumnoId, actividadId) {
    const ev = evaluaciones.value.find(
      e => e.id_estudiante === alumnoId && e.id_actividad === actividadId
    )
    if (!ev || !ev.historial_versiones?.length) return null
    return ev.historial_versiones[ev.historial_versiones.length - 1]
  }

  // Ficha de monitoreo de un alumno
  function fichaDeAlumno(alumnoId) {
    const ev = evaluaciones.value.find(
      e => e.id_estudiante === alumnoId && e.ficha_monitoreo
    )
    return ev?.ficha_monitoreo || null
  }

  // RNF-06: Registrar nueva versión (inmutable — no borra historial)
  async function registrarVersion(id_evaluacion, docente_evaluador, evaluaciones_criterio) {
    const { data } = await apolloClient.mutate({
      mutation: REGISTRAR_NUEVA_VERSION_EVALUACION,
      variables: { id_evaluacion, docente_evaluador, evaluaciones_criterio }
    })
    // Refrescar
    await cargar()
    return data.registrarNuevaVersionEvaluacion
  }

  // RF-D06: Actualizar ficha de monitoreo
  async function actualizarFicha(id_evaluacion, ficha) {
    const { data } = await apolloClient.mutate({
      mutation: ACTUALIZAR_FICHA_MONITOREO_ESTUDIANTE,
      variables: { id_evaluacion, ficha }
    })
    await cargar()
    return data.actualizarFichaMonitoreoEstudiante
  }

  return {
    evaluaciones, cargando, error,
    cargar, porAlumno, ultimaVersion, fichaDeAlumno,
    registrarVersion, actualizarFicha
  }
})
