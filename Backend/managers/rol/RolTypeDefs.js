const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Rol {
    _id: ID!
    nombre_rol: String!
    permisos_rol: JSON
    activo: Boolean!
  }

  input RolInput {
    _id: ID
    nombre_rol: String!
    permisos_rol: JSON
    activo: Boolean
  }

  input RolActualizacionInput {
    nombre_rol: String
    permisos_rol: JSON
    activo: Boolean
  }

  extend type Query {
    roles: [Rol!]!
    rolPorId(id: ID!): Rol
  }

  extend type Mutation {
    crearRol(input: RolInput!): Rol!
    actualizarRol(id: ID!, input: RolActualizacionInput!): Rol
    eliminarRol(id: ID!): Boolean!
  }
`;

module.exports = { typeDefs };
