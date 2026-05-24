const { CursoModelo } = require('../../entities/curso/CursoModelo');

const resolvers = {
  Query: {
    cursos: async () => CursoModelo.find().lean(),
    cursoPorId: async (_, { id }) => CursoModelo.findById(id).lean()
  },
  Mutation: {
    crearCurso: async (_, { input }) => {
      try {
        const curso = new CursoModelo(input);
        return await curso.save();
      } catch (error) {
        throw new Error(`Error al crear curso: ${error.message}`);
      }
    },
    actualizarCurso: async (_, { id, input }) => {
      try {
        return await CursoModelo.findByIdAndUpdate(id, input, { new: true }).lean();
      } catch (error) {
        throw new Error(`Error al actualizar curso: ${error.message}`);
      }
    },
    eliminarCurso: async (_, { id }) => {
      try {
        const resultado = await CursoModelo.deleteOne({ _id: id });
        return resultado.deletedCount === 1;
      } catch (error) {
        throw new Error(`Error al eliminar curso: ${error.message}`);
      }
    }
  }
};

module.exports = { resolvers };
