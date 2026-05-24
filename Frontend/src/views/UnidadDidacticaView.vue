<script setup>
import { ref } from 'vue'

const currentStep = ref(1)
const steps = ['Información General', 'Objetivos y Destrezas', 'Descripción y Actividades', 'Revisión']

// Data model for the new Unidad Didactica
const form = ref({
  ambito: '',
  semanas_previstas: 1,
  objetivo_general: '',
  objetivos_aprendizaje: [],
  destrezas: [],
  descripcion: '',
  tecnica_didactica: '',
  actividades: []
})

const nextStep = () => {
  if (currentStep.value < 4) currentStep.value++
}

const prevStep = () => {
  if (currentStep.value > 1) currentStep.value--
}

const save = () => {
  alert('Guardado simulado. Aquí se conectará con GraphQL.')
}
</script>

<template>
  <div class="view-container">
    <header class="page-header">
      <div>
        <h1 class="title">Planificación de Actividades</h1>
        <p class="subtitle">Crea y gestiona tus unidades didácticas en simples pasos.</p>
      </div>
      <button class="btn-primary" @click="currentStep = 1" v-if="currentStep > 1">Nueva Unidad</button>
    </header>

    <div class="wizard-container">
      <!-- Stepper -->
      <div class="stepper">
        <div 
          v-for="(step, index) in steps" 
          :key="index"
          class="step"
          :class="{ active: currentStep === index + 1, completed: currentStep > index + 1 }"
        >
          <div class="step-circle">{{ index + 1 }}</div>
          <span class="step-label">{{ step }}</span>
          <div class="step-line" v-if="index < steps.length - 1"></div>
        </div>
      </div>

      <!-- Content -->
      <div class="step-content">
        <!-- Step 1 -->
        <transition name="slide" mode="out-in">
          <div v-if="currentStep === 1" class="form-grid">
            <div class="form-group">
              <label>Ámbito</label>
              <input type="text" v-model="form.ambito" placeholder="Ej. Lógico Matemático" class="input-base" />
            </div>
            <div class="form-group">
              <label>Semanas Previstas</label>
              <input type="number" v-model="form.semanas_previstas" min="1" class="input-base" />
            </div>
            <div class="form-group full-width">
              <label>Técnica Didáctica</label>
              <input type="text" v-model="form.tecnica_didactica" placeholder="Ej. Aprendizaje Basado en Proyectos" class="input-base" />
            </div>
          </div>

          <!-- Step 2 -->
          <div v-else-if="currentStep === 2" class="form-grid">
            <div class="form-group full-width">
              <label>Objetivo General</label>
              <textarea v-model="form.objetivo_general" rows="3" class="input-base" placeholder="Describe el objetivo general de la unidad..."></textarea>
            </div>
            <div class="form-group full-width">
              <label>Destrezas (Separadas por comas)</label>
              <input type="text" placeholder="Ej. Clasificar, Ordenar, Sumar..." class="input-base" />
            </div>
          </div>

          <!-- Step 3 -->
          <div v-else-if="currentStep === 3" class="form-grid">
            <div class="form-group full-width editor-container">
              <label>Descripción con Texto e Imágenes</label>
              <QuillEditor theme="snow" v-model:content="form.descripcion" contentType="html" />
            </div>
          </div>

          <!-- Step 4 -->
          <div v-else-if="currentStep === 4" class="review-section">
            <h3>Revisión Final</h3>
            <div class="review-card">
              <p><strong>Ámbito:</strong> {{ form.ambito || 'No especificado' }}</p>
              <p><strong>Semanas:</strong> {{ form.semanas_previstas }}</p>
              <p><strong>Objetivo:</strong> {{ form.objetivo_general || 'No especificado' }}</p>
              <p><strong>Descripción:</strong> Se ha incluido contenido multimedia.</p>
            </div>
          </div>
        </transition>
      </div>

      <!-- Actions -->
      <div class="wizard-actions">
        <button class="btn-secondary" @click="prevStep" :disabled="currentStep === 1">Anterior</button>
        <button class="btn-primary" @click="nextStep" v-if="currentStep < 4">Siguiente</button>
        <button class="btn-success" @click="save" v-if="currentStep === 4">Guardar Unidad</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.view-container {
  display: flex;
  flex-direction: column;
  gap: 30px;
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

.wizard-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.04);
  padding: 40px;
}

.stepper {
  display: flex;
  justify-content: space-between;
  margin-bottom: 50px;
  position: relative;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  z-index: 2;
  position: relative;
  flex: 1;
}

.step-line {
  position: absolute;
  top: 20px;
  left: calc(50% + 20px);
  width: calc(100% - 40px);
  height: 3px;
  background-color: #e2e8f0;
  z-index: -1;
}

.step.completed .step-line {
  background-color: #4CAF50;
}

.step-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e2e8f0;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  transition: all 0.3s ease;
}

.step.active .step-circle {
  background-color: #4CAF50;
  color: white;
  box-shadow: 0 0 0 4px rgba(76, 175, 80, 0.2);
}

.step.completed .step-circle {
  background-color: #4CAF50;
  color: white;
}

.step-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #64748b;
}

.step.active .step-label {
  color: #1a1b26;
  font-weight: 600;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
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
}

.input-base:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

.editor-container {
  min-height: 300px;
}

:deep(.ql-container) {
  min-height: 250px;
  font-size: 1rem;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
}

:deep(.ql-toolbar) {
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  background-color: #f8fafc;
}

.wizard-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid #f1f5f9;
}

.btn-primary, .btn-secondary, .btn-success {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-size: 0.95rem;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background-color: #2563eb;
}

.btn-secondary {
  background-color: #f1f5f9;
  color: #475569;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #e2e8f0;
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-success {
  background-color: #4CAF50;
  color: white;
}

.btn-success:hover {
  background-color: #43a047;
}

.review-card {
  background-color: #f8fafc;
  padding: 24px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.review-card p {
  margin: 12px 0;
  color: #334155;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease-out;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
