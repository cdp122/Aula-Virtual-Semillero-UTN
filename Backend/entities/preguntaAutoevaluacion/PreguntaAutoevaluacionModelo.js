const mongoose = require('mongoose');

class PreguntaAutoevaluacionEntidad {}

const generarId = () => new mongoose.Types.ObjectId().toString();

const PreguntaAutoevaluacionSchema = new mongoose.Schema(
  {
    _id: { type: String, default: generarId },
    pregunta: { type: String, required: true },
    activo: { type: Boolean, default: true }
  },
  {
    collection: 'preguntas_autoevaluacion',
    timestamps: false
  }
);

PreguntaAutoevaluacionSchema.loadClass(PreguntaAutoevaluacionEntidad);

const PreguntaAutoevaluacionModelo =
  mongoose.models.PreguntaAutoevaluacion ||
  mongoose.model('PreguntaAutoevaluacion', PreguntaAutoevaluacionSchema);

module.exports = { PreguntaAutoevaluacionModelo };
