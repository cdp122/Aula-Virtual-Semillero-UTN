const { DescriptorModelo } = require('../../entities/descriptor/DescriptorModelo');

const resolvers = {
  Query: {
    descriptores: async () => DescriptorModelo.find().lean(),
    descriptorPorId: async (_, { id }) => DescriptorModelo.findById(id).lean()
  },
  Mutation: {
    crearDescriptor: async (_, { input }) => {
      try {
        const descriptor = new DescriptorModelo(input);
        return await descriptor.save();
      } catch (error) {
        throw new Error(`Error al crear descriptor: ${error.message}`);
      }
    },
    actualizarDescriptor: async (_, { id, input }) => {
      try {
        return await DescriptorModelo.findByIdAndUpdate(id, input, { new: true }).lean();
      } catch (error) {
        throw new Error(`Error al actualizar descriptor: ${error.message}`);
      }
    },
    eliminarDescriptor: async (_, { id }) => {
      try {
        const resultado = await DescriptorModelo.deleteOne({ _id: id });
        return resultado.deletedCount === 1;
      } catch (error) {
        throw new Error(`Error al eliminar descriptor: ${error.message}`);
      }
    }
  }
};

module.exports = { resolvers };
