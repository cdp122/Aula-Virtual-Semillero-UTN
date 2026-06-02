<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'

const router = useRouter()
const { iniciarSesion, cargando, estaAutenticado, esDocente } = useAuth()

const username = ref('')
const contrasena = ref('')
const mostrarPassword = ref(false)
const loginError = ref('')

async function handleLogin() {
  loginError.value = ''
  if (!username.value.trim() || !contrasena.value.trim()) {
    loginError.value = 'Por favor completa todos los campos'
    return
  }
  try {
    await iniciarSesion(username.value.trim(), contrasena.value.trim())
    if (esDocente.value) {
      router.push('/docente')
    } else {
      router.push('/familia')
    }
  } catch {
    loginError.value = 'Usuario o contraseña incorrectos'
  }
}

onMounted(() => {
  if (estaAutenticado.value) {
    if (esDocente.value) router.push('/docente')
    else router.push('/familia')
  }
})
</script>

<template>
  <div class="login-page">
    <!-- Panel izquierdo: Ilustración/Marca -->
    <div class="login-brand-panel">
      <div class="brand-panel-content">
        <div class="brand-logo">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
        </div>
        <h1 class="brand-title">Semilleros<br><span>UTN</span></h1>
        <p class="brand-subtitle">Plataforma educativa para el seguimiento y evaluación del desarrollo infantil.</p>

        <div class="brand-features">
          <div class="brand-feature">
            <div class="bf-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <span>Gestión de grupos y estudiantes</span>
          </div>
          <div class="brand-feature">
            <div class="bf-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            </div>
            <span>Evaluación por niveles de logro</span>
          </div>
          <div class="brand-feature">
            <div class="bf-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <span>Seguimiento familiar en tiempo real</span>
          </div>
        </div>

        <div class="brand-footer">
          <span>© 2026 Universidad Técnica del Norte</span>
        </div>
      </div>

      <!-- Orbs decorativos -->
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
    </div>

    <!-- Panel derecho: Formulario -->
    <div class="login-form-panel">
      <div class="form-panel-inner">
        <!-- Back to landing -->
        <router-link to="/" class="back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          Volver al inicio
        </router-link>

        <div class="form-header">
          <div class="form-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <h2>Bienvenido de vuelta</h2>
          <p>Ingresa tus credenciales para acceder al sistema</p>
        </div>

        <!-- Roles disponibles -->
        <div class="role-pills">
          <div class="role-pill role-pill-doc">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Docente
          </div>
          <div class="role-pill role-pill-parent">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Padre de Familia
          </div>
        </div>

        <form @submit.prevent="handleLogin" class="login-form" id="login-form">
          <div class="form-group">
            <label class="form-label" for="login-username">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Usuario
            </label>
            <input
              id="login-username"
              v-model="username"
              type="text"
              class="form-input"
              placeholder="ej: gladys.doc"
              autocomplete="username"
              :class="{ 'input-error': loginError }"
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="login-password">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Contraseña
            </label>
            <div class="password-wrapper">
              <input
                id="login-password"
                v-model="contrasena"
                :type="mostrarPassword ? 'text' : 'password'"
                class="form-input"
                placeholder="Tu contraseña"
                autocomplete="current-password"
                :class="{ 'input-error': loginError }"
              />
              <button
                type="button"
                class="toggle-pw"
                @click="mostrarPassword = !mostrarPassword"
                tabindex="-1"
                :aria-label="mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              >
                <svg v-if="!mostrarPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              </button>
            </div>
          </div>

          <Transition name="error-fade">
            <div v-if="loginError" class="error-alert" role="alert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {{ loginError }}
            </div>
          </Transition>

          <button
            type="submit"
            class="btn-login"
            :disabled="cargando"
            id="btn-submit-login"
          >
            <span v-if="cargando" class="btn-spinner"></span>
            <span v-else class="btn-text">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
              Iniciar Sesión
            </span>
          </button>
        </form>

        <p class="form-footer-text">
          Universidad Técnica del Norte · Proyecto Semilleros
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
}

/* ═══ PANEL IZQUIERDO ═══ */
.login-brand-panel {
  position: relative;
  background: linear-gradient(145deg, #4c1d95, #6d28d9, #7c3aed);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 48px;
}

.brand-panel-content {
  position: relative;
  z-index: 2;
  color: #fff;
  max-width: 420px;
}

.brand-logo {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 18px;
  margin-bottom: 28px;
  backdrop-filter: blur(10px);
}

.brand-title {
  font-size: clamp(2.5rem, 4vw, 3.5rem);
  font-weight: 800;
  line-height: 1.1;
  color: #fff;
  margin-bottom: 20px;
  letter-spacing: -0.03em;
}

.brand-title span {
  color: rgba(196, 181, 253, 1);
}

.brand-subtitle {
  font-size: 1.05rem;
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.7;
  margin-bottom: 44px;
}

.brand-features {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-bottom: 52px;
}

.brand-feature {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 0.92rem;
  color: rgba(255, 255, 255, 0.85);
}

.bf-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  flex-shrink: 0;
}

.brand-footer {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.45);
}

/* Orbs decorativos */
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(70px);
  pointer-events: none;
  z-index: 1;
}
.orb-1 {
  width: 350px;
  height: 350px;
  background: rgba(139, 92, 246, 0.5);
  top: -80px;
  right: -80px;
}
.orb-2 {
  width: 280px;
  height: 280px;
  background: rgba(56, 189, 248, 0.25);
  bottom: 40px;
  left: -40px;
}
.orb-3 {
  width: 180px;
  height: 180px;
  background: rgba(196, 181, 253, 0.3);
  top: 50%;
  left: 40%;
}

/* ═══ PANEL DERECHO ═══ */
.login-form-panel {
  background: #fafafa;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 40px;
}

.form-panel-inner {
  width: 100%;
  max-width: 420px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: var(--text-muted);
  text-decoration: none;
  margin-bottom: 40px;
  transition: color var(--transition-fast);
  font-weight: 500;
}
.back-link:hover {
  color: var(--primary-600);
}

.form-header {
  margin-bottom: 28px;
}

.form-icon {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-50);
  color: var(--primary-600);
  border-radius: var(--radius-md);
  margin-bottom: 20px;
}

.form-header h2 {
  font-size: 1.7rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 8px;
  letter-spacing: -0.02em;
}

.form-header p {
  font-size: 0.92rem;
  color: var(--text-secondary);
}

/* ═══ ROLE PILLS ═══ */
.role-pills {
  display: flex;
  gap: 10px;
  margin-bottom: 28px;
}

.role-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: var(--radius-full);
  font-size: 0.78rem;
  font-weight: 600;
}

.role-pill-doc {
  background: rgba(139, 92, 246, 0.08);
  color: var(--primary-600);
  border: 1px solid rgba(139, 92, 246, 0.2);
}

.role-pill-parent {
  background: rgba(14, 165, 233, 0.08);
  color: var(--accent-600);
  border: 1px solid rgba(14, 165, 233, 0.2);
}

/* ═══ FORM ═══ */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.83rem;
  font-weight: 600;
  color: var(--text-secondary);
  letter-spacing: 0.01em;
}

.form-input {
  padding: 13px 16px;
  background: #fff;
  border: 1.5px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: 0.95rem;
  transition: all var(--transition-base);
  outline: none;
  width: 100%;
}
.form-input::placeholder { color: var(--text-muted); }
.form-input:focus {
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.12);
}
.form-input.input-error {
  border-color: var(--danger-500);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.password-wrapper {
  position: relative;
}

.password-wrapper .form-input {
  padding-right: 48px;
}

.toggle-pw {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  transition: color var(--transition-fast);
}
.toggle-pw:hover { color: var(--text-primary); }

/* ═══ ERROR ═══ */
.error-alert {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(239, 68, 68, 0.06);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  color: var(--danger-600);
  font-weight: 500;
}

.error-fade-enter-active,
.error-fade-leave-active {
  transition: all 0.25s ease;
}
.error-fade-enter-from,
.error-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* ═══ SUBMIT BUTTON ═══ */
.btn-login {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, var(--primary-700), var(--primary-500));
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all var(--transition-base);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 0 4px 20px rgba(109, 40, 217, 0.35);
  margin-top: 4px;
}
.btn-login:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(109, 40, 217, 0.45);
}
.btn-login:active:not(:disabled) {
  transform: translateY(0);
}
.btn-login:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}
.btn-text {
  display: flex;
  align-items: center;
  gap: 8px;
}
.btn-spinner {
  width: 20px;
  height: 20px;
  border: 2.5px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.form-footer-text {
  text-align: center;
  font-size: 0.78rem;
  color: var(--text-muted);
  margin-top: 28px;
}

/* ═══ RESPONSIVE ═══ */
@media (max-width: 768px) {
  .login-page {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }

  .login-brand-panel {
    padding: 36px 24px;
    min-height: 220px;
  }

  .brand-title { font-size: 2rem; }
  .brand-subtitle { display: none; }
  .brand-features { display: none; }
  .brand-footer { display: none; }
  .brand-logo { margin-bottom: 16px; }

  .brand-panel-content {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .login-form-panel {
    padding: 36px 24px;
    align-items: flex-start;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
