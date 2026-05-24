const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Nivel {
    _id: ID!
    descripcion_nivel: String!
    activo: Boolean!
  }

  input NivelInput {
    _id: ID
    descripcion_nivel: String!
    activo: Boolean
  }

  input NivelActualizacionInput {
    descripcion_nivel: String
    activo: Boolean
  }

  extend type Query {
    niveles: [Nivel!]!
    nivelPorId(id: ID!): Nivel
  }

  extend type Mutation {
    crearNivel(input: NivelInput!): Nivel!
    actualizarNivel(id: ID!, input: NivelActualizacionInput!): Nivel
    eliminarNivel(id: ID!): Boolean!
  }
`;

module.exports = { typeDefs };
