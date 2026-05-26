<script setup>
import { ref } from 'vue'

// Lista de estudiantes de prueba
const students = ref([
  { id: '1', nombre: 'Ana García' },
  { id: '2', nombre: 'Carlos López' },
  { id: '3', nombre: 'María Rodríguez' }
])

const selectedStudent = ref(students.value[0])

// RNF-09: Campos configurables mediante estructura de datos (JSON)
const fichaConfig = ref([
  { id: 'clasificacion', label: 'Clasificación', type: 'text', placeholder: 'Nivel de clasificación alcanzado...' },
  { id: 'seriacion', label: 'Seriación', type: 'text', placeholder: 'Habilidad de seriación demostrada...' },
  { id: 'asimilacion_acomodacion', label: 'Asimilación y Acomodación', type: 'text', placeholder: 'Capacidad de asimilación...' },
  { id: 'justificacion', label: 'Justificación Lógica', type: 'text', placeholder: 'Criterios lógicos utilizados...' },
  { id: 'autoregulacion', label: 'Autorregulación', type: 'text', placeholder: 'Control de impulsos y atención...' },
  { id: 'observaciones', label: 'Campo de Observaciones', type: 'textarea', placeholder: 'Observaciones generales del comportamiento y aprendizaje...' },
  { id: 'acciones_apoyo', label: 'Acciones de Apoyo', type: 'textarea', placeholder: 'Estrategias de intervención o apoyo sugeridas...' }
])

const formData = ref({})

const selectStudent = (student) => {
  selectedStudent.value = student
  // Aquí se haría una petición a GraphQL para cargar la ficha existente de este alumno
  formData.value = {} 
}

const saveFicha = () => {
  alert(`Ficha de ${selectedStudent.value.nombre} guardada exitosamente.\n(Trazabilidad con fecha y autor incluida internamente)`)
}
</script>

<template>
  <div class="view-container">
    <header class="page-header">
      <div>
        <h1 class="title">Ficha de Monitoreo Individual</h1>
        <p class="subtitle">Registra el progreso cognitivo y conductual detallado.</p>
      </div>
      <button class="btn-primary" @click="saveFicha">Guardar Ficha</button>
    </header>

    <div class="layout-grid">
      <!-- Selector de alumnos -->
      <aside class="students-list">
        <h3>Alumnos</h3>
        <ul>
          <li 
            v-for="student in students" 
            :key="student.id"
            :class="{ active: selectedStudent?.id === student.id }"
            @click="selectStudent(student)"
          >
            <div class="avatar">{{ student.nombre.charAt(0) }}</div>
            <span>{{ student.nombre }}</span>
          </li>
        </ul>
      </aside>

      <!-- Formulario Dinámico -->
      <main class="ficha-form" v-if="selectedStudent">
        <div class="form-header">
          <h2>Monitoreo de {{ selectedStudent.nombre }}</h2>
          <span class="date-badge">Actualizado: {{ new Date().toLocaleDateString() }}</span>
        </div>

        <div class="dynamic-fields">
          <div v-for="field in fichaConfig" :key="field.id" class="form-group" :class="{'full-width': field.type === 'textarea'}">
            <label>{{ field.label }}</label>
            <textarea 
              v-if="field.type === 'textarea'" 
              v-model="formData[field.id]" 
              :placeholder="field.placeholder"
              rows="3"
              class="input-base"
            ></textarea>
            <input 
              v-else 
              type="text" 
              v-model="formData[field.id]" 
              :placeholder="field.placeholder"
              class="input-base"
            />
          </div>
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
  color: #1a1b26;
  margin: 0 0 8px 0;
}

.subtitle {
  color: #64748b;
  margin: 0;
}

.btn-primary {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  background-color: #4CAF50;
  color: white;
  border: none;
  font-size: 0.95rem;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: #43a047;
}

.layout-grid {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 24px;
  align-items: start;
  max-width: 100%;
}

.students-list {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
  border: 1px solid #e2e8f0;
}

.students-list h3 {
  margin: 0 0 16px 0;
  color: #334155;
  font-size: 1.1rem;
}

.students-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.students-list li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: #475569;
  font-weight: 500;
}

.students-list li:hover {
  background-color: #f8fafc;
}

.students-list li.active {
  background-color: #f0fdf4;
  color: #166534;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #e2e8f0;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.students-list li.active .avatar {
  background-color: #4CAF50;
  color: white;
}

.ficha-form {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
  border: 1px solid #e2e8f0;
  max-width: 100%;
  box-sizing: border-box;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
}

.form-header h2 {
  margin: 0;
  color: #1e293b;
  font-size: 1.4rem;
}

.date-badge {
  background-color: #f1f5f9;
  color: #64748b;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.dynamic-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-weight: 500;
  color: #334155;
  font-size: 0.95rem;
}

.input-base {
  padding: 12px 16px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
  font-family: inherit;
  resize: vertical;
}

.input-base:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  .btn-primary {
    width: 100%;
  }
  .layout-grid {
    grid-template-columns: 1fr;
  }
  .dynamic-fields {
    grid-template-columns: 1fr;
  }
  .form-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  .ficha-form {
    padding: 20px;
  }
}
</style>
