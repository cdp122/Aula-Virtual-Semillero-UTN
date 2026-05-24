const {
  PreguntaAutoevaluacionModelo
} = require('../../entities/preguntaAutoevaluacion/PreguntaAutoevaluacionModelo');

const resolvers = {
  Query: {
    preguntasAutoevaluacion: async () => PreguntaAutoevaluacionModelo.find().lean(),
    preguntaAutoevaluacionPorId: async (_, { id }) =>
      PreguntaAutoevaluacionModelo.findById(id).lean()
  },
  Mutation: {
    crearPreguntaAutoevaluacion: async (_, { input }) => {
      try {
        const pregunta = new PreguntaAutoevaluacionModelo(input);
        return await pregunta.save();
      } catch (error) {
        throw new Error(`Error al crear pregunta: ${error.message}`);
      }
    },
    actualizarPreguntaAutoevaluacion: async (_, { id, input }) => {
      try {
        return await PreguntaAutoevaluacionModelo.findByIdAndUpdate(id, input, { new: true }).lean();
      } catch (error) {
        throw new Error(`Error al actualizar pregunta: ${error.message}`);
      }
    },
    eliminarPreguntaAutoevaluacion: async (_, { id }) => {
      try {
        const resultado = await PreguntaAutoevaluacionModelo.deleteOne({ _id: id });
        return resultado.deletedCount === 1;
      } catch (error) {
        throw new Error(`Error al eliminar pregunta: ${error.message}`);
      }
    }
  }
};

module.exports = { resolvers };
