const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type EvaluacionCriterio {
    id_criterio: String!
    nivel_logro: String!
    observaciones: String
  }

  input EvaluacionCriterioInput {
    id_criterio: String!
    nivel_logro: String!
    observaciones: String
  }

  type HistorialVersion {
    version: Int!
    fecha_registro: String!
    docente_evaluador: String!
    evaluaciones_criterio: [EvaluacionCriterio!]!
  }

  input HistorialVersionInput {
    version: Int!
    fecha_registro: String!
    docente_evaluador: String!
    evaluaciones_criterio: [EvaluacionCriterioInput!]!
  }

  type FichaMonitoreo {
    clasificacion: String
    seriacion: String
    asimilacion_acomodacion: String
    justificacion: String
    autoregulacion: String
    observaciones: String
    acciones_apoyo: String
  }

  input FichaMonitoreoInput {
    clasificacion: String
    seriacion: String
    asimilacion_acomodacion: String
    justificacion: String
    autoregulacion: String
    observaciones: String
    acciones_apoyo: String
  }

  type ActividadCasaCompletada {
    id_actividad: String!
    comentario: String
    fecha: String!
  }

  input ActividadCasaCompletadaInput {
    id_actividad: String!
    comentario: String
    fecha: String!
  }

  type EvaluacionEstudiante {
    _id: ID!
    id_actividad: String!
    id_estudiante: String!
    historial_versiones: [HistorialVersion!]!
    ficha_monitoreo: FichaMonitoreo
    actividades_casa_completadas: [ActividadCasaCompletada!]!
  }

  input EvaluacionEstudianteInput {
    _id: ID
    id_actividad: String!
    id_estudiante: String!
    historial_versiones: [HistorialVersionInput!]
    ficha_monitoreo: FichaMonitoreoInput
    actividades_casa_completadas: [ActividadCasaCompletadaInput!]
  }

  input EvaluacionEstudianteActualizacionInput {
    historial_versiones: [HistorialVersionInput!]
    ficha_monitoreo: FichaMonitoreoInput
    actividades_casa_completadas: [ActividadCasaCompletadaInput!]
  }

  extend type Query {
    evaluacionesEstudiantes: [EvaluacionEstudiante!]!
    evaluacionEstudiantePorId(id: ID!): EvaluacionEstudiante
  }

  extend type Mutation {
    crearEvaluacionEstudiante(input: EvaluacionEstudianteInput!): EvaluacionEstudiante!
    actualizarEvaluacionEstudiante(
      id: ID!
      input: EvaluacionEstudianteActualizacionInput!
    ): EvaluacionEstudiante
    eliminarEvaluacionEstudiante(id: ID!): Boolean!
  }
`;

module.exports = { typeDefs };
