// stores/useUnidadesStore.js
// Pinia store para unidades didácticas (RF-D02)
import { defineStore } from 'pinia'
import { ref } from 'vue'
import apolloClient from '../graphql/client.js'
import {
  OBTENER_UNIDADES_DIDACTICAS,
  CREAR_UNIDAD_DIDACTICA_CRUD,
  ACTUALIZAR_UNIDAD_DIDACTICA,
  CLONAR_UNIDAD_DIDACTICA,
  ARCHIVAR_UNIDAD_DIDACTICA
} from '../graphql/queries.js'

export const useUnidadesStore = defineStore('unidades', () => {
  const unidades = ref([])
  const cargando = ref(false)
  const error = ref(null)

  async function cargar() {
    cargando.value = true
    error.value = null
    try {
      const { data } = await apolloClient.query({
        query: OBTENER_UNIDADES_DIDACTICAS,
        fetchPolicy: 'network-only'
      })
      unidades.value = data.unidadesDidacticas || []
    } catch (e) {
      error.value = e.message
    } finally {
      cargando.value = false
    }
  }

  async function crear(input) {
    const { data } = await apolloClient.mutate({
      mutation: CREAR_UNIDAD_DIDACTICA_CRUD,
      variables: { input }
    })
    unidades.value.unshift(data.crearUnidadDidacticaCrud)
    return data.crearUnidadDidacticaCrud
  }

  async function actualizar(id, input) {
    const { data } = await apolloClient.mutate({
      mutation: ACTUALIZAR_UNIDAD_DIDACTICA,
      variables: { id, input }
    })
    const idx = unidades.value.findIndex(u => u._id === id)
    if (idx !== -1) unidades.value[idx] = data.actualizarUnidadDidactica
    return data.actualizarUnidadDidactica
  }

  async function clonar(id) {
    const { data } = await apolloClient.mutate({
      mutation: CLONAR_UNIDAD_DIDACTICA,
      variables: { id }
    })
    unidades.value.push(data.clonarUnidadDidactica)
    return data.clonarUnidadDidactica
  }

  async function archivar(id) {
    const { data } = await apolloClient.mutate({
      mutation: ARCHIVAR_UNIDAD_DIDACTICA,
      variables: { id }
    })
    const idx = unidades.value.findIndex(u => u._id === id)
    if (idx !== -1) unidades.value[idx].activo = false
    return data.archivarUnidadDidactica
  }

  const unidadesActivas = () => unidades.value.filter(u => u.activo)

  const actividadesDisponibles = () => {
    const list = []
    unidades.value.forEach(u => {
      ;(u.actividades || []).forEach(act => {
        list.push({
          id_actividad: act.id_actividad,
          descripcion: act.descripcion_actividad,
          criterios: act.criterios_evaluacion || [],
          unidadAmbito: u.ambito,
          unidadId: u._id
        })
      })
    })
    return list
  }

  return { unidades, cargando, error, cargar, crear, actualizar, clonar, archivar, unidadesActivas, actividadesDisponibles }
})
