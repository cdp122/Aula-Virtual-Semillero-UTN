const { UsuarioModelo } = require('../../entities/usuario/UsuarioModelo');

const resolvers = {
  Query: {
    usuarios: async () => UsuarioModelo.find().lean(),
    usuarioPorId: async (_, { id }) => UsuarioModelo.findById(id).lean()
  },
  Usuario: {
    hijos: (parent) => parent.hijos || [],
    id_cursos: (parent) => parent.id_cursos || [],
    roles: (parent) => parent.roles || []
  },
  Mutation: {
    crearUsuario: async (_, { input }) => {
      try {
        const usuario = new UsuarioModelo(input);
        return await usuario.save();
      } catch (error) {
        throw new Error(`Error al crear usuario: ${error.message}`);
      }
    },
    actualizarUsuario: async (_, { id, input }) => {
      try {
        return await UsuarioModelo.findByIdAndUpdate(id, input, { new: true }).lean();
      } catch (error) {
        throw new Error(`Error al actualizar usuario: ${error.message}`);
      }
    },
    eliminarUsuario: async (_, { id }) => {
      try {
        const resultado = await UsuarioModelo.deleteOne({ _id: id });
        return resultado.deletedCount === 1;
      } catch (error) {
        throw new Error(`Error al eliminar usuario: ${error.message}`);
      }
    }
  }
};

module.exports = { resolvers };
