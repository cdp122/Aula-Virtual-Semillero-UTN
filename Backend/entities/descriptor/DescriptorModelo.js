const mongoose = require('mongoose');

class DescriptorEntidad {}

const generarId = () => new mongoose.Types.ObjectId().toString();

const DescriptorSchema = new mongoose.Schema(
  {
    _id: { type: String, default: generarId },
    descripcion_descriptores: { type: String, required: true },
    activo: { type: Boolean, default: true }
  },
  {
    collection: 'descriptores',
    timestamps: false
  }
);

DescriptorSchema.loadClass(DescriptorEntidad);

const DescriptorModelo =
  mongoose.models.Descriptor || mongoose.model('Descriptor', DescriptorSchema);

module.exports = { DescriptorModelo };
