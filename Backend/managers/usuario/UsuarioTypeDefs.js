const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Contacto {
    numero: String
    correo: String
  }

  input ContactoInput {
    numero: String
    correo: String
  }

  type Usuario {
    _id: ID!
    nombre: String!
    username: String!
    contrasena: String
    roles: [String!]!
    contacto: Contacto
    activo: Boolean!
    hijos: [String!]
    id_representante: String
    id_cursos: [String!]
  }

  input UsuarioInput {
    _id: ID
    nombre: String!
    username: String!
    contrasena: String
    roles: [String!]
    contacto: ContactoInput
    activo: Boolean
    hijos: [String!]
    id_representante: String
    id_cursos: [String!]
  }

  input UsuarioActualizacionInput {
    nombre: String
    username: String
    contrasena: String
    roles: [String!]
    contacto: ContactoInput
    activo: Boolean
    hijos: [String!]
    id_representante: String
    id_cursos: [String!]
  }

  extend type Query {
    usuarios: [Usuario!]!
    usuarioPorId(id: ID!): Usuario
  }

  extend type Mutation {
    crearUsuario(input: UsuarioInput!): Usuario!
    actualizarUsuario(id: ID!, input: UsuarioActualizacionInput!): Usuario
    eliminarUsuario(id: ID!): Boolean!
  }
`;

module.exports = { typeDefs };
