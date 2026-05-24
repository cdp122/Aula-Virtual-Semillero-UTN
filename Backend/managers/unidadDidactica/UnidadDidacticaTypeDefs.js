const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type ArchivoAdjunto {
    tipo: String
    url: String
    base64: String
  }

  input ArchivoAdjuntoInput {
    tipo: String
    url: String
    base64: String
  }

  type CriterioActividad {
    id_criterio: String!
    tipo: String
  }

  input CriterioActividadInput {
    id_criterio: String!
    tipo: String
  }

  type Actividad {
    id_actividad: String!
    tipo_actividad: String!
    descripcion_actividad: String!
    archivos_adjuntos: [ArchivoAdjunto!]!
    fecha_actividad: String
    activo: Boolean!
    criterios_evaluacion: [CriterioActividad!]!
  }

  input ActividadInput {
    id_actividad: String!
    tipo_actividad: String!
    descripcion_actividad: String!
    archivos_adjuntos: [ArchivoAdjuntoInput!]
    fecha_actividad: String
    activo: Boolean
    criterios_evaluacion: [CriterioActividadInput!]
  }

  type UnidadDidactica {
    _id: ID!
    ambito: String!
    objetivo_general: String!
    objetivos_aprendizaje: [String!]!
    destrezas: [String!]!
    tecnica_didactica: String
    fecha_inicio: String
    fecha_fin: String
    activo: Boolean!
    actividades: [Actividad!]!
  }

  input UnidadDidacticaInput {
    _id: ID
    ambito: String!
    objetivo_general: String!
    objetivos_aprendizaje: [String!]
    destrezas: [String!]
    tecnica_didactica: String
    fecha_inicio: String
    fecha_fin: String
    activo: Boolean
    actividades: [ActividadInput!]
  }

  input UnidadDidacticaActualizacionInput {
    ambito: String
    objetivo_general: String
    objetivos_aprendizaje: [String!]
    destrezas: [String!]
    tecnica_didactica: String
    fecha_inicio: String
    fecha_fin: String
    activo: Boolean
    actividades: [ActividadInput!]
  }

  extend type Query {
    unidadesDidacticas: [UnidadDidactica!]!
    unidadDidacticaPorId(id: ID!): UnidadDidactica
  }

  extend type Mutation {
    crearUnidadDidacticaCrud(input: UnidadDidacticaInput!): UnidadDidactica!
    actualizarUnidadDidactica(id: ID!, input: UnidadDidacticaActualizacionInput!): UnidadDidactica
    eliminarUnidadDidactica(id: ID!): Boolean!
  }
`;

module.exports = { typeDefs };
