const express = require('express');
const cors = require('cors');
const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');
const { typeDefs, resolvers } = require('../managers');

require('dotenv').config();

const obtenerUriMongo = () =>
  process.env.MONGO_URI || 'mongodb://localhost:27017/aula_virtual';

const iniciarServidorGraphQL = async () => {
  try {
    const app = express();
    app.use(cors());

    const servidor = new ApolloServer({
      typeDefs,
      resolvers
    });

    await servidor.start();
    servidor.applyMiddleware({ app, path: '/graphql' });

    const uriMongo = obtenerUriMongo();
    await mongoose.connect(uriMongo);

    const puerto = process.env.PORT || 4000;
    app.listen(puerto, () => {
      console.log(`Servidor GraphQL listo en http://localhost:${puerto}/graphql`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor GraphQL:', error.message);
    process.exit(1);
  }
};

module.exports = { iniciarServidorGraphQL };
