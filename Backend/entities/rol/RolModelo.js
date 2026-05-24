const mongoose = require('mongoose');

class RolEntidad {
  establecerPermisos(permisos) {
    this.permisos_rol = permisos || {};
  }
}

const generarId = () => new mongoose.Types.ObjectId().toString();

const RolSchema = new mongoose.Schema(
  {
    _id: { type: String, default: generarId },
    nombre_rol: { type: String, required: true },
    permisos_rol: { type: Object, default: {} },
    activo: { type: Boolean, default: true }
  },
  {
    collection: 'roles',
    timestamps: false
  }
);

RolSchema.loadClass(RolEntidad);

const RolModelo = mongoose.models.Rol || mongoose.model('Rol', RolSchema);

module.exports = { RolModelo };
