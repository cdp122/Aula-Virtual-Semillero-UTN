import { ref, computed } from 'vue';
import apolloClient from '../graphql/client.js';
import { LOGIN_MUTATION } from '../graphql/queries.js';

const STORAGE_KEY = 'semilleros_utn_usuario';

/* ── Estado global reactivo ────────────────────── */
const usuario = ref(cargarDesdeStorage());

function cargarDesdeStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function guardarEnStorage(data) {
  if (data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

/* ── Composable ────────────────────────────────── */
export function useAuth() {
  const cargando = ref(false);
  const error = ref(null);

  const estaAutenticado = computed(() => !!usuario.value);

  const esDocente = computed(() =>
    usuario.value?.roles?.includes('rol-doc') ?? false
  );

  const esPadre = computed(() =>
    usuario.value?.roles?.includes('rol-padre') ?? false
  );

  const nombreUsuario = computed(() =>
    usuario.value?.nombre ?? ''
  );

  async function iniciarSesion(username, contrasena) {
    cargando.value = true;
    error.value = null;

    try {
      const { data } = await apolloClient.mutate({
        mutation: LOGIN_MUTATION,
        variables: { username, contrasena },
      });

      if (!data?.login) {
        throw new Error('Credenciales incorrectas');
      }

      usuario.value = data.login;
      guardarEnStorage(data.login);
      return data.login;
    } catch (err) {
      error.value = err.message || 'Error al iniciar sesión';
      throw err;
    } finally {
      cargando.value = false;
    }
  }

  function cerrarSesion() {
    usuario.value = null;
    guardarEnStorage(null);
    apolloClient.clearStore();
  }

  return {
    usuario,
    cargando,
    error,
    estaAutenticado,
    esDocente,
    esPadre,
    nombreUsuario,
    iniciarSesion,
    cerrarSesion,
  };
}
