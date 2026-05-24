const {
  EvaluacionEstudianteModelo
} = require('../../entities/evaluacionEstudiante/EvaluacionEstudianteModelo');

const resolvers = {
  Query: {
    evaluacionesEstudiantes: async () => EvaluacionEstudianteModelo.find().lean(),
    evaluacionEstudiantePorId: async (_, { id }) =>
      EvaluacionEstudianteModelo.findById(id).lean()
  },
  Mutation: {
    crearEvaluacionEstudiante: async (_, { input }) => {
      try {
        const evaluacion = new EvaluacionEstudianteModelo(input);
        return await evaluacion.save();
      } catch (error) {
        throw new Error(`Error al crear evaluacion: ${error.message}`);
      }
    },
    actualizarEvaluacionEstudiante: async (_, { id, input }) => {
      try {
        return await EvaluacionEstudianteModelo.findByIdAndUpdate(id, input, { new: true }).lean();
      } catch (error) {
        throw new Error(`Error al actualizar evaluacion: ${error.message}`);
      }
    },
    eliminarEvaluacionEstudiante: async (_, { id }) => {
      try {
        const resultado = await EvaluacionEstudianteModelo.deleteOne({ _id: id });
        return resultado.deletedCount === 1;
      } catch (error) {
        throw new Error(`Error al eliminar evaluacion: ${error.message}`);
      }
    },
    registrarNuevaVersionEvaluacion: async (_, { id_evaluacion, docente_evaluador, evaluaciones_criterio }) => {
      try {
        const evaluacion = await EvaluacionEstudianteModelo.findById(id_evaluacion);
        if (!evaluacion) throw new Error('Evaluación no encontrada');

        const nextVersion = evaluacion.historial_versiones.length > 0 
          ? Math.max(...evaluacion.historial_versiones.map(h => h.version)) + 1 
          : 1;

        const nuevaVersion = {
          version: nextVersion,
          fecha_registro: new Date(),
          docente_evaluador,
          evaluaciones_criterio
        };

        evaluacion.historial_versiones.push(nuevaVersion);
        return await evaluacion.save();
      } catch (error) {
        throw new Error(`Error al registrar nueva versión de evaluación: ${error.message}`);
      }
    },
    actualizarFichaMonitoreoEstudiante: async (_, { id_evaluacion, ficha }) => {
      try {
        return await EvaluacionEstudianteModelo.findByIdAndUpdate(
          id_evaluacion,
          { ficha_monitoreo: ficha },
          { new: true }
        ).lean();
      } catch (error) {
        throw new Error(`Error al actualizar ficha de monitoreo: ${error.message}`);
      }
    }
  }
};

module.exports = { resolvers };
