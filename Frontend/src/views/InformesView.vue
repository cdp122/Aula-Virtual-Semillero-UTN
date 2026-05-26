<script setup>
import { ref } from 'vue'
import html2pdf from 'html2pdf.js'

const students = ref([
  { id: '1', nombre: 'Ana García' },
  { id: '2', nombre: 'Carlos López' },
  { id: '3', nombre: 'María Rodríguez' }
])

const selectedStudent = ref(students.value[0])
const isGenerating = ref(false)

const downloadPDF = async (type) => {
  isGenerating.value = true
  
  const element = type === 'individual' ? document.getElementById('report-individual') : document.getElementById('report-group')
  
  // RNF-04: html2pdf genera localmente sin colapsar el backend
  const opt = {
    margin:       [15, 15, 15, 15],
    filename:     type === 'individual' ? `Informe_${selectedStudent.value.nombre.replace(' ', '_')}.pdf` : 'Resumen_Grupal.pdf',
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  // Pequeño timeout para asegurar que el elemento está renderizado
  setTimeout(async () => {
    try {
      if (type === 'grupal') {
        element.style.display = 'block'; // Mostrar temporalmente para el canvas
      }
      
      await html2pdf().set(opt).from(element).save()
      
      if (type === 'grupal') {
        element.style.display = 'none';
      }
    } catch (error) {
      console.error('Error al generar PDF:', error)
      alert('Hubo un error al generar el PDF.')
    } finally {
      isGenerating.value = false
    }
  }, 100)
}
</script>

<template>
  <div class="view-container">
    <header class="page-header">
      <div>
        <h1 class="title">Informes y Exportación</h1>
        <p class="subtitle">Genera reportes PDF del historial inmutable de evaluaciones.</p>
      </div>
      <div class="header-actions">
        <button class="btn-secondary" @click="downloadPDF('grupal')" :disabled="isGenerating">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:8px"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Resumen Grupal
        </button>
      </div>
    </header>

    <div class="layout-grid">
      <aside class="students-list">
        <h3>Informes Individuales</h3>
        <ul>
          <li 
            v-for="student in students" 
            :key="student.id"
            :class="{ active: selectedStudent?.id === student.id }"
            @click="selectedStudent = student"
          >
            <div class="avatar">{{ student.nombre.charAt(0) }}</div>
            <span>{{ student.nombre }}</span>
          </li>
        </ul>
      </aside>

      <main class="report-preview">
        <div class="preview-header">
          <h2>Previsualización</h2>
          <button class="btn-primary" @click="downloadPDF('individual')" :disabled="isGenerating">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:8px; vertical-align:middle"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            {{ isGenerating ? 'Generando PDF...' : 'Descargar PDF' }}
          </button>
        </div>

        <div class="report-canvas-wrapper">
          <!-- A4 Canvas aspect ratio visualization -->
          <div id="report-individual" class="report-canvas">
            <div class="report-header-pdf">
              <div class="logo-placeholder">UTN</div>
              <div class="report-titles">
                <h2>Informe de Evolución y Monitoreo</h2>
                <p>Aula Virtual - Proyecto TSIE</p>
              </div>
            </div>
            
            <div class="report-info">
              <p><strong>Estudiante:</strong> {{ selectedStudent.nombre }}</p>
              <p><strong>Fecha de emisión:</strong> {{ new Date().toLocaleDateString() }}</p>
              <p><strong>Unidad Didáctica:</strong> Pensamiento Lógico Matemático</p>
            </div>

            <div class="report-section">
              <h3>1. Historial de Evaluaciones (Trazabilidad)</h3>
              <table class="pdf-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Criterio Evaluado</th>
                    <th>Nivel</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>10/05/2026</td>
                    <td>Clasifica objetos por color</td>
                    <td><span class="badge logrado">Logrado</span></td>
                  </tr>
                  <tr>
                    <td>15/05/2026</td>
                    <td>Ordena secuencias lógicas</td>
                    <td><span class="badge proceso">En Proceso</span></td>
                  </tr>
                  <tr>
                    <td>20/05/2026</td>
                    <td>Identifica patrones numéricos</td>
                    <td><span class="badge iniciado">Iniciado</span></td>
                  </tr>
                </tbody>
              </table>
              <div class="observation-box">
                <strong>Observación General del Docente:</strong>
                <p>El estudiante muestra un avance progresivo constante. Su capacidad de concentración ha mejorado drásticamente en la última semana, aunque sigue presentando retos con secuencias alfanuméricas complejas.</p>
              </div>
            </div>

            <div class="report-section">
              <h3>2. Ficha de Monitoreo</h3>
              <ul class="pdf-list">
                <li><strong>Asimilación/Acomodación:</strong> Capaz de adaptar conocimientos previos a nuevos ejercicios visuales.</li>
                <li><strong>Autorregulación:</strong> Mantiene la atención en periodos cortos de 15 minutos.</li>
                <li><strong>Acciones de Apoyo:</strong> Se recomienda usar material concreto (bloques lógicos) en casa.</li>
              </ul>
            </div>
            
            <div class="report-footer">
              <div class="signature-line"></div>
              <p>Firma del Docente Evaluador</p>
            </div>
          </div>
        </div>

        <div id="report-group" style="display:none; padding:40px; background:white; color:black; width: 800px;">
          <div style="text-align:center; margin-bottom: 30px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px;">
            <h1 style="margin:0; color:#1e293b;">Resumen Grupal de Evaluaciones</h1>
            <p style="color:#64748b; margin-top:5px;">Aula Virtual - Fecha: {{ new Date().toLocaleDateString() }}</p>
          </div>
          <h3 style="color:#334155;">Desempeño General</h3>
          <p>Del total de los estudiantes matriculados, el 65% ha alcanzado el nivel "Logrado" en la mayoría de criterios evaluativos. El 25% se mantiene "En Proceso" y un 10% requiere acompañamiento continuo ("Iniciado").</p>
          <br>
          <p><em>Documento autogenerado por el Sistema de Aulas Virtuales.</em></p>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.view-container {
  display: flex;
  flex-direction: column;
  gap: 30px;
  height: 100%;
  max-width: 100%;
  min-width: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.subtitle {
  color: var(--text-secondary);
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
}

.btn-primary, .btn-secondary {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
}

.btn-primary { background-color: #3b82f6; color: white; }
.btn-primary:hover:not(:disabled) { background-color: #2563eb; }
.btn-secondary { background-color: white; color: #334155; border: 1px solid #cbd5e1; }
.btn-secondary { background-color: var(--bg-glass); color: var(--text-primary); border: 1px solid var(--border-color); }
.btn-secondary:hover:not(:disabled) { background-color: var(--bg-glass-hover); }
.btn-primary:disabled, .btn-secondary:disabled { opacity: 0.7; cursor: wait; }

.layout-grid {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 24px;
  align-items: start;
  max-width: 100%;
}

.students-list {
  background: var(--bg-surface);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
  border: 1px solid var(--border-color);
}

.students-list h3 { margin: 0 0 16px 0; color: var(--text-primary); font-size: 1.1rem; }
.students-list ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
.students-list li {
  display: flex; align-items: center; gap: 12px; padding: 10px 12px;
  border-radius: 8px; cursor: pointer; transition: all 0.2s;
  color: var(--text-secondary); font-weight: 500;
}
.students-list li:hover { background-color: var(--bg-glass-hover); }
.students-list li.active { background-color: rgba(59, 130, 246, 0.15); color: var(--text-primary); }

.avatar {
  width: 32px; height: 32px; border-radius: 50%;
  background-color: var(--bg-glass); color: var(--text-secondary);
  display: flex; align-items: center; justify-content: center; font-weight: bold;
}
.students-list li.active .avatar { background-color: #3b82f6; color: white; }

.report-preview {
  display: flex; flex-direction: column; gap: 20px;
  min-width: 0;
  max-width: 100%;
}

.preview-header {
  display: flex; justify-content: space-between; align-items: center;
}

.preview-header h2 { margin: 0; font-size: 1.2rem; color: #334155; }
.preview-header h2 { margin: 0; font-size: 1.2rem; color: var(--text-primary); }

.report-canvas-wrapper {
  background: var(--bg-glass);
  padding: 20px;
  border-radius: 12px;
  display: flex;
  justify-content: flex-start;
  overflow-x: auto;
  max-width: 100%;
  box-sizing: border-box;
}

/* El "Papel" A4 virtual */
.report-canvas {
  background: white;
  width: 210mm;
  min-height: 297mm;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  padding: 20mm;
  color: #000;
  font-family: Arial, sans-serif;
  box-sizing: border-box;
}

.report-header-pdf {
  display: flex;
  align-items: center;
  gap: 20px;
  border-bottom: 2px solid #1e293b;
  padding-bottom: 20px;
  margin-bottom: 20px;
}

.logo-placeholder {
  width: 60px; height: 60px;
  background-color: #1e293b; color: white;
  display: flex; align-items: center; justify-content: center;
  font-weight: 900; font-size: 1.2rem; border-radius: 8px;
}

.report-titles h2 { margin: 0 0 5px 0; color: #1e293b; font-size: 1.5rem; }
.report-titles p { margin: 0; color: #64748b; font-size: 1rem; }

.report-info { margin-bottom: 30px; }
.report-info p { margin: 5px 0; font-size: 0.95rem; }

.report-section { margin-bottom: 30px; }
.report-section h3 {
  font-size: 1.1rem; color: #1e293b;
  border-bottom: 1px solid #cbd5e1; padding-bottom: 8px; margin-bottom: 15px;
}

.pdf-table {
  width: 100%; border-collapse: collapse; margin-bottom: 15px;
}
.pdf-table th, .pdf-table td {
  border: 1px solid #cbd5e1; padding: 10px; text-align: left; font-size: 0.9rem;
}
.pdf-table th { background-color: #f1f5f9; color: #334155; }

.badge {
  padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold;
}
.badge.logrado { background: #dcfce7; color: #166534; }
.badge.proceso { background: #fef3c7; color: #92400e; }
.badge.iniciado { background: #fee2e2; color: #991b1b; }

.observation-box {
  background-color: #f8fafc; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6;
}
.observation-box strong { font-size: 0.9rem; color: #334155; }
.observation-box p { margin: 8px 0 0 0; font-size: 0.9rem; line-height: 1.5; color: #475569;}

.pdf-list { padding-left: 20px; font-size: 0.95rem; }
.pdf-list li { margin-bottom: 10px; line-height: 1.4; }

.report-footer {
  margin-top: 60px; text-align: center; color: #334155;
}
.signature-line {
  width: 250px; height: 1px; background-color: #334155; margin: 0 auto 10px auto;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  .header-actions {
    width: 100%;
  }
  .header-actions button {
    width: 100%;
    justify-content: center;
  }
  .layout-grid {
    grid-template-columns: 1fr;
  }
  .preview-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  .preview-header button {
    width: 100%;
    justify-content: center;
  }
  .report-canvas-wrapper {
    padding: 10px;
  }
  /* On mobile, scale the A4 canvas down so it looks better inside the wrapper */
  .report-canvas {
    transform: scale(0.8);
    transform-origin: top left;
    margin-bottom: -60mm; /* compensate for the scaled height */
  }
}
</style>
