const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type PreguntaAutoevaluacion {
    _id: ID!
    pregunta: String!
    activo: Boolean!
  }

  input PreguntaAutoevaluacionInput {
    _id: ID
    pregunta: String!
    activo: Boolean
  }

  input PreguntaAutoevaluacionActualizacionInput {
    pregunta: String
    activo: Boolean
  }

  extend type Query {
    preguntasAutoevaluacion: [PreguntaAutoevaluacion!]!
    preguntaAutoevaluacionPorId(id: ID!): PreguntaAutoevaluacion
  }

  extend type Mutation {
    crearPreguntaAutoevaluacion(input: PreguntaAutoevaluacionInput!): PreguntaAutoevaluacion!
    actualizarPreguntaAutoevaluacion(
      id: ID!
      input: PreguntaAutoevaluacionActualizacionInput!
    ): PreguntaAutoevaluacion
    eliminarPreguntaAutoevaluacion(id: ID!): Boolean!
  }
`;

module.exports = { typeDefs };
