const { UnidadDidacticaModelo } = require('../../entities/unidadDidactica/UnidadDidacticaModelo');

const resolvers = {
  Query: {
    unidadesDidacticas: async () => UnidadDidacticaModelo.find().lean(),
    unidadDidacticaPorId: async (_, { id }) => UnidadDidacticaModelo.findById(id).lean()
  },
  Mutation: {
    crearUnidadDidacticaCrud: async (_, { input }) => {
      try {
        const unidad = new UnidadDidacticaModelo(input);
        return await unidad.save();
      } catch (error) {
        throw new Error(`Error al crear unidad didactica: ${error.message}`);
      }
    },
    actualizarUnidadDidactica: async (_, { id, input }) => {
      try {
        return await UnidadDidacticaModelo.findByIdAndUpdate(id, input, { new: true }).lean();
      } catch (error) {
        throw new Error(`Error al actualizar unidad didactica: ${error.message}`);
      }
    },
    eliminarUnidadDidactica: async (_, { id }) => {
      try {
        const resultado = await UnidadDidacticaModelo.deleteOne({ _id: id });
        return resultado.deletedCount === 1;
      } catch (error) {
        throw new Error(`Error al eliminar unidad didactica: ${error.message}`);
      }
    }
  }
};

module.exports = { resolvers };
