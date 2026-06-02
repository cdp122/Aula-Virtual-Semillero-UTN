<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth.js'
import apolloClient from '../graphql/client.js'
import {
  CURSOS_POR_DOCENTE,
  OBTENER_UNIDADES_DIDACTICAS,
  OBTENER_EVALUACIONES_ESTUDIANTE
} from '../graphql/queries.js'
import html2pdf from 'html2pdf.js'

const { usuario } = useAuth()

const cursos = ref([])
const cursoIdSeleccionado = ref('')
const selectedStudent = ref(null)

const cursoSeleccionado = computed(() => {
  return cursos.value.find(c => c._id === cursoIdSeleccionado.value) || null
})

const students = computed(() => {
  return cursoSeleccionado.value?.estudiantes || []
})

watch(students, (newStudents) => {
  if (newStudents.length > 0) {
    const exists = newStudents.find(s => s.id_estudiante === selectedStudent.value?.id_estudiante)
    if (!exists) selectedStudent.value = newStudents[0]
  } else {
    selectedStudent.value = null
  }
}, { immediate: true })
const unidades = ref([])
const evaluaciones = ref([])
const cargando = ref(false)
const isGenerating = ref(false)

// Evaluaciones del alumno seleccionado (con historial inmutable)
const evaluacionesAlumno = computed(() => {
  if (!selectedStudent.value) return []
  return evaluaciones.value.filter(e => e.id_estudiante === selectedStudent.value.id_estudiante)
})

// Ficha de monitoreo del alumno
const fichaAlumno = computed(() => {
  const ev = evaluacionesAlumno.value.find(e => e.ficha_monitoreo)
  return ev?.ficha_monitoreo || null
})

function getActividadDescripcion(id_actividad) {
  for (const u of unidades.value) {
    const act = (u.actividades || []).find(a => a.id_actividad === id_actividad)
    if (act) return act.descripcion_actividad
  }
  return id_actividad
}

const CRITERIA_LABELS = {
  'crit-001': 'Clasificación',
  'crit-002': 'Seriación',
  'crit-003': 'Asimilación y Acomodación',
  'crit-004': 'Justificación (Lógica)',
  'crit-005': 'Autorregulación'
}

function getCriterioLabel(id) {
  return CRITERIA_LABELS[id] || id
}

function getNivelLabel(nivel) {
  if (!nivel) return '-'
  if (nivel === 'LOGRADO') return 'Logrado'
  if (nivel === 'EN PROCESO') return 'En Proceso'
  if (nivel === 'INICIADO') return 'Iniciado'
  return nivel
}

function getNivelClass(nivel) {
  if (nivel === 'LOGRADO') return 'logrado'
  if (nivel === 'EN PROCESO') return 'proceso'
  return 'iniciado'
}

async function cargarDatos() {
  if (!usuario.value?._id) return
  cargando.value = true
  try {
    const { data } = await apolloClient.query({
      query: CURSOS_POR_DOCENTE,
      variables: { docenteId: usuario.value._id },
      fetchPolicy: 'network-only'
    })
    cursos.value = data.cursosPorDocente || []
    if (cursos.value.length > 0) {
      cursoIdSeleccionado.value = cursos.value[0]._id
    }

    const resUnidades = await apolloClient.query({
      query: OBTENER_UNIDADES_DIDACTICAS,
      fetchPolicy: 'network-only'
    })
    unidades.value = resUnidades.data.unidadesDidacticas || []

    const resEvals = await apolloClient.query({
      query: OBTENER_EVALUACIONES_ESTUDIANTE,
      fetchPolicy: 'network-only'
    })
    evaluaciones.value = resEvals.data.evaluacionesEstudiantes || []
  } catch (e) {
    console.error(e)
  } finally {
    cargando.value = false
  }
}

async function downloadPDF(type) {
  isGenerating.value = true
  const elementId = type === 'individual' ? 'report-individual' : 'report-group'
  const element = document.getElementById(elementId)
  if (!element) { isGenerating.value = false; return }

  const opt = {
    margin: [15, 15, 15, 15],
    filename: type === 'individual'
      ? `Informe_${selectedStudent.value?.nombre?.replace(/ /g, '_') || 'alumno'}.pdf`
      : `Resumen_Grupal_${cursoSeleccionado.value?.nombre_curso || 'Curso'}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  }

  setTimeout(async () => {
    try {
      if (type === 'grupal') element.style.display = 'block'
      await html2pdf().set(opt).from(element).save()
      if (type === 'grupal') element.style.display = 'none'
    } catch (e) {
      console.error(e)
    } finally {
      isGenerating.value = false
    }
  }, 100)
}

// Estadísticas grupales
const statsGrupal = computed(() => {
  const stats = { logrado: 0, proceso: 0, iniciado: 0, total: students.value.length }
  students.value.forEach(s => {
    const evs = evaluaciones.value.filter(e => e.id_estudiante === s.id_estudiante)
    if (evs.length === 0) { stats.iniciado++; return }
    let maxNivel = 'INICIADO'
    evs.forEach(ev => {
      const ultima = ev.historial_versiones?.[ev.historial_versiones.length - 1]
      ultima?.evaluaciones_criterio?.forEach(c => {
        if (c.nivel_logro === 'LOGRADO') maxNivel = 'LOGRADO'
        else if (c.nivel_logro === 'EN PROCESO' && maxNivel !== 'LOGRADO') maxNivel = 'EN PROCESO'
      })
    })
    if (maxNivel === 'LOGRADO') stats.logrado++
    else if (maxNivel === 'EN PROCESO') stats.proceso++
    else stats.iniciado++
  })
  return stats
})

onMounted(cargarDatos)
</script>

<template>
  <div class="view-container">
    <header class="page-header">
      <div>
        <h1 class="title">Informes y Exportación</h1>
        <p class="subtitle">Genera reportes PDF con historial inmutable de evaluaciones (RF-D10).</p>
      </div>
      <div class="header-actions">
        <button class="btn-secondary" @click="downloadPDF('grupal')" :disabled="isGenerating || cargando">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Resumen Grupal PDF
        </button>
      </div>
    </header>

    <div class="filters-card" v-if="cursos.length > 0">
      <div class="filter-group">
        <label>Curso a Reportar:</label>
        <div class="select-wrapper">
          <select v-model="cursoIdSeleccionado" class="input-select premium-select">
            <option v-for="c in cursos" :key="c._id" :value="c._id">{{ c.nombre_curso }}</option>
          </select>
          <div class="select-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
          </div>
        </div>
      </div>
    </div>

    <div v-if="cargando" class="loading-msg">Cargando datos...</div>

    <div v-else class="layout-grid">
      <!-- Lista alumnos -->
      <aside class="students-list">
        <h3>Informes Individuales</h3>
        <ul>
          <li
            v-for="student in students"
            :key="student.id_estudiante"
            :class="{ active: selectedStudent?.id_estudiante === student.id_estudiante }"
            @click="selectedStudent = student"
          >
            <div class="avatar">{{ student.nombre.charAt(0) }}</div>
            <span>{{ student.nombre }}</span>
          </li>
        </ul>
      </aside>

      <!-- Preview del informe -->
      <main class="report-preview">
        <div class="preview-header">
          <h2>Previsualización</h2>
          <button class="btn-primary" @click="downloadPDF('individual')" :disabled="isGenerating || !selectedStudent">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px;vertical-align:middle"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            {{ isGenerating ? 'Generando...' : 'Descargar PDF' }}
          </button>
        </div>

        <div class="report-canvas-wrapper">
          <div id="report-individual" class="report-canvas" v-if="selectedStudent">
            <!-- Cabecera PDF -->
            <div class="report-header-pdf">
              <div class="logo-placeholder">UTN</div>
              <div class="report-titles">
                <h2>Informe de Evolución y Monitoreo</h2>
                <p>Aula Virtual Semillero — {{ cursoSeleccionado?.nombre_curso }}</p>
              </div>
            </div>

            <!-- Datos básicos -->
            <div class="report-info">
              <p><strong>Estudiante:</strong> {{ selectedStudent.nombre }}</p>
              <p><strong>Fecha de emisión:</strong> {{ new Date().toLocaleDateString('es-EC') }}</p>
              <p><strong>Docente evaluador:</strong> {{ usuario?.nombre || '-' }}</p>
            </div>

            <!-- Historial de Evaluaciones -->
            <div class="report-section">
              <h3>1. Historial de Evaluaciones (Trazabilidad Inmutable — RNF-06)</h3>
              <div v-if="evaluacionesAlumno.length === 0" class="no-data">No se han registrado evaluaciones para este alumno.</div>
              <template v-else>
                <div v-for="ev in evaluacionesAlumno" :key="ev._id" style="margin-bottom:16px">
                  <p style="font-weight:bold;color:#1e293b;font-size:0.9rem;">
                    Actividad: {{ getActividadDescripcion(ev.id_actividad) }}
                  </p>
                  <table class="pdf-table">
                    <thead>
                      <tr>
                        <th>Versión</th>
                        <th>Fecha</th>
                        <th>Criterio</th>
                        <th>Nivel</th>
                        <th>Observación</th>
                      </tr>
                    </thead>
                    <tbody>
                      <template v-for="ver in ev.historial_versiones" :key="ver.version">
                        <tr v-for="(c, idx) in ver.evaluaciones_criterio" :key="c.id_criterio">
                          <td v-if="idx === 0" :rowspan="ver.evaluaciones_criterio.length">v{{ ver.version }}<br><small>{{ new Date(parseInt(ver.fecha_registro)).toLocaleDateString('es-EC') }}</small></td>
                          <td v-if="idx === 0" :rowspan="ver.evaluaciones_criterio.length"></td>
                          <td>{{ getCriterioLabel(c.id_criterio) }}</td>
                          <td><span class="badge" :class="getNivelClass(c.nivel_logro)">{{ getNivelLabel(c.nivel_logro) }}</span></td>
                          <td>{{ c.observaciones || '-' }}</td>
                        </tr>
                      </template>
                    </tbody>
                  </table>
                </div>
              </template>
            </div>

            <!-- Ficha de Monitoreo -->
            <div class="report-section" v-if="fichaAlumno">
              <h3>2. Ficha de Monitoreo</h3>
              <ul class="pdf-list">
                <li><strong>Clasificación:</strong> {{ getNivelLabel(fichaAlumno.clasificacion) }}</li>
                <li><strong>Seriación:</strong> {{ getNivelLabel(fichaAlumno.seriacion) }}</li>
                <li><strong>Asimilación/Acomodación:</strong> {{ getNivelLabel(fichaAlumno.asimilacion_acomodacion) }}</li>
                <li><strong>Autorregulación:</strong> {{ getNivelLabel(fichaAlumno.autoregulacion) }}</li>
                <li v-if="fichaAlumno.justificacion"><strong>Justificación:</strong> {{ fichaAlumno.justificacion }}</li>
                <li v-if="fichaAlumno.observaciones"><strong>Observaciones:</strong> {{ fichaAlumno.observaciones }}</li>
                <li v-if="fichaAlumno.acciones_apoyo"><strong>Acciones de Apoyo:</strong> {{ fichaAlumno.acciones_apoyo }}</li>
              </ul>
            </div>

            <div class="report-footer">
              <div class="signature-line"></div>
              <p>Firma del Docente Evaluador</p>
            </div>
          </div>

          <div v-else class="no-data-preview">Selecciona un alumno para ver el informe.</div>
        </div>

        <!-- Informe grupal (oculto, solo para PDF) -->
        <div id="report-group" style="display:none; padding:40px; background:white; color:black; width:800px;">
          <div style="text-align:center; margin-bottom:30px; border-bottom:2px solid #e2e8f0; padding-bottom:20px;">
            <h1 style="margin:0;color:#1e293b;">Resumen Grupal de Evaluaciones</h1>
            <p style="color:#64748b;margin-top:5px;">{{ cursoSeleccionado?.nombre_curso }} — Fecha: {{ new Date().toLocaleDateString('es-EC') }}</p>
          </div>
          <h3 style="color:#334155;">Distribución de Logros (Total: {{ statsGrupal.total }} alumnos)</h3>
          <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
            <thead>
              <tr>
                <th style="border:1px solid #cbd5e1;padding:10px;background:#f1f5f9;color:#334155;">Nivel</th>
                <th style="border:1px solid #cbd5e1;padding:10px;background:#f1f5f9;color:#334155;">Cantidad</th>
                <th style="border:1px solid #cbd5e1;padding:10px;background:#f1f5f9;color:#334155;">Porcentaje</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="border:1px solid #cbd5e1;padding:10px;color:#166534;font-weight:bold;">Logrado</td>
                <td style="border:1px solid #cbd5e1;padding:10px;text-align:center;">{{ statsGrupal.logrado }}</td>
                <td style="border:1px solid #cbd5e1;padding:10px;text-align:center;">{{ statsGrupal.total > 0 ? Math.round((statsGrupal.logrado/statsGrupal.total)*100) : 0 }}%</td>
              </tr>
              <tr>
                <td style="border:1px solid #cbd5e1;padding:10px;color:#92400e;font-weight:bold;">En Proceso</td>
                <td style="border:1px solid #cbd5e1;padding:10px;text-align:center;">{{ statsGrupal.proceso }}</td>
                <td style="border:1px solid #cbd5e1;padding:10px;text-align:center;">{{ statsGrupal.total > 0 ? Math.round((statsGrupal.proceso/statsGrupal.total)*100) : 0 }}%</td>
              </tr>
              <tr>
                <td style="border:1px solid #cbd5e1;padding:10px;color:#991b1b;font-weight:bold;">Iniciado</td>
                <td style="border:1px solid #cbd5e1;padding:10px;text-align:center;">{{ statsGrupal.iniciado }}</td>
                <td style="border:1px solid #cbd5e1;padding:10px;text-align:center;">{{ statsGrupal.total > 0 ? Math.round((statsGrupal.iniciado/statsGrupal.total)*100) : 0 }}%</td>
              </tr>
            </tbody>
          </table>
          <p><em>Documento autogenerado por el Sistema de Aulas Virtuales — RNF-06: Historial inmutable.</em></p>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.view-container { display: flex; flex-direction: column; gap: 30px; height: 100%; max-width: 100%; min-width: 0; }
.page-header { display: flex; justify-content: space-between; align-items: center; }
.title { font-size: 2rem; font-weight: 700; color: var(--text-primary); margin: 0 0 8px 0; }
.subtitle { color: var(--text-secondary); margin: 0; }
.header-actions { display: flex; align-items: center; }
.loading-msg { text-align: center; padding: 40px; color: var(--text-muted); }
.btn-primary, .btn-secondary { padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; border: none; font-size: 0.95rem; display: flex; align-items: center; justify-content: center; gap: 8px; }
.btn-primary { background: linear-gradient(135deg, var(--primary-600), var(--primary-500)); color: white; box-shadow: 0 4px 15px rgba(139,92,246,0.2); }
.btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(139,92,246,0.3); }
.btn-primary:disabled, .btn-secondary:disabled { opacity: 0.7; cursor: wait; }
.btn-secondary { background: var(--bg-glass); color: var(--text-primary); border: 1px solid var(--border-color); }
.btn-secondary:hover:not(:disabled) { background: var(--bg-glass-hover); transform: translateY(-1px); }
.layout-grid { display: grid; grid-template-columns: 260px 1fr; gap: 24px; align-items: start; max-width: 100%; }
.filters-card { display: flex; flex-direction: column; gap: 20px; padding: 24px; background: linear-gradient(145deg, var(--bg-surface), var(--bg-glass)); border-radius: 16px; border: 1px solid var(--border-color); box-shadow: 0 4px 24px rgba(0,0,0,0.04); margin-bottom: 24px; }
.filter-group { display: flex; flex-direction: column; gap: 10px; }
.filter-group label { font-weight: 600; color: var(--text-secondary); font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px; }
.select-wrapper { position: relative; width: 100%; max-width: 400px; }
.premium-select { width: 100%; appearance: none; padding: 12px 40px 12px 16px; border-radius: 10px; border: 1px solid var(--border-color); background: var(--bg-glass); color: var(--text-primary); font-size: 1rem; font-weight: 500; transition: all 0.2s; cursor: pointer; }
.premium-select:focus { outline: none; border-color: var(--primary-500); box-shadow: 0 0 0 3px rgba(139,92,246,0.15); background: var(--bg-surface); }
.select-icon { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--text-secondary); }
.layout-grid { display: grid; grid-template-columns: 260px 1fr; gap: 24px; align-items: start; max-width: 100%; }
.students-list { background: var(--bg-surface); border-radius: 12px; padding: 20px; border: 1px solid var(--border-color); }
.students-list h3 { margin: 0 0 16px 0; color: var(--text-primary); font-size: 1.1rem; }
.students-list ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
.students-list li { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 8px; cursor: pointer; transition: all 0.2s; color: var(--text-secondary); font-weight: 500; }
.students-list li:hover { background-color: var(--bg-glass-hover); }
.students-list li.active { background-color: rgba(139,92,246,0.15); color: var(--text-primary); }
.avatar { width: 32px; height: 32px; border-radius: 50%; background-color: var(--bg-glass); display: flex; align-items: center; justify-content: center; font-weight: bold; color: var(--text-secondary); }
.students-list li.active .avatar { background-color: var(--primary-600); color: white; }
.students-list li.active .avatar { background-color: var(--primary-600); color: white; }
.report-preview { display: flex; flex-direction: column; gap: 20px; min-width: 0; max-width: 100%; }
.preview-header { display: flex; justify-content: space-between; align-items: center; }
.preview-header h2 { margin: 0; font-size: 1.2rem; color: var(--text-primary); }
.report-canvas-wrapper { background: var(--bg-glass); padding: 20px; border-radius: 12px; overflow-x: auto; max-width: 100%; box-sizing: border-box; }
.no-data-preview { text-align: center; padding: 40px; color: var(--text-muted); }
.report-canvas { background: white; width: 210mm; min-height: 297mm; box-shadow: 0 10px 25px rgba(0,0,0,0.1); padding: 20mm; color: #000; font-family: Arial, sans-serif; box-sizing: border-box; }
.report-header-pdf { display: flex; align-items: center; gap: 20px; border-bottom: 2px solid #1e293b; padding-bottom: 20px; margin-bottom: 20px; }
.logo-placeholder { width: 60px; height: 60px; background-color: #1e293b; color: white; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 1.2rem; border-radius: 8px; }
.report-titles h2 { margin: 0 0 5px 0; color: #1e293b; font-size: 1.4rem; }
.report-titles p { margin: 0; color: #64748b; }
.report-info { margin-bottom: 24px; }
.report-info p { margin: 5px 0; font-size: 0.95rem; }
.report-section { margin-bottom: 28px; }
.report-section h3 { font-size: 1rem; color: #1e293b; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px; margin-bottom: 14px; }
.no-data { color: #64748b; font-style: italic; font-size: 0.9rem; }
.pdf-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 0.85rem; }
.pdf-table th, .pdf-table td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
.pdf-table th { background-color: #f1f5f9; color: #334155; }
.badge { padding: 3px 7px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; }
.badge.logrado { background: #dcfce7; color: #166534; }
.badge.proceso { background: #fef3c7; color: #92400e; }
.badge.iniciado { background: #fee2e2; color: #991b1b; }
.pdf-list { padding-left: 20px; font-size: 0.92rem; }
.pdf-list li { margin-bottom: 8px; line-height: 1.4; }
.report-footer { margin-top: 60px; text-align: center; color: #334155; }
.signature-line { width: 250px; height: 1px; background-color: #334155; margin: 0 auto 10px auto; }
@media (max-width: 768px) {
  .page-header { flex-direction: column; align-items: flex-start; gap: 15px; }
  .layout-grid { grid-template-columns: 1fr; }
  .preview-header { flex-direction: column; align-items: flex-start; gap: 15px; }
  .report-canvas { transform: scale(0.7); transform-origin: top left; margin-bottom: -90mm; }
}
</style>
