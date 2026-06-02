<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'

const router = useRouter()
const { iniciarSesion, cargando, error, estaAutenticado, esDocente } = useAuth()

const username = ref('')
const contrasena = ref('')
const mostrarPassword = ref(false)
const loginError = ref('')
const seccionActiva = ref('hero')

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
  } catch (err) {
    loginError.value = 'Usuario o contraseña incorrectos'
  }
}

function scrollToLogin() {
  document.getElementById('login-section')?.scrollIntoView({ behavior: 'smooth' })
}

onMounted(() => {
  // Animate elements on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
      }
    })
  }, { threshold: 0.1 })

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
})
</script>

<template>
  <div class="landing">
    <!-- ═══ NAVBAR ═══ -->
    <nav class="navbar">
      <div class="navbar-inner container">
        <div class="navbar-brand">
          <div class="brand-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          </div>
          <span class="brand-text">Semilleros <span class="accent">UTN</span></span>
        </div>
        <div class="navbar-links hide-mobile">
          <a href="#about">Acerca de</a>
          <a href="#features">Características</a>
          <a href="#login-section">Iniciar Sesión</a>
        </div>
        <button class="btn btn-primary btn-sm hide-mobile" @click="scrollToLogin">
          Acceder
        </button>
      </div>
    </nav>

    <!-- ═══ HERO ═══ -->
    <section class="hero" id="hero">
      <div class="hero-bg">
        <div class="hero-orb hero-orb-1"></div>
        <div class="hero-orb hero-orb-2"></div>
        <div class="hero-orb hero-orb-3"></div>
        <div class="hero-grid"></div>
      </div>

      <div class="hero-content container">
        <div class="hero-text">
          <div class="hero-badge">
            <span class="pulse-dot"></span>
            Universidad Técnica del Norte
          </div>
          <h1>
            Aula Virtual<br>
            <span class="gradient-text">Semilleros UTN</span>
          </h1>
          <p class="hero-subtitle">
            Plataforma educativa innovadora para el seguimiento y evaluación del desarrollo infantil.
            Conectamos docentes y familias en el proceso de aprendizaje.
          </p>
          <div class="hero-actions">
            <button class="btn btn-primary btn-lg" @click="scrollToLogin">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
              Iniciar Sesión
            </button>
            <a href="#about" class="btn btn-ghost btn-lg">
              Conocer más
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
            </a>
          </div>

          <div class="hero-stats">
            <div class="stat">
              <span class="stat-value">3</span>
              <span class="stat-label">Niveles de Logro</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat">
              <span class="stat-value">2</span>
              <span class="stat-label">Roles de Usuario</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat">
              <span class="stat-value">∞</span>
              <span class="stat-label">Potencial Educativo</span>
            </div>
          </div>
        </div>

        <div class="hero-visual">
          <div class="hero-card-stack">
            <div class="floating-card fc-1">
              <div class="fc-icon fc-icon-blue">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <div>
                <div class="fc-title">Gestión de Grupos</div>
                <div class="fc-desc">Organiza tus alumnos</div>
              </div>
            </div>
            <div class="floating-card fc-2">
              <div class="fc-icon fc-icon-gold">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
              </div>
              <div>
                <div class="fc-title">Evaluación por Niveles</div>
                <div class="fc-desc">Iniciado · En Proceso · Logrado</div>
              </div>
            </div>
            <div class="floating-card fc-3">
              <div class="fc-icon fc-icon-green">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </div>
              <div>
                <div class="fc-title">Seguimiento Familiar</div>
                <div class="fc-desc">Padres conectados</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ ABOUT ═══ -->
    <section class="about" id="about">
      <div class="container">
        <div class="section-header reveal">
          <span class="section-tag">Acerca del Proyecto</span>
          <h2>¿Qué son los <span class="gradient-text">Semilleros UTN</span>?</h2>
          <p class="section-desc">
            Un proyecto educativo de la Universidad Técnica del Norte enfocado en el desarrollo cognitivo
            infantil, basado en la teoría constructivista de Piaget y metodologías activas de aprendizaje.
          </p>
        </div>

        <div class="about-grid">
          <div class="about-card reveal">
            <div class="about-card-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            </div>
            <h3>Enfoque Constructivista</h3>
            <p>Basado en las teorías de Piaget, promovemos que el niño construya su propio conocimiento a través de experiencias significativas.</p>
          </div>
          <div class="about-card reveal">
            <div class="about-card-icon icon-gold">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
            <h3>Evaluación Formativa</h3>
            <p>Sistema de evaluación por niveles (Iniciado, En Proceso, Logrado) que permite un seguimiento detallado del progreso de cada niño.</p>
          </div>
          <div class="about-card reveal">
            <div class="about-card-icon icon-green">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <h3>Vínculo Familia-Escuela</h3>
            <p>Los padres pueden seguir el progreso de sus hijos y participar activamente con actividades para el hogar.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ FEATURES ═══ -->
    <section class="features" id="features">
      <div class="container">
        <div class="section-header reveal">
          <span class="section-tag">Características</span>
          <h2>Todo lo que necesitas para <span class="gradient-text">enseñar mejor</span></h2>
        </div>

        <div class="features-grid">
          <div class="feature-card reveal">
            <div class="feature-number">01</div>
            <h3>Gestión de Grupos</h3>
            <p>Crea y administra grupos de estudiantes con información de contacto y representantes.</p>
          </div>
          <div class="feature-card reveal">
            <div class="feature-number">02</div>
            <h3>Unidades Didácticas</h3>
            <p>Planifica actividades de clase y para la casa con criterios de evaluación específicos.</p>
          </div>
          <div class="feature-card reveal">
            <div class="feature-number">03</div>
            <h3>Fichas de Monitoreo</h3>
            <p>Registra clasificación, seriación, asimilación y acciones de apoyo individualizadas.</p>
          </div>
          <div class="feature-card reveal">
            <div class="feature-number">04</div>
            <h3>Autoevaluación Docente</h3>
            <p>Reflexiona sobre tu práctica con preguntas basadas en principios constructivistas.</p>
          </div>
          <div class="feature-card reveal">
            <div class="feature-number">05</div>
            <h3>Reportes Grupales</h3>
            <p>Visualiza el progreso del grupo con estadísticas de niveles de logro.</p>
          </div>
          <div class="feature-card reveal">
            <div class="feature-number">06</div>
            <h3>Acceso Multiplataforma</h3>
            <p>Disponible en web y como aplicación instalable para dispositivos Android.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ LOGIN ═══ -->
    <section class="login-section" id="login-section">
      <div class="container">
        <div class="login-wrapper">
          <div class="login-info reveal">
            <span class="section-tag">Acceso al Sistema</span>
            <h2>Inicia sesión en tu <span class="gradient-text">portal educativo</span></h2>
            <p>Ingresa con tus credenciales de docente o padre de familia para acceder a las funcionalidades del sistema.</p>
            
            <div class="login-roles">
              <div class="role-item">
                <div class="role-icon role-icon-doc">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <div>
                  <strong>Docente</strong>
                  <span>Gestión de grupos, evaluaciones y actividades</span>
                </div>
              </div>
              <div class="role-item">
                <div class="role-icon role-icon-parent">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                </div>
                <div>
                  <strong>Padre de Familia</strong>
                  <span>Seguimiento del progreso de sus hijos</span>
                </div>
              </div>
            </div>
          </div>

          <div class="login-form-card reveal">
            <div class="login-form-header">
              <div class="login-avatar">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <h3>Bienvenido de vuelta</h3>
              <p>Ingresa tus credenciales para continuar</p>
            </div>

            <form @submit.prevent="handleLogin" class="login-form">
              <div class="form-group">
                <label class="form-label" for="login-username">Usuario</label>
                <div class="input-with-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <input
                    id="login-username"
                    v-model="username"
                    type="text"
                    class="form-input"
                    placeholder="ej: gladys.doc"
                    autocomplete="username"
                  />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="login-password">Contraseña</label>
                <div class="input-with-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <input
                    id="login-password"
                    v-model="contrasena"
                    :type="mostrarPassword ? 'text' : 'password'"
                    class="form-input"
                    placeholder="Tu contraseña"
                    autocomplete="current-password"
                  />
                  <button
                    type="button"
                    class="toggle-password"
                    @click="mostrarPassword = !mostrarPassword"
                    tabindex="-1"
                  >
                    <svg v-if="!mostrarPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  </button>
                </div>
              </div>

              <div v-if="loginError" class="form-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                {{ loginError }}
              </div>

              <button
                type="submit"
                class="btn btn-primary btn-lg w-full"
                :disabled="cargando"
              >
                <span v-if="cargando" class="spinner"></span>
                <span v-else>Iniciar Sesión</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ FOOTER ═══ -->
    <footer class="footer">
      <div class="container">
        <div class="footer-inner">
          <div class="footer-brand">
            <div class="brand-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            </div>
            <span>Semilleros UTN</span>
          </div>
          <p class="footer-text">
            © 2026 Universidad Técnica del Norte. Proyecto de vinculación con la comunidad.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* ═══ NAVBAR ═══ */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-color);
}

.navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--text-primary);
}

.brand-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-primary);
  border-radius: var(--radius-md);
  color: #fff;
}

.brand-text .accent {
  color: var(--accent-400);
}

.navbar-links {
  display: flex;
  gap: 28px;
}

.navbar-links a {
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
  transition: color var(--transition-fast);
}
.navbar-links a:hover {
  color: var(--text-primary);
}

/* ═══ HERO ═══ */
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 100px 0 60px;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.hero-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
}

.hero-orb-1 {
  width: 500px;
  height: 500px;
  background: var(--primary-200);
  top: -10%;
  right: -5%;
  animation: float 8s ease-in-out infinite;
}

.hero-orb-2 {
  width: 350px;
  height: 350px;
  background: var(--accent-200);
  bottom: 10%;
  left: -5%;
  animation: float 10s ease-in-out infinite reverse;
}

.hero-orb-3 {
  width: 250px;
  height: 250px;
  background: var(--primary-100);
  top: 40%;
  left: 30%;
  opacity: 0.3;
  animation: float 12s ease-in-out infinite;
}

.hero-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(139,92,246,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(139,92,246,0.03) 1px, transparent 1px);
  background-size: 60px 60px;
}

.hero-content {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-full);
  font-size: 0.82rem;
  color: var(--text-secondary);
  margin-bottom: 24px;
  animation: slideUp 0.6s ease-out;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background: var(--success-400);
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

.hero-text h1 {
  margin-bottom: 20px;
  animation: slideUp 0.6s ease-out 0.1s both;
}

.gradient-text {
  background: linear-gradient(135deg, var(--primary-600), var(--accent-500));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.1rem;
  line-height: 1.7;
  max-width: 520px;
  margin-bottom: 32px;
  animation: slideUp 0.6s ease-out 0.2s both;
}

.hero-actions {
  display: flex;
  gap: 16px;
  margin-bottom: 48px;
  animation: slideUp 0.6s ease-out 0.3s both;
}

.hero-stats {
  display: flex;
  align-items: center;
  gap: 24px;
  animation: slideUp 0.6s ease-out 0.4s both;
}

.stat {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.03em;
}

.stat-label {
  font-size: 0.78rem;
  color: var(--text-muted);
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: var(--border-color);
}

/* ═══ FLOATING CARDS (HERO VISUAL) ═══ */
.hero-visual {
  display: flex;
  justify-content: center;
  align-items: center;
  animation: fadeIn 0.8s ease-out 0.5s both;
}

.hero-card-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 380px;
}

.floating-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 22px;
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-base);
}

.floating-card:hover {
  transform: translateX(8px);
  border-color: var(--border-color-hover);
  box-shadow: var(--shadow-lg);
}

.fc-1 { animation: slideInRight 0.6s ease-out 0.6s both; }
.fc-2 { animation: slideInRight 0.6s ease-out 0.8s both; }
.fc-3 { animation: slideInRight 0.6s ease-out 1s both; }

.fc-icon {
  width: 46px;
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.fc-icon-blue {
  background: rgba(139,92,246,0.1);
  color: var(--primary-600);
}

.fc-icon-gold {
  background: rgba(56,189,248,0.1);
  color: var(--accent-600);
}

.fc-icon-green {
  background: rgba(34,197,94,0.1);
  color: var(--success-600);
}

.fc-title {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text-primary);
}

.fc-desc {
  font-size: 0.82rem;
  color: var(--text-muted);
  margin-top: 2px;
}

/* ═══ SECTIONS ═══ */
.section-header {
  text-align: center;
  max-width: 600px;
  margin: 0 auto 60px;
}

.section-tag {
  display: inline-block;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--primary-400);
  margin-bottom: 12px;
}

.section-desc {
  margin-top: 16px;
  font-size: 1.05rem;
}

/* ═══ ABOUT ═══ */
.about {
  padding: 100px 0;
  position: relative;
}

.about-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.about-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: 32px;
  transition: all var(--transition-base);
  box-shadow: var(--shadow-sm);
}

.about-card:hover {
  transform: translateY(-6px);
  border-color: var(--primary-300);
  box-shadow: var(--shadow-lg), var(--shadow-glow);
}

.about-card-icon {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(139,92,246,0.08);
  color: var(--primary-600);
  border-radius: var(--radius-md);
  margin-bottom: 20px;
}

.about-card-icon.icon-gold {
  background: rgba(56,189,248,0.08);
  color: var(--accent-600);
}

.about-card-icon.icon-green {
  background: rgba(34,197,94,0.08);
  color: var(--success-600);
}

.about-card h3 {
  font-size: 1.15rem;
  margin-bottom: 12px;
}

.about-card p {
  font-size: 0.92rem;
}

/* ═══ FEATURES ═══ */
.features {
  padding: 100px 0;
  background: linear-gradient(180deg, transparent, rgba(139,92,246,0.03), transparent);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.feature-card {
  padding: 28px;
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
}

.feature-card:hover {
  border-color: var(--primary-300);
  background: var(--bg-glass-hover);
  transform: translateY(-4px);
}

.feature-number {
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--primary-600), var(--accent-500));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 12px;
  line-height: 1;
}

.feature-card h3 {
  font-size: 1.05rem;
  margin-bottom: 10px;
}

.feature-card p {
  font-size: 0.88rem;
}

/* ═══ LOGIN SECTION ═══ */
.login-section {
  padding: 100px 0;
  position: relative;
}

.login-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}

.login-info h2 {
  margin-bottom: 16px;
}

.login-info > p {
  margin-bottom: 36px;
}

.login-roles {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.role-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.role-item:hover {
  border-color: var(--border-color-hover);
}

.role-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.role-icon-doc {
  background: rgba(139,92,246,0.1);
  color: var(--primary-600);
}

.role-icon-parent {
  background: rgba(56,189,248,0.1);
  color: var(--accent-600);
}

.role-item strong {
  display: block;
  font-size: 0.95rem;
  color: var(--text-primary);
}

.role-item span {
  font-size: 0.82rem;
  color: var(--text-muted);
}

/* ═══ LOGIN FORM ═══ */
.login-form-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: 40px;
  box-shadow: var(--shadow-lg);
  box-shadow: 0 20px 60px rgba(139,92,246,0.08), var(--shadow-sm);
}

.login-form-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-avatar {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-primary);
  border-radius: var(--radius-lg);
  color: #fff;
  margin: 0 auto 16px;
}

.login-form-header h3 {
  font-size: 1.3rem;
  margin-bottom: 6px;
}

.login-form-header p {
  font-size: 0.88rem;
  color: var(--text-muted);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-with-icon > svg {
  position: absolute;
  left: 14px;
  color: var(--text-muted);
  pointer-events: none;
  z-index: 1;
}

.input-with-icon .form-input {
  padding-left: 44px;
  padding-right: 44px;
}

.toggle-password {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: color var(--transition-fast);
}
.toggle-password:hover {
  color: var(--text-primary);
}

/* ═══ FOOTER ═══ */
.footer {
  padding: 32px 0;
  border-top: 1px solid var(--border-color);
}

.footer-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  font-size: 0.95rem;
}

.footer-brand .brand-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
}

.footer-brand .brand-icon svg {
  width: 18px;
  height: 18px;
}

.footer-text {
  font-size: 0.82rem;
  color: var(--text-muted);
}

/* ═══ REVEAL ANIMATION ═══ */
.reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1);
}

.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}

/* ═══ RESPONSIVE ═══ */
@media (max-width: 1024px) {
  .hero-content {
    grid-template-columns: 1fr;
    gap: 48px;
    text-align: center;
  }

  .hero-subtitle {
    margin-left: auto;
    margin-right: auto;
  }

  .hero-actions {
    justify-content: center;
    flex-wrap: wrap;
  }

  .hero-stats {
    justify-content: center;
  }

  .hero-visual {
    order: -1;
  }

  .hero-card-stack {
    max-width: 340px;
    margin: 0 auto;
  }

  .about-grid {
    grid-template-columns: 1fr;
    max-width: 480px;
    margin: 0 auto;
  }

  .features-grid {
    grid-template-columns: 1fr 1fr;
  }

  .login-wrapper {
    grid-template-columns: 1fr;
    gap: 40px;
    max-width: 500px;
    margin: 0 auto;
  }

  .login-info {
    text-align: center;
  }
}

@media (max-width: 640px) {
  .hero {
    padding: 80px 0 40px;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .hero-stats {
    flex-direction: column;
    gap: 16px;
  }

  .stat-divider {
    width: 40px;
    height: 1px;
  }

  .footer-inner {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }

  .login-form-card {
    padding: 28px 20px;
  }
}
</style>
