const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type ReporteGrupal {
    iniciado: Int!
    en_proceso: Int!
    logrado: Int!
    total: Int!
  }

  type ProgresoHijo {
    id_estudiante: ID!
    id_actividad: ID!
    version: Int!
    fecha_registro: String
    evaluaciones_criterio: [EvaluacionCriterio!]!
    ficha_monitoreo: FichaMonitoreo
  }

  type ActividadCasa {
    unidad_id: ID!
    actividad: Actividad!
  }

  extend type Query {
    obtenerProgresoHijo(estudianteId: ID!, actividadId: ID!): ProgresoHijo
    obtenerActividadesCasa(estudianteId: ID!): [ActividadCasa!]!
    obtenerReporteGrupal(cursoId: ID!, actividadId: ID!): ReporteGrupal
  }

  extend type Mutation {
    login(username: String!, contrasena: String!): Usuario
    crearUnidadDidactica(input: UnidadDidacticaInput!): UnidadDidactica!
    agregarActividadAUnidad(unidadId: ID!, input: ActividadInput!): UnidadDidactica
    registrarEvaluacion(
      estudianteId: ID!
      actividadId: ID!
      docenteId: ID!
      criteriosInput: [EvaluacionCriterioInput!]!
      fichaInput: FichaMonitoreoInput!
    ): EvaluacionEstudiante
    registrarAutoevaluacionDocente(
      actividadId: ID!
      docenteId: ID!
      respuestasInput: [RespuestaAutoevaluacionInput!]!
    ): AutoevaluacionDocente!
    marcarActividadCompletada(
      estudianteId: ID!
      actividadId: ID!
      comentario: String
    ): RespuestaOperacion!
  }
`;

module.exports = { typeDefs };
