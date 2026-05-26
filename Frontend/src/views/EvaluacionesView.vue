<script setup>
import { ref } from 'vue'

const students = ref([
  { id: '1', nombre: 'Ana García' },
  { id: '2', nombre: 'Carlos López' },
  { id: '3', nombre: 'María Rodríguez' }
])

const criteria = ref([
  { id: 'c1', label: 'Clasifica por color' },
  { id: 'c2', label: 'Ordena secuencialmente' },
  { id: 'c3', label: 'Identifica patrones' }
])

const evaluations = ref({})

const setScore = (studentId, criteriaId, score) => {
  if (!evaluations.value[studentId]) evaluations.value[studentId] = {}
  evaluations.value[studentId][criteriaId] = score
}

const getScoreClass = (studentId, criteriaId, targetScore) => {
  const score = evaluations.value[studentId]?.[criteriaId]
  if (score === targetScore) {
    if (score === 'Logrado') return 'logrado-active'
    if (score === 'En Proceso') return 'proceso-active'
    if (score === 'Iniciado') return 'iniciado-active'
  }
  return ''
}
</script>

<template>
  <div class="view-container">
    <header class="page-header">
      <div>
        <h1 class="title">Matriz de Evaluaciones</h1>
        <p class="subtitle">Registro rápido de logros por estudiante y criterio.</p>
      </div>
      <div class="header-actions">
        <button class="btn-secondary">Exportar PDF</button>
        <button class="btn-primary">Guardar Cambios</button>
      </div>
    </header>

    <div class="legend-container">
      <span class="legend-item"><span class="legend-dot iniciado-dot"></span> I = Iniciado</span>
      <span class="legend-item"><span class="legend-dot proceso-dot"></span> EP = En Proceso</span>
      <span class="legend-item"><span class="legend-dot logrado-dot"></span> L = Logrado</span>
    </div>

    <div class="table-container">
      <table class="evaluation-matrix">
        <thead>
          <tr>
            <th class="sticky-col">Estudiante</th>
            <th v-for="crit in criteria" :key="crit.id">{{ crit.label }}</th>
            <th>Observación Final</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="student in students" :key="student.id">
            <td class="sticky-col font-medium">{{ student.nombre }}</td>
            <td v-for="crit in criteria" :key="crit.id">
              <div class="score-buttons">
                <button 
                  class="score-btn" 
                  :class="getScoreClass(student.id, crit.id, 'Iniciado')"
                  @click="setScore(student.id, crit.id, 'Iniciado')"
                  title="Iniciado"
                >I</button>
                <button 
                  class="score-btn" 
                  :class="getScoreClass(student.id, crit.id, 'En Proceso')"
                  @click="setScore(student.id, crit.id, 'En Proceso')"
                  title="En Proceso"
                >EP</button>
                <button 
                  class="score-btn" 
                  :class="getScoreClass(student.id, crit.id, 'Logrado')"
                  @click="setScore(student.id, crit.id, 'Logrado')"
                  title="Logrado"
                >L</button>
              </div>
            </td>
            <td>
              <button class="btn-icon" title="Añadir nota escrita">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.view-container {
  display: flex;
  flex-direction: column;
  gap: 30px;
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
  gap: 12px;
}

.btn-primary, .btn-secondary {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-size: 0.95rem;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
}

.btn-primary:hover {
  background-color: #43a047;
}

.btn-secondary {
  background-color: var(--bg-glass);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background-color: var(--bg-glass-hover);
}

.table-container {
  background: var(--bg-surface);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.04);
  overflow-x: auto;
  border: 1px solid var(--border-color);
  max-width: 100%;
}

.evaluation-matrix {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.evaluation-matrix th, .evaluation-matrix td {
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  border-right: 1px solid var(--border-color);
  white-space: nowrap;
}

.evaluation-matrix th {
  background-color: var(--bg-glass);
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 0.9rem;
}

.sticky-col {
  position: sticky;
  left: 0;
  background-color: var(--bg-glass);
  z-index: 2;
  box-shadow: 2px 0 5px rgba(0,0,0,0.02);
}

.font-medium {
  font-weight: 500;
  color: var(--text-primary);
}

.score-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.score-btn {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: var(--bg-glass);
  color: var(--text-secondary);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.score-btn:hover {
  background: var(--bg-glass-hover);
}

.iniciado-active {
  background: #fef2f2 !important;
  color: #ef4444 !important;
  border-color: #fca5a5 !important;
}

.proceso-active {
  background: #fffbeb !important;
  color: #f59e0b !important;
  border-color: #fcd34d !important;
}

.logrado-active {
  background: #f0fdf4 !important;
  color: #22c55e !important;
  border-color: #86efac !important;
}

.legend-container {
  display: flex;
  gap: 20px;
  background: var(--bg-surface);
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
  width: fit-content;
  border: 1px solid var(--border-color);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.iniciado-dot { background-color: #ef4444; }
.proceso-dot { background-color: #f59e0b; }
.logrado-dot { background-color: #22c55e; }

.btn-icon {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon:hover {
  background: var(--bg-glass-hover);
  color: #3b82f6;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
  .legend-container {
    flex-wrap: wrap;
    justify-content: center;
  }
  .score-btn {
    width: 32px;
    height: 32px;
    font-size: 0.8rem;
  }
}
</style>
