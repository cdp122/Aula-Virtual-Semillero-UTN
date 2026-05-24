const mongoose = require('mongoose');

class CriterioEvaluacionEntidad {}

const generarId = () => new mongoose.Types.ObjectId().toString();

const CriterioEvaluacionSchema = new mongoose.Schema(
  {
    _id: { type: String, default: generarId },
    tipo_criterio: { type: String, required: true },
    descripcion_criterio: { type: String },
    activo: { type: Boolean, default: true }
  },
  {
    collection: 'criterios_evaluacion',
    timestamps: false
  }
);

CriterioEvaluacionSchema.loadClass(CriterioEvaluacionEntidad);

const CriterioEvaluacionModelo =
  mongoose.models.CriterioEvaluacion ||
  mongoose.model('CriterioEvaluacion', CriterioEvaluacionSchema);

module.exports = { CriterioEvaluacionModelo };
