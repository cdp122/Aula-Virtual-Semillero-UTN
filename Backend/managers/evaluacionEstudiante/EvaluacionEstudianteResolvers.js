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
    }
  }
};

module.exports = { resolvers };
