const mongoose = require('mongoose');

class EvaluacionEstudianteEntidad {}

const EvaluacionCriterioSchema = new mongoose.Schema(
  {
    id_criterio: { type: String, required: true },
    nivel_logro: { type: String, required: true },
    observaciones: { type: String }
  },
  { _id: false }
);

const HistorialVersionSchema = new mongoose.Schema(
  {
    version: { type: Number, required: true },
    fecha_registro: { type: Date, required: true },
    docente_evaluador: { type: String, required: true },
    evaluaciones_criterio: { type: [EvaluacionCriterioSchema], default: [] }
  },
  { _id: false }
);

const FichaMonitoreoSchema = new mongoose.Schema(
  {
    clasificacion: { type: String },
    seriacion: { type: String },
    asimilacion_acomodacion: { type: String },
    justificacion: { type: String },
    autoregulacion: { type: String },
    observaciones: { type: String },
    acciones_apoyo: { type: String }
  },
  { _id: false }
);

const ActividadCasaCompletadaSchema = new mongoose.Schema(
  {
    id_actividad: { type: String, required: true },
    comentario: { type: String },
    fecha: { type: Date, required: true }
  },
  { _id: false }
);

const generarId = () => new mongoose.Types.ObjectId().toString();

const EvaluacionEstudianteSchema = new mongoose.Schema(
  {
    _id: { type: String, default: generarId },
    id_actividad: { type: String, required: true },
    id_estudiante: { type: String, required: true },
    historial_versiones: { type: [HistorialVersionSchema], default: [] },
    ficha_monitoreo: { type: FichaMonitoreoSchema, default: {} },
    actividades_casa_completadas: { type: [ActividadCasaCompletadaSchema], default: [] }
  },
  {
    collection: 'evaluaciones_estudiantes',
    timestamps: false
  }
);

EvaluacionEstudianteSchema.loadClass(EvaluacionEstudianteEntidad);

const EvaluacionEstudianteModelo =
  mongoose.models.EvaluacionEstudiante ||
  mongoose.model('EvaluacionEstudiante', EvaluacionEstudianteSchema);

module.exports = { EvaluacionEstudianteModelo };
