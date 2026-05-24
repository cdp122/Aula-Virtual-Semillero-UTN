const mongoose = require('mongoose');

class CursoEntidad {
  estaActivo() {
    return this.activo === true;
  }
}

const EstudianteCursoSchema = new mongoose.Schema(
  {
    id_estudiante: { type: String, required: true },
    nombre: { type: String, required: true }
  },
  { _id: false }
);

const generarId = () => new mongoose.Types.ObjectId().toString();

const CursoSchema = new mongoose.Schema(
  {
    _id: { type: String, default: generarId },
    id_docente: { type: String, required: true },
    nombre_curso: { type: String, required: true },
    activo: { type: Boolean, default: true },
    estudiantes: { type: [EstudianteCursoSchema], default: [] }
  },
  {
    collection: 'cursos',
    timestamps: false
  }
);

CursoSchema.loadClass(CursoEntidad);

const CursoModelo = mongoose.models.Curso || mongoose.model('Curso', CursoSchema);

module.exports = { CursoModelo };
