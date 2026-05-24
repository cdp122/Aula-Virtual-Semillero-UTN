const mongoose = require('mongoose');

class NivelEntidad {}

const generarId = () => new mongoose.Types.ObjectId().toString();

const NivelSchema = new mongoose.Schema(
  {
    _id: { type: String, default: generarId },
    descripcion_nivel: { type: String, required: true },
    activo: { type: Boolean, default: true }
  },
  {
    collection: 'niveles',
    timestamps: false
  }
);

NivelSchema.loadClass(NivelEntidad);

const NivelModelo = mongoose.models.Nivel || mongoose.model('Nivel', NivelSchema);

module.exports = { NivelModelo };
