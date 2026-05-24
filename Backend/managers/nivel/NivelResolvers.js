const { NivelModelo } = require('../../entities/nivel/NivelModelo');

const resolvers = {
  Query: {
    niveles: async () => NivelModelo.find().lean(),
    nivelPorId: async (_, { id }) => NivelModelo.findById(id).lean()
  },
  Mutation: {
    crearNivel: async (_, { input }) => {
      try {
        const nivel = new NivelModelo(input);
        return await nivel.save();
      } catch (error) {
        throw new Error(`Error al crear nivel: ${error.message}`);
      }
    },
    actualizarNivel: async (_, { id, input }) => {
      try {
        return await NivelModelo.findByIdAndUpdate(id, input, { new: true }).lean();
      } catch (error) {
        throw new Error(`Error al actualizar nivel: ${error.message}`);
      }
    },
    eliminarNivel: async (_, { id }) => {
      try {
        const resultado = await NivelModelo.deleteOne({ _id: id });
        return resultado.deletedCount === 1;
      } catch (error) {
        throw new Error(`Error al eliminar nivel: ${error.message}`);
      }
    }
  }
};

module.exports = { resolvers };
