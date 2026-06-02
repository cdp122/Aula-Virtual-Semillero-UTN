<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'

const router = useRouter()
const { estaAutenticado, esDocente } = useAuth()

onMounted(() => {
  if (estaAutenticado.value) {
    router.push(esDocente.value ? '/docente' : '/familia')
    return
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
  }, { threshold: 0.1 })
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
})
</script>

<template>
  <div class="landing">
    <!-- ═══ NAVBAR ═══ -->
    <nav class="navbar" role="navigation" aria-label="Navegación principal">
      <div class="navbar-inner container">
        <div class="navbar-brand">
          <div class="brand-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          </div>
          <span>Semilleros <strong>UTN</strong></span>
        </div>
        <div class="navbar-links">
          <a href="#sobre">Sobre el proyecto</a>
          <a href="#funciones">Funcionalidades</a>
        </div>
        <router-link to="/login" class="btn-nav-login" id="nav-login-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
          Iniciar Sesión
        </router-link>
      </div>
    </nav>

    <!-- ═══ HERO ═══ -->
    <section class="hero" id="hero" aria-label="Presentación principal">
      <div class="hero-bg" aria-hidden="true">
        <div class="hero-orb orb-a"></div>
        <div class="hero-orb orb-b"></div>
        <div class="hero-grid"></div>
      </div>

      <div class="hero-inner container">
        <div class="hero-text">
          <div class="hero-tag" aria-label="Universidad">
            <span class="tag-dot" aria-hidden="true"></span>
            Universidad Técnica del Norte
          </div>
          <h1>
            Aula Virtual<br>
            <span class="gradient-text">Semilleros UTN</span>
          </h1>
          <p class="hero-desc">
            Plataforma educativa innovadora para el seguimiento y evaluación
            del desarrollo infantil. Conectamos docentes y familias en el
            proceso de aprendizaje.
          </p>
          <div class="hero-cta">
            <router-link to="/login" class="btn-hero-primary" id="hero-cta-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
              Acceder al sistema
            </router-link>
            <a href="#sobre" class="btn-hero-ghost">
              Conocer más
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
            </a>
          </div>

          <div class="hero-stats" aria-label="Estadísticas del sistema">
            <div class="hstat">
              <span class="hstat-val">3</span>
              <span class="hstat-lbl">Niveles de Logro</span>
            </div>
            <div class="hstat-div" aria-hidden="true"></div>
            <div class="hstat">
              <span class="hstat-val">2</span>
              <span class="hstat-lbl">Roles de Usuario</span>
            </div>
            <div class="hstat-div" aria-hidden="true"></div>
            <div class="hstat">
              <span class="hstat-val">100%</span>
              <span class="hstat-lbl">Digital y Accesible</span>
            </div>
          </div>
        </div>

        <div class="hero-cards" aria-hidden="true">
          <div class="hcard hcard-1">
            <div class="hcard-icon hci-purple">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            </div>
            <div>
              <div class="hcard-title">Gestión de Grupos</div>
              <div class="hcard-sub">Organiza a tus estudiantes</div>
            </div>
          </div>
          <div class="hcard hcard-2">
            <div class="hcard-icon hci-blue">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            </div>
            <div>
              <div class="hcard-title">Evaluación por Niveles</div>
              <div class="hcard-sub">Iniciado · En Proceso · Logrado</div>
            </div>
          </div>
          <div class="hcard hcard-3">
            <div class="hcard-icon hci-green">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <div>
              <div class="hcard-title">Seguimiento Familiar</div>
              <div class="hcard-sub">Padres conectados al progreso</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ SOBRE ═══ -->
    <section class="section-sobre" id="sobre" aria-labelledby="sobre-titulo">
      <div class="container">
        <div class="section-head reveal">
          <span class="section-eyebrow">Acerca del Proyecto</span>
          <h2 id="sobre-titulo">¿Qué son los <span class="gradient-text">Semilleros UTN</span>?</h2>
          <p>Proyecto educativo de la UTN enfocado en el desarrollo cognitivo infantil, basado en la teoría constructivista de Piaget y metodologías activas de aprendizaje.</p>
        </div>
        <div class="cards-3col">
          <article class="info-card reveal">
            <div class="info-card-icon ici-purple">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            </div>
            <h3>Enfoque Constructivista</h3>
            <p>El niño construye su propio conocimiento a través de experiencias significativas guiadas por el docente.</p>
          </article>
          <article class="info-card reveal">
            <div class="info-card-icon ici-gold">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
            <h3>Evaluación Formativa</h3>
            <p>Sistema de niveles (Iniciado, En Proceso, Logrado) para un seguimiento detallado del progreso individual.</p>
          </article>
          <article class="info-card reveal">
            <div class="info-card-icon ici-green">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <h3>Vínculo Familia–Escuela</h3>
            <p>Los padres siguen el progreso de sus hijos y participan activamente con actividades para el hogar.</p>
          </article>
        </div>
      </div>
    </section>

    <!-- ═══ FUNCIONES ═══ -->
    <section class="section-func" id="funciones" aria-labelledby="func-titulo">
      <div class="container">
        <div class="section-head reveal">
          <span class="section-eyebrow">Funcionalidades</span>
          <h2 id="func-titulo">Todo lo que necesitas para <span class="gradient-text">enseñar mejor</span></h2>
        </div>
        <div class="features-grid">
          <div v-for="(f, i) in features" :key="i" class="feat-card reveal">
            <div class="feat-num">{{ String(i + 1).padStart(2, '0') }}</div>
            <h3>{{ f.title }}</h3>
            <p>{{ f.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ CTA FINAL ═══ -->
    <section class="section-cta" aria-label="Llamada a la acción">
      <div class="container">
        <div class="cta-box reveal">
          <div class="cta-text">
            <h2>¿Listo para comenzar?</h2>
            <p>Accede con tus credenciales de docente o padre de familia.</p>
          </div>
          <router-link to="/login" class="btn-hero-primary btn-cta" id="cta-final-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
            Ir al Login
          </router-link>
        </div>
      </div>
    </section>

    <!-- ═══ FOOTER ═══ -->
    <footer class="footer" role="contentinfo">
      <div class="container">
        <div class="footer-inner">
          <div class="footer-brand">
            <div class="brand-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            </div>
            <span>Semilleros UTN</span>
          </div>
          <p>© 2026 Universidad Técnica del Norte · Proyecto de vinculación con la comunidad</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  data() {
    return {
      features: [
        { title: 'Gestión de Grupos', desc: 'Crea y administra grupos de estudiantes con información de contacto y representantes.' },
        { title: 'Unidades Didácticas', desc: 'Planifica actividades de clase y para casa con criterios de evaluación específicos.' },
        { title: 'Fichas de Monitoreo', desc: 'Registra clasificación, seriación, asimilación y acciones de apoyo individualizadas.' },
        { title: 'Autoevaluación Docente', desc: 'Reflexiona sobre tu práctica con preguntas basadas en principios constructivistas.' },
        { title: 'Reportes Grupales', desc: 'Visualiza el progreso del grupo con estadísticas de niveles de logro.' },
        { title: 'Acceso Multiplataforma', desc: 'Disponible en web y como aplicación instalable para dispositivos Android.' },
      ]
    }
  }
}
</script>

<style scoped>
/* ═══ NAVBAR ═══ */
.navbar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  background: rgba(255,255,255,0.88);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-color);
}
.navbar-inner {
  display: flex; align-items: center; justify-content: space-between;
  height: 64px; gap: 16px;
}
.navbar-brand {
  display: flex; align-items: center; gap: 10px;
  font-size: 1rem; color: var(--text-primary); font-weight: 600;
}
.navbar-brand strong { color: var(--primary-600); }
.brand-icon {
  width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
  background: var(--gradient-primary); border-radius: 10px; color: #fff; flex-shrink: 0;
}
.navbar-links { display: flex; gap: 28px; }
.navbar-links a {
  color: var(--text-secondary); font-size: 0.88rem; font-weight: 500;
  text-decoration: none; transition: color var(--transition-fast);
}
.navbar-links a:hover { color: var(--primary-600); }
.btn-nav-login {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 8px 20px; background: var(--gradient-primary); color: #fff;
  border-radius: var(--radius-md); font-size: 0.85rem; font-weight: 600;
  text-decoration: none; transition: all var(--transition-base);
  box-shadow: 0 2px 12px rgba(109,40,217,0.3);
}
.btn-nav-login:hover { transform: translateY(-1px); box-shadow: 0 4px 20px rgba(109,40,217,0.4); }

/* ═══ HERO ═══ */
.hero {
  position: relative; min-height: 100vh; display: flex; align-items: center;
  padding: 100px 0 70px; overflow: hidden;
}
.hero-bg { position: absolute; inset: 0; pointer-events: none; }
.hero-orb {
  position: absolute; border-radius: 50%; filter: blur(90px); opacity: 0.35;
}
.orb-a { width: 550px; height: 550px; background: var(--primary-200); top: -15%; right: -8%; animation: float 9s ease-in-out infinite; }
.orb-b { width: 380px; height: 380px; background: var(--accent-200); bottom: 5%; left: -8%; animation: float 11s ease-in-out infinite reverse; }
.hero-grid {
  position: absolute; inset: 0;
  background-image: linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px);
  background-size: 56px 56px;
}
.hero-inner {
  position: relative; z-index: 1;
  display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center;
}
.hero-tag {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 6px 16px; background: rgba(139,92,246,0.06);
  border: 1px solid rgba(139,92,246,0.15); border-radius: var(--radius-full);
  font-size: 0.8rem; color: var(--primary-600); font-weight: 500; margin-bottom: 22px;
  animation: slideUp 0.5s ease-out;
}
.tag-dot {
  width: 7px; height: 7px; background: var(--success-500);
  border-radius: 50%; animation: pulse 2s ease-in-out infinite;
}
.hero-text h1 {
  font-size: clamp(2.2rem, 4.5vw, 3.6rem); margin-bottom: 22px;
  animation: slideUp 0.55s ease-out 0.1s both;
}
.gradient-text {
  background: linear-gradient(135deg, var(--primary-600), var(--accent-500));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.hero-desc {
  font-size: 1.05rem; line-height: 1.75; max-width: 500px;
  margin-bottom: 36px; animation: slideUp 0.55s ease-out 0.2s both;
}
.hero-cta { display: flex; gap: 14px; margin-bottom: 48px; animation: slideUp 0.55s ease-out 0.3s both; flex-wrap: wrap; }

.btn-hero-primary {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 13px 28px; background: linear-gradient(135deg, var(--primary-700), var(--primary-500));
  color: #fff; border-radius: var(--radius-md); font-size: 0.95rem; font-weight: 700;
  text-decoration: none; transition: all var(--transition-base);
  box-shadow: 0 4px 20px rgba(109,40,217,0.35);
}
.btn-hero-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(109,40,217,0.45); color: #fff; }

.btn-hero-ghost {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 13px 24px; background: transparent; color: var(--text-secondary);
  border: 1.5px solid var(--border-color); border-radius: var(--radius-md);
  font-size: 0.95rem; font-weight: 600; text-decoration: none; transition: all var(--transition-base);
}
.btn-hero-ghost:hover { border-color: var(--primary-400); color: var(--primary-600); }

.hero-stats { display: flex; align-items: center; gap: 28px; animation: slideUp 0.55s ease-out 0.4s both; }
.hstat { display: flex; flex-direction: column; }
.hstat-val { font-size: 1.75rem; font-weight: 800; color: var(--text-primary); letter-spacing: -0.03em; line-height: 1; }
.hstat-lbl { font-size: 0.75rem; color: var(--text-muted); margin-top: 3px; }
.hstat-div { width: 1px; height: 38px; background: var(--border-color); }

/* Hero cards */
.hero-cards { display: flex; flex-direction: column; gap: 16px; animation: fadeIn 0.7s ease-out 0.5s both; }
.hcard {
  display: flex; align-items: center; gap: 14px; padding: 18px 22px;
  background: #fff; border: 1px solid var(--border-color); border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md); transition: all var(--transition-base);
}
.hcard:hover { transform: translateX(8px); box-shadow: var(--shadow-lg); }
.hcard-1 { animation: slideInRight 0.5s ease-out 0.6s both; }
.hcard-2 { animation: slideInRight 0.5s ease-out 0.75s both; }
.hcard-3 { animation: slideInRight 0.5s ease-out 0.9s both; }
.hcard-icon { width: 46px; height: 46px; display: flex; align-items: center; justify-content: center; border-radius: var(--radius-md); flex-shrink: 0; }
.hci-purple { background: rgba(139,92,246,0.1); color: var(--primary-600); }
.hci-blue { background: rgba(14,165,233,0.1); color: var(--accent-600); }
.hci-green { background: rgba(34,197,94,0.1); color: var(--success-600); }
.hcard-title { font-size: 0.92rem; font-weight: 600; color: var(--text-primary); }
.hcard-sub { font-size: 0.78rem; color: var(--text-muted); margin-top: 2px; }

/* ═══ SECCIONES ═══ */
.section-sobre, .section-func { padding: 96px 0; }
.section-sobre { background: #fff; }
.section-func { background: linear-gradient(180deg, transparent, rgba(139,92,246,0.025), transparent); }

.section-head { text-align: center; max-width: 620px; margin: 0 auto 56px; }
.section-eyebrow {
  display: inline-block; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.1em; color: var(--primary-500); margin-bottom: 12px;
}
.section-head h2 { font-size: clamp(1.6rem, 3vw, 2.2rem); margin-bottom: 16px; }
.section-head p { font-size: 1rem; }

.cards-3col { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.info-card {
  padding: 32px; background: var(--bg-card); border: 1px solid var(--border-color);
  border-radius: var(--radius-xl); transition: all var(--transition-base); box-shadow: var(--shadow-sm);
}
.info-card:hover { transform: translateY(-6px); box-shadow: var(--shadow-lg), 0 0 30px rgba(139,92,246,0.08); border-color: var(--primary-200); }
.info-card-icon { width: 52px; height: 52px; display: flex; align-items: center; justify-content: center; border-radius: var(--radius-md); margin-bottom: 20px; }
.ici-purple { background: rgba(139,92,246,0.08); color: var(--primary-600); }
.ici-gold { background: rgba(14,165,233,0.08); color: var(--accent-600); }
.ici-green { background: rgba(34,197,94,0.08); color: var(--success-600); }
.info-card h3 { font-size: 1.1rem; margin-bottom: 12px; }
.info-card p { font-size: 0.88rem; }

.features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.feat-card {
  padding: 28px; background: rgba(139,92,246,0.03); border: 1px solid var(--border-color);
  border-radius: var(--radius-lg); transition: all var(--transition-base);
}
.feat-card:hover { border-color: var(--primary-300); background: rgba(139,92,246,0.06); transform: translateY(-4px); }
.feat-num { font-size: 1.9rem; font-weight: 800; background: linear-gradient(135deg, var(--primary-600), var(--accent-500)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 12px; line-height: 1; }
.feat-card h3 { font-size: 1rem; margin-bottom: 8px; }
.feat-card p { font-size: 0.85rem; }

/* ═══ CTA FINAL ═══ */
.section-cta { padding: 80px 0; }
.cta-box {
  display: flex; align-items: center; justify-content: space-between; gap: 32px;
  padding: 48px 56px; background: linear-gradient(135deg, var(--primary-900), var(--primary-700));
  border-radius: var(--radius-xl); flex-wrap: wrap;
}
.cta-text h2 { font-size: 1.8rem; color: #fff; margin-bottom: 8px; }
.cta-text p { font-size: 0.95rem; color: rgba(255,255,255,0.7); }
.btn-cta { background: #fff; color: var(--primary-700); box-shadow: none; }
.btn-cta:hover { background: rgba(255,255,255,0.92); color: var(--primary-800); transform: translateY(-2px); }

/* ═══ FOOTER ═══ */
.footer { padding: 28px 0; border-top: 1px solid var(--border-color); background: #fff; }
.footer-inner { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.footer-brand { display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 0.9rem; color: var(--text-primary); }
.footer p { font-size: 0.8rem; color: var(--text-muted); }

/* ═══ REVEAL ═══ */
.reveal { opacity: 0; transform: translateY(20px); transition: opacity 0.55s ease, transform 0.55s ease; }
.reveal.visible { opacity: 1; transform: translateY(0); }

/* ═══ RESPONSIVE ═══ */
@media (max-width: 900px) {
  .hero-inner { grid-template-columns: 1fr; gap: 40px; }
  .hero-cards { display: none; }
  .cards-3col, .features-grid { grid-template-columns: 1fr; }
  .navbar-links { display: none; }
}
@media (max-width: 640px) {
  .cta-box { flex-direction: column; text-align: center; padding: 36px 28px; }
  .footer-inner { flex-direction: column; text-align: center; }
}

@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideInRight { from { opacity: 0; transform: translateX(24px); } to { opacity: 1; transform: translateX(0); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>
