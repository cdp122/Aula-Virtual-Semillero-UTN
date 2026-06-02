// stores/useCursosStore.js
// Pinia store para cursos del docente activo
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apolloClient from '../graphql/client.js'
import { CURSOS_POR_DOCENTE } from '../graphql/queries.js'

export const useCursosStore = defineStore('cursos', () => {
  const cursos = ref([])
  const cursoActivoId = ref(null)
  const cargando = ref(false)
  const error = ref(null)

  const cursoActivo = computed(() =>
    cursos.value.find(c => c._id === cursoActivoId.value) || cursos.value[0] || null
  )

  const estudiantesActivos = computed(() =>
    cursoActivo.value?.estudiantes || []
  )

  async function cargar(docenteId) {
    if (!docenteId) return
    cargando.value = true
    error.value = null
    try {
      const { data } = await apolloClient.query({
        query: CURSOS_POR_DOCENTE,
        variables: { docenteId },
        fetchPolicy: 'network-only'
      })
      cursos.value = data.cursosPorDocente || []
      if (cursos.value.length > 0 && !cursoActivoId.value) {
        cursoActivoId.value = cursos.value[0]._id
      }
    } catch (e) {
      error.value = e.message
    } finally {
      cargando.value = false
    }
  }

  function seleccionarCurso(id) {
    cursoActivoId.value = id
  }

  return { cursos, cursoActivoId, cursoActivo, estudiantesActivos, cargando, error, cargar, seleccionarCurso }
})
