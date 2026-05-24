const mongoose = require('mongoose');

class UsuarioEntidad {
  esActivo() {
    return this.activo === true;
  }
}

const ContactoSchema = new mongoose.Schema(
  {
    numero: { type: String },
    correo: { type: String }
  },
  { _id: false }
);

const generarId = () => new mongoose.Types.ObjectId().toString();

const UsuarioSchema = new mongoose.Schema(
  {
    _id: { type: String, default: generarId },
    nombre: { type: String, required: true },
    username: { type: String, required: true },
    contrasena: { type: String },
    roles: { type: [String], default: [] },
    contacto: { type: ContactoSchema, default: {} },
    activo: { type: Boolean, default: true },
    hijos: { type: [String], default: [] },
    id_representante: { type: String },
    id_cursos: { type: [String], default: [] }
  },
  {
    collection: 'usuarios',
    timestamps: false
  }
);

UsuarioSchema.loadClass(UsuarioEntidad);

const UsuarioModelo = mongoose.models.Usuario || mongoose.model('Usuario', UsuarioSchema);

module.exports = { UsuarioModelo };
