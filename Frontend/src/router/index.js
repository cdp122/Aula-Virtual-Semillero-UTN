import { createRouter, createWebHistory } from 'vue-router'
import UnidadDidacticaView from '../views/UnidadDidacticaView.vue'
import EvaluacionesView from '../views/EvaluacionesView.vue'
import FichaMonitoreoView from '../views/FichaMonitoreoView.vue'
import AutoevaluacionView from '../views/AutoevaluacionView.vue'
import InformesView from '../views/InformesView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/planificacion'
    },
    {
      path: '/planificacion',
      name: 'planificacion',
      component: UnidadDidacticaView
    },
    {
      path: '/evaluaciones',
      name: 'evaluaciones',
      component: EvaluacionesView
    },
    {
      path: '/fichas',
      name: 'fichas',
      component: FichaMonitoreoView
    },
    {
      path: '/autoevaluacion',
      name: 'autoevaluacion',
      component: AutoevaluacionView
    },
    {
      path: '/informes',
      name: 'informes',
      component: InformesView
    }
  ]
})

export default router
