const { UsuarioModelo } = require('../entities/usuario/UsuarioModelo');
const { CursoModelo } = require('../entities/curso/CursoModelo');
const {
  UnidadDidacticaModelo
} = require('../entities/unidadDidactica/UnidadDidacticaModelo');
const {
  EvaluacionEstudianteModelo
} = require('../entities/evaluacionEstudiante/EvaluacionEstudianteModelo');
const {
  AutoevaluacionDocenteModelo
} = require('../entities/autoevaluacionDocente/AutoevaluacionDocenteModelo');

const nivelesOrden = {
  INICIADO: 1,
  'EN PROCESO': 2,
  LOGRADO: 3
};

const resolverNivelDominante = (evaluaciones) => {
  let nivelActual = 'INICIADO';
  let puntajeActual = 0;

  (evaluaciones || []).forEach((criterio) => {
    const valor = nivelesOrden[String(criterio.nivel_logro).toUpperCase()] || 0;
    if (valor > puntajeActual) {
      puntajeActual = valor;
      nivelActual = String(criterio.nivel_logro).toUpperCase();
    }
  });

  return nivelActual;
};

const resolvers = {
  Query: {
    obtenerProgresoHijo: async (_, { estudianteId, actividadId }) => {
      const evaluacion = await EvaluacionEstudianteModelo.findOne({
        id_estudiante: estudianteId,
        id_actividad: actividadId
      }).lean();

      if (!evaluacion || evaluacion.historial_versiones.length === 0) {
        return null;
      }

      const ultima = evaluacion.historial_versiones[evaluacion.historial_versiones.length - 1];

      return {
        id_estudiante: evaluacion.id_estudiante,
        id_actividad: evaluacion.id_actividad,
        version: ultima.version,
        fecha_registro: ultima.fecha_registro,
        evaluaciones_criterio: ultima.evaluaciones_criterio,
        ficha_monitoreo: evaluacion.ficha_monitoreo
      };
    },
    obtenerActividadesCasa: async () => {
      const unidades = await UnidadDidacticaModelo.find().lean();
      const actividadesCasa = [];

      unidades.forEach((unidad) => {
        (unidad.actividades || []).forEach((actividad) => {
          if (actividad.tipo_actividad === 'CASA') {
            actividadesCasa.push({
              unidad_id: unidad._id,
              actividad
            });
          }
        });
      });

      return actividadesCasa;
    },
    obtenerReporteGrupal: async (_, { cursoId, actividadId }) => {
      const curso = await CursoModelo.findById(cursoId).lean();

      if (!curso) {
        return { iniciado: 0, en_proceso: 0, logrado: 0, total: 0 };
      }

      const conteo = {
        iniciado: 0,
        en_proceso: 0,
        logrado: 0,
        total: curso.estudiantes.length
      };

      for (const estudiante of curso.estudiantes) {
        const evaluacion = await EvaluacionEstudianteModelo.findOne({
          id_estudiante: estudiante.id_estudiante,
          id_actividad: actividadId
        }).lean();

        if (!evaluacion || evaluacion.historial_versiones.length === 0) {
          conteo.iniciado += 1;
          continue;
        }

        const ultima = evaluacion.historial_versiones[evaluacion.historial_versiones.length - 1];
        const nivel = resolverNivelDominante(ultima.evaluaciones_criterio);

        if (nivel === 'LOGRADO') {
          conteo.logrado += 1;
        } else if (nivel === 'EN PROCESO') {
          conteo.en_proceso += 1;
        } else {
          conteo.iniciado += 1;
        }
      }

      return conteo;
    }
  },
  Mutation: {
    login: async (_, { username, contrasena }) =>
      UsuarioModelo.findOne({ username, contrasena }).lean(),
    crearUnidadDidactica: async (_, { input }) => {
      try {
        const unidad = new UnidadDidacticaModelo(input);
        return await unidad.save();
      } catch (error) {
        throw new Error(`Error al crear unidad didactica: ${error.message}`);
      }
    },
    agregarActividadAUnidad: async (_, { unidadId, input }) => {
      try {
        return await UnidadDidacticaModelo.findByIdAndUpdate(
          unidadId,
          { $push: { actividades: input } },
          { new: true }
        ).lean();
      } catch (error) {
        throw new Error(`Error al agregar actividad: ${error.message}`);
      }
    },
    registrarEvaluacion: async (
      _,
      { estudianteId, actividadId, docenteId, criteriosInput, fichaInput }
    ) => {
      try {
        const idEvaluacion = `eval-${estudianteId}-${actividadId}`;
        const fechaActual = new Date();

        const evaluacion = await EvaluacionEstudianteModelo.findOne({
          _id: idEvaluacion
        });

        if (!evaluacion) {
          const nuevaEvaluacion = new EvaluacionEstudianteModelo({
            _id: idEvaluacion,
            id_actividad: actividadId,
            id_estudiante: estudianteId,
            historial_versiones: [],
            ficha_monitoreo: fichaInput
          });

          nuevaEvaluacion.historial_versiones.push({
            version: 1,
            fecha_registro: fechaActual,
            docente_evaluador: docenteId,
            evaluaciones_criterio: criteriosInput
          });

          return await nuevaEvaluacion.save();
        }

        const version = evaluacion.historial_versiones.length + 1;
        evaluacion.historial_versiones.push({
          version,
          fecha_registro: fechaActual,
          docente_evaluador: docenteId,
          evaluaciones_criterio: criteriosInput
        });

        evaluacion.ficha_monitoreo = fichaInput;

        return await evaluacion.save();
      } catch (error) {
        throw new Error(`Error al registrar evaluacion: ${error.message}`);
      }
    },
    registrarAutoevaluacionDocente: async (
      _,
      { actividadId, docenteId, respuestasInput }
    ) => {
      try {
        const idAutoevaluacion = `auto-${actividadId}-${docenteId}-${Date.now()}`;
        const autoevaluacion = new AutoevaluacionDocenteModelo({
          _id: idAutoevaluacion,
          id_actividad: actividadId,
          id_docente: docenteId,
          fecha_completado: new Date(),
          respuestas_formulario: respuestasInput
        });

        return await autoevaluacion.save();
      } catch (error) {
        throw new Error(`Error al registrar autoevaluacion: ${error.message}`);
      }
    },
    marcarActividadCompletada: async (
      _,
      { estudianteId, actividadId, comentario }
    ) => {
      try {
        const idEvaluacion = `eval-${estudianteId}-${actividadId}`;
        const fechaActual = new Date();

        const evaluacion = await EvaluacionEstudianteModelo.findOne({
          _id: idEvaluacion
        });

        if (!evaluacion) {
          const nuevaEvaluacion = new EvaluacionEstudianteModelo({
            _id: idEvaluacion,
            id_actividad: actividadId,
            id_estudiante: estudianteId,
            historial_versiones: [],
            ficha_monitoreo: {},
            actividades_casa_completadas: [
              { id_actividad: actividadId, comentario, fecha: fechaActual }
            ]
          });

          await nuevaEvaluacion.save();

          return {
            exito: true,
            mensaje: 'Actividad registrada desde cero'
          };
        }

        evaluacion.actividades_casa_completadas.push({
          id_actividad: actividadId,
          comentario,
          fecha: fechaActual
        });

        await evaluacion.save();

        return {
          exito: true,
          mensaje: 'Actividad completada registrada'
        };
      } catch (error) {
        return {
          exito: false,
          mensaje: `Error al marcar actividad: ${error.message}`
        };
      }
    }
  }
};

module.exports = { resolvers };
