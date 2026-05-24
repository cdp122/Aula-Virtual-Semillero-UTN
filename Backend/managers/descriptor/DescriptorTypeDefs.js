const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Descriptor {
    _id: ID!
    descripcion_descriptores: String!
    activo: Boolean!
  }

  input DescriptorInput {
    _id: ID
    descripcion_descriptores: String!
    activo: Boolean
  }

  input DescriptorActualizacionInput {
    descripcion_descriptores: String
    activo: Boolean
  }

  extend type Query {
    descriptores: [Descriptor!]!
    descriptorPorId(id: ID!): Descriptor
  }

  extend type Mutation {
    crearDescriptor(input: DescriptorInput!): Descriptor!
    actualizarDescriptor(id: ID!, input: DescriptorActualizacionInput!): Descriptor
    eliminarDescriptor(id: ID!): Boolean!
  }
`;

module.exports = { typeDefs };
