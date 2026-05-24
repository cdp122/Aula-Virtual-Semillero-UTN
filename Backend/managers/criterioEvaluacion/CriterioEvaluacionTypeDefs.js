const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type CriterioEvaluacion {
    _id: ID!
    tipo_criterio: String!
    descripcion_criterio: String
    activo: Boolean!
  }

  input CriterioEvaluacionInput {
    _id: ID
    tipo_criterio: String!
    descripcion_criterio: String
    activo: Boolean
  }

  input CriterioEvaluacionActualizacionInput {
    tipo_criterio: String
    descripcion_criterio: String
    activo: Boolean
  }

  extend type Query {
    criteriosEvaluacion: [CriterioEvaluacion!]!
    criterioEvaluacionPorId(id: ID!): CriterioEvaluacion
  }

  extend type Mutation {
    crearCriterioEvaluacion(input: CriterioEvaluacionInput!): CriterioEvaluacion!
    actualizarCriterioEvaluacion(
      id: ID!
      input: CriterioEvaluacionActualizacionInput!
    ): CriterioEvaluacion
    eliminarCriterioEvaluacion(id: ID!): Boolean!
  }
`;

module.exports = { typeDefs };
