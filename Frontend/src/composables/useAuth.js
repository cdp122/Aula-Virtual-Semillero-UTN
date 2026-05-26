import { ref, computed } from 'vue';
import apolloClient from '../graphql/client.js';
import axios from 'axios';

const STORAGE_KEY = 'semilleros_utn_usuario';
const TOKEN_KEY = 'semilleros_utn_token';

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

function guardarEnStorage(user, token) {
  if (user && token) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
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
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const response = await axios.post(`${baseUrl}/auth/login`, {
        username,
        contrasena
      });

      const { token, usuario: userPayload } = response.data;
      if (!token || !userPayload) {
        throw new Error('Credenciales incorrectas');
      }

      usuario.value = userPayload;
      guardarEnStorage(userPayload, token);
      return userPayload;
    } catch (err) {
      error.value = err.response?.data?.mensaje || err.message || 'Error al iniciar sesión';
      throw err;
    } finally {
      cargando.value = false;
    }
  }

  function cerrarSesion() {
    usuario.value = null;
    guardarEnStorage(null, null);
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

