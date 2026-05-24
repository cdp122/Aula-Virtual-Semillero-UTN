<script setup>
import { ref } from 'vue'

const questions = [
  '¿Planifiqué mis actividades de forma clara y estructurada?',
  '¿Utilicé material didáctico adecuado para el desarrollo cognitivo?',
  '¿Fomenté la participación activa y atención de los alumnos?',
  '¿Evalué el progreso de los estudiantes según la rúbrica establecida?',
  '¿Atendí las necesidades individuales y apliqué acciones de apoyo?',
  '¿Logré los objetivos planteados para la unidad didáctica?'
]

const responses = ref(questions.map(q => ({
  pregunta: q,
  respuesta: '',
  reflexion: ''
})))

const saveEvaluation = () => {
  const isComplete = responses.value.every(r => r.respuesta !== '')
  if (!isComplete) {
    alert('Por favor selecciona una respuesta (Sí, No, En Proceso) para todas las preguntas.')
    return
  }
  alert('Autoevaluación guardada con marca de tiempo.')
}
</script>

<template>
  <div class="view-container">
    <header class="page-header">
      <div>
        <h1 class="title">Autoevaluación Docente</h1>
        <p class="subtitle">Reflexiona sobre tu desempeño en la unidad actual.</p>
      </div>
      <button class="btn-primary" @click="saveEvaluation">Guardar Evaluación</button>
    </header>

    <div class="evaluation-form">
      <div v-for="(item, index) in responses" :key="index" class="question-card">
        <div class="question-header">
          <div class="question-number">{{ index + 1 }}</div>
          <h3>{{ item.pregunta }}</h3>
        </div>
        
        <div class="question-body">
          <div class="radio-group">
            <label class="radio-label">
              <input type="radio" :name="`q-${index}`" value="Sí" v-model="item.respuesta" />
              <span class="custom-radio"></span>
              Sí
            </label>
            <label class="radio-label">
              <input type="radio" :name="`q-${index}`" value="En Proceso" v-model="item.respuesta" />
              <span class="custom-radio"></span>
              En Proceso
            </label>
            <label class="radio-label">
              <input type="radio" :name="`q-${index}`" value="No" v-model="item.respuesta" />
              <span class="custom-radio"></span>
              No
            </label>
          </div>

          <div class="reflection-field">
            <textarea 
              v-model="item.reflexion" 
              placeholder="Reflexión o comentario opcional sobre esta pregunta..."
              rows="2"
              class="input-base"
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.view-container {
  display: flex;
  flex-direction: column;
  gap: 30px;
  max-width: 900px;
  margin: 0 auto;
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
  background-color: #3b82f6;
  color: white;
  border: none;
  font-size: 0.95rem;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: #2563eb;
}

.evaluation-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.question-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
  border: 1px solid #e2e8f0;
}

.question-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.question-number {
  background-color: #eff6ff;
  color: #3b82f6;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
}

.question-card h3 {
  margin: 0;
  color: #1e293b;
  font-size: 1.1rem;
  font-weight: 600;
}

.question-body {
  padding-left: 48px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.radio-group {
  display: flex;
  gap: 24px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #475569;
  font-weight: 500;
}

.radio-label input[type="radio"] {
  display: none;
}

.custom-radio {
  width: 20px;
  height: 20px;
  border: 2px solid #cbd5e1;
  border-radius: 50%;
  display: inline-block;
  position: relative;
  transition: all 0.2s;
}

.radio-label input[type="radio"]:checked + .custom-radio {
  border-color: #3b82f6;
}

.radio-label input[type="radio"]:checked + .custom-radio::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 10px;
  height: 10px;
  background-color: #3b82f6;
  border-radius: 50%;
}

.reflection-field {
  margin-top: 8px;
}

.input-base {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: border-color 0.2s;
  font-family: inherit;
  resize: vertical;
  background-color: #f8fafc;
}

.input-base:focus {
  outline: none;
  border-color: #3b82f6;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
</style>
