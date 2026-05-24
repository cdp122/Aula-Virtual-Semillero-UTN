const { gql } = require('apollo-server-express');
const GraphQLJSON = require('graphql-type-json');

const typeDefs = gql`
  scalar JSON

  type RespuestaOperacion {
    exito: Boolean!
    mensaje: String
  }

  type Query {
    _vacio: String
  }

  type Mutation {
    _vacio: String
  }
`;

const resolvers = {
  JSON: GraphQLJSON
};

module.exports = { typeDefs, resolvers };
