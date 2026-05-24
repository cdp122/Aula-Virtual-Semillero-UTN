const { RolModelo } = require('../../entities/rol/RolModelo');

const resolvers = {
  Query: {
    roles: async () => RolModelo.find().lean(),
    rolPorId: async (_, { id }) => RolModelo.findById(id).lean()
  },
  Mutation: {
    crearRol: async (_, { input }) => {
      try {
        const rol = new RolModelo(input);
        return await rol.save();
      } catch (error) {
        throw new Error(`Error al crear rol: ${error.message}`);
      }
    },
    actualizarRol: async (_, { id, input }) => {
      try {
        return await RolModelo.findByIdAndUpdate(id, input, { new: true }).lean();
      } catch (error) {
        throw new Error(`Error al actualizar rol: ${error.message}`);
      }
    },
    eliminarRol: async (_, { id }) => {
      try {
        const resultado = await RolModelo.deleteOne({ _id: id });
        return resultado.deletedCount === 1;
      } catch (error) {
        throw new Error(`Error al eliminar rol: ${error.message}`);
      }
    }
  }
};

module.exports = { resolvers };
