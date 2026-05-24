const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type RespuestaAutoevaluacion {
    pregunta: String!
    respuesta: String!
    reflexion: String
  }

  input RespuestaAutoevaluacionInput {
    pregunta: String!
    respuesta: String!
    reflexion: String
  }

  type AutoevaluacionDocente {
    _id: ID!
    id_actividad: String!
    id_docente: String!
    fecha_completado: String!
    respuestas_formulario: [RespuestaAutoevaluacion!]!
  }

  input AutoevaluacionDocenteInput {
    _id: ID
    id_actividad: String!
    id_docente: String!
    fecha_completado: String!
    respuestas_formulario: [RespuestaAutoevaluacionInput!]
  }

  input AutoevaluacionDocenteActualizacionInput {
    fecha_completado: String
    respuestas_formulario: [RespuestaAutoevaluacionInput!]
  }

  extend type Query {
    autoevaluacionesDocentes: [AutoevaluacionDocente!]!
    autoevaluacionDocentePorId(id: ID!): AutoevaluacionDocente
  }

  extend type Mutation {
    crearAutoevaluacionDocente(input: AutoevaluacionDocenteInput!): AutoevaluacionDocente!
    actualizarAutoevaluacionDocente(
      id: ID!
      input: AutoevaluacionDocenteActualizacionInput!
    ): AutoevaluacionDocente
    eliminarAutoevaluacionDocente(id: ID!): Boolean!
  }
`;

module.exports = { typeDefs };
