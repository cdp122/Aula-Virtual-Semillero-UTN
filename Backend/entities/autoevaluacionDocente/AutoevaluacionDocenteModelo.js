const mongoose = require('mongoose');

class AutoevaluacionDocenteEntidad {}

const RespuestaFormularioSchema = new mongoose.Schema(
  {
    pregunta: { type: String, required: true },
    respuesta: { type: String, required: true },
    reflexion: { type: String }
  },
  { _id: false }
);

const generarId = () => new mongoose.Types.ObjectId().toString();

const AutoevaluacionDocenteSchema = new mongoose.Schema(
  {
    _id: { type: String, default: generarId },
    id_actividad: { type: String, required: true },
    id_docente: { type: String, required: true },
    fecha_completado: { type: Date, required: true },
    respuestas_formulario: { type: [RespuestaFormularioSchema], default: [] }
  },
  {
    collection: 'autoevaluaciones_docentes',
    timestamps: true
  }
);

AutoevaluacionDocenteSchema.loadClass(AutoevaluacionDocenteEntidad);

const AutoevaluacionDocenteModelo =
  mongoose.models.AutoevaluacionDocente ||
  mongoose.model('AutoevaluacionDocente', AutoevaluacionDocenteSchema);

module.exports = { AutoevaluacionDocenteModelo };
