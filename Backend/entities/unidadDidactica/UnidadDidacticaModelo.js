const mongoose = require('mongoose');

class UnidadDidacticaEntidad {}

const ArchivoAdjuntoSchema = new mongoose.Schema(
  {
    tipo: { type: String },
    url: { type: String },
    base64: { type: String }
  },
  { _id: false }
);

const CriterioActividadSchema = new mongoose.Schema(
  {
    id_criterio: { type: String, required: true },
    tipo: { type: String }
  },
  { _id: false }
);

const ActividadSchema = new mongoose.Schema(
  {
    id_actividad: { type: String, required: true },
    tipo_actividad: { type: String, required: true },
    descripcion_actividad: { type: String, required: true },
    archivos_adjuntos: { type: [ArchivoAdjuntoSchema], default: [] },
    fecha_actividad: { type: Date },
    activo: { type: Boolean, default: true },
    criterios_evaluacion: { type: [CriterioActividadSchema], default: [] }
  },
  { _id: false }
);

const generarId = () => new mongoose.Types.ObjectId().toString();

const UnidadDidacticaSchema = new mongoose.Schema(
  {
    _id: { type: String, default: generarId },
    ambito: { type: String, required: true },
    objetivo_general: { type: String, required: true },
    objetivos_aprendizaje: { type: [String], default: [] },
    destrezas: { type: [String], default: [] },
    tecnica_didactica: { type: String },
    fecha_inicio: { type: Date },
    fecha_fin: { type: Date },
    activo: { type: Boolean, default: true },
    actividades: { type: [ActividadSchema], default: [] }
  },
  {
    collection: 'unidades_didacticas',
    timestamps: false
  }
);

UnidadDidacticaSchema.loadClass(UnidadDidacticaEntidad);

const UnidadDidacticaModelo =
  mongoose.models.UnidadDidactica ||
  mongoose.model('UnidadDidactica', UnidadDidacticaSchema);

module.exports = { UnidadDidacticaModelo };
