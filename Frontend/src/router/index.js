import { createRouter, createWebHistory } from 'vue-router';
import { useAuth } from '../composables/useAuth.js';

import LandingPage from '../views/LandingPage.vue';
import UnidadDidacticaView from '../views/UnidadDidacticaView.vue';
import EvaluacionesView from '../views/EvaluacionesView.vue';
import FichaMonitoreoView from '../views/FichaMonitoreoView.vue';
import AutoevaluacionView from '../views/AutoevaluacionView.vue';
import InformesView from '../views/InformesView.vue';

const routes = [
  {
    path: '/',
    name: 'Landing',
    component: LandingPage,
    meta: { publica: true },
  },
  {
    path: '/docente',
    name: 'DashboardDocente',
    component: () => import('../views/DashboardDocente.vue'),
    meta: { requiereAuth: true, rol: 'rol-doc' },
    children: [
      {
        path: '',
        name: 'DocenteInicio',
        component: () => import('../views/docente/GestionGrupos.vue'),
      },
      {
        path: 'grupos',
        name: 'GestionGrupos',
        component: () => import('../views/docente/GestionGrupos.vue'),
      },
      {
        path: 'grupos/:id',
        name: 'DetalleGrupo',
        component: () => import('../views/docente/DetalleGrupo.vue'),
        props: true,
      },
      {
        path: 'planificacion',
        name: 'Planificacion',
        component: UnidadDidacticaView,
      },
      {
        path: 'evaluaciones',
        name: 'Evaluaciones',
        component: EvaluacionesView,
      },
      {
        path: 'fichas',
        name: 'FichasMonitoreo',
        component: FichaMonitoreoView,
      },
      {
        path: 'autoevaluacion',
        name: 'Autoevaluacion',
        component: AutoevaluacionView,
      },
      {
        path: 'informes',
        name: 'Informes',
        component: InformesView,
      }
    ],
  },
  {
    path: '/familia',
    name: 'DashboardFamilia',
    component: () => import('../views/DashboardFamilia.vue'),
    meta: { requiereAuth: true, rol: 'rol-padre' },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

/* ── Navigation Guards ─────────────────────────── */
router.beforeEach((to, _from, next) => {
  const { estaAutenticado, esDocente, esPadre } = useAuth();

  // Ruta pública
  if (to.meta.publica) {
    if (estaAutenticado.value) {
      if (esDocente.value) return next({ name: 'DashboardDocente' });
      if (esPadre.value) return next({ name: 'DashboardFamilia' });
    }
    return next();
  }

  // Ruta que requiere autenticación
  if (to.meta.requiereAuth) {
    if (!estaAutenticado.value) {
      return next({ name: 'Landing' });
    }

    // Verificar rol
    const rolRequerido = to.meta.rol || to.matched.find(r => r.meta.rol)?.meta.rol;
    if (rolRequerido) {
      if (rolRequerido === 'rol-doc' && !esDocente.value) {
        return next({ name: 'DashboardFamilia' });
      }
      if (rolRequerido === 'rol-padre' && !esPadre.value) {
        return next({ name: 'DashboardDocente' });
      }
    }
  }

  next();
});

export default router;
