const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type EstudianteCurso {
    id_estudiante: String!
    nombre: String!
  }

  input EstudianteCursoInput {
    id_estudiante: String!
    nombre: String!
  }

  type Curso {
    _id: ID!
    id_docente: String!
    nombre_curso: String!
    activo: Boolean!
    estudiantes: [EstudianteCurso!]!
  }

  input CursoInput {
    _id: ID
    id_docente: String!
    nombre_curso: String!
    activo: Boolean
    estudiantes: [EstudianteCursoInput!]
  }

  input CursoActualizacionInput {
    id_docente: String
    nombre_curso: String
    activo: Boolean
    estudiantes: [EstudianteCursoInput!]
  }

  extend type Query {
    cursos: [Curso!]!
    cursoPorId(id: ID!): Curso
    cursosPorDocente(docenteId: ID!): [Curso!]!
  }

  extend type Mutation {
    crearCurso(input: CursoInput!): Curso!
    actualizarCurso(id: ID!, input: CursoActualizacionInput!): Curso
    eliminarCurso(id: ID!): Boolean!
  }
`;

module.exports = { typeDefs };
