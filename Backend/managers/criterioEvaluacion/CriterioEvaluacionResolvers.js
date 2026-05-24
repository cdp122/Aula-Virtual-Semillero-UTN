const {
  CriterioEvaluacionModelo
} = require('../../entities/criterioEvaluacion/CriterioEvaluacionModelo');

const resolvers = {
  Query: {
    criteriosEvaluacion: async () => CriterioEvaluacionModelo.find().lean(),
    criterioEvaluacionPorId: async (_, { id }) =>
      CriterioEvaluacionModelo.findById(id).lean()
  },
  Mutation: {
    crearCriterioEvaluacion: async (_, { input }) => {
      try {
        const criterio = new CriterioEvaluacionModelo(input);
        return await criterio.save();
      } catch (error) {
        throw new Error(`Error al crear criterio: ${error.message}`);
      }
    },
    actualizarCriterioEvaluacion: async (_, { id, input }) => {
      try {
        return await CriterioEvaluacionModelo.findByIdAndUpdate(id, input, { new: true }).lean();
      } catch (error) {
        throw new Error(`Error al actualizar criterio: ${error.message}`);
      }
    },
    eliminarCriterioEvaluacion: async (_, { id }) => {
      try {
        const resultado = await CriterioEvaluacionModelo.deleteOne({ _id: id });
        return resultado.deletedCount === 1;
      } catch (error) {
        throw new Error(`Error al eliminar criterio: ${error.message}`);
      }
    }
  }
};

module.exports = { resolvers };
