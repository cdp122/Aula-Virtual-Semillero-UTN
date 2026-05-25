const express = require('express');
const cors = require('cors');
const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { typeDefs, resolvers } = require('../managers');
const { UsuarioModelo } = require('../entities/usuario/UsuarioModelo');

require('dotenv').config();

const obtenerUriMongo = () =>
  process.env.MONGO_URI || 'mongodb://localhost:27017/aula_virtual';

const JWT_SECRET = process.env.JWT_SECRET || 'secretkey_semilleros_utn_2026';

const iniciarServidorGraphQL = async () => {
  try {
    const app = express();
    app.use(cors());
    app.use(express.json());

    // Endpoint REST para autenticación con JWT
    app.post('/auth/login', async (req, res) => {
      try {
        const { username, contrasena } = req.body;
        if (!username || !contrasena) {
          return res.status(400).json({ mensaje: 'Usuario y contraseña son requeridos' });
        }

        const usuario = await UsuarioModelo.findOne({ username, contrasena }).lean();
        if (!usuario || !usuario.activo) {
          return res.status(401).json({ mensaje: 'Usuario o contraseña incorrectos' });
        }

        // Firmar JWT
        const token = jwt.sign(
          { id: usuario._id, roles: usuario.roles, nombre: usuario.nombre },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        return res.json({
          token,
          usuario: {
            _id: usuario._id,
            nombre: usuario.nombre,
            username: usuario.username,
            roles: usuario.roles,
            contacto: usuario.contacto,
            activo: usuario.activo,
            hijos: usuario.hijos || [],
            id_cursos: usuario.id_cursos || []
          }
        });
      } catch (error) {
        console.error('Error en /auth/login:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor' });
      }
    });

    const servidor = new ApolloServer({
      typeDefs,
      resolvers,
      context: ({ req }) => {
        const authHeader = req.headers.authorization || '';
        if (authHeader.startsWith('Bearer ')) {
          const token = authHeader.substring(7);
          try {
            const decoded = jwt.verify(token, JWT_SECRET);
            return { usuarioAutenticado: decoded };
          } catch (err) {
            // Token inválido o expirado
          }
        }
        return {};
      }
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

