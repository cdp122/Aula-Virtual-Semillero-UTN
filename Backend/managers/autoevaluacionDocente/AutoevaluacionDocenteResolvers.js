const {
  AutoevaluacionDocenteModelo
} = require('../../entities/autoevaluacionDocente/AutoevaluacionDocenteModelo');

const resolvers = {
  Query: {
    autoevaluacionesDocentes: async () => AutoevaluacionDocenteModelo.find().lean(),
    autoevaluacionDocentePorId: async (_, { id }) =>
      AutoevaluacionDocenteModelo.findById(id).lean()
  },
  Mutation: {
    crearAutoevaluacionDocente: async (_, { input }) => {
      try {
        const autoevaluacion = new AutoevaluacionDocenteModelo(input);
        return await autoevaluacion.save();
      } catch (error) {
        throw new Error(`Error al crear autoevaluacion: ${error.message}`);
      }
    },
    actualizarAutoevaluacionDocente: async (_, { id, input }) => {
      try {
        return await AutoevaluacionDocenteModelo.findByIdAndUpdate(id, input, { new: true }).lean();
      } catch (error) {
        throw new Error(`Error al actualizar autoevaluacion: ${error.message}`);
      }
    },
    eliminarAutoevaluacionDocente: async (_, { id }) => {
      try {
        const resultado = await AutoevaluacionDocenteModelo.deleteOne({ _id: id });
        return resultado.deletedCount === 1;
      } catch (error) {
        throw new Error(`Error al eliminar autoevaluacion: ${error.message}`);
      }
    }
  }
};

module.exports = { resolvers };
