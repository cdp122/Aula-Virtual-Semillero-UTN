import { gql } from 'graphql-tag';

/* ── Autenticación ─────────────────────────────── */
export const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $contrasena: String!) {
    login(username: $username, contrasena: $contrasena) {
      _id
      nombre
      username
      roles
      contacto {
        numero
        correo
      }
      activo
      hijos
      id_cursos
    }
  }
`;

/* ── Cursos ─────────────────────────────────────── */
export const OBTENER_CURSOS = gql`
  query ObtenerCursos {
    cursos {
      _id
      id_docente
      nombre_curso
      activo
      estudiantes {
        id_estudiante
        nombre
      }
    }
  }
`;

export const OBTENER_CURSO_POR_ID = gql`
  query ObtenerCursoPorId($id: ID!) {
    cursoPorId(id: $id) {
      _id
      id_docente
      nombre_curso
      activo
      estudiantes {
        id_estudiante
        nombre
      }
    }
  }
`;

export const CURSOS_POR_DOCENTE = gql`
  query CursosPorDocente($docenteId: ID!) {
    cursosPorDocente(docenteId: $docenteId) {
      _id
      id_docente
      nombre_curso
      activo
      estudiantes {
        id_estudiante
        nombre
      }
    }
  }
`;

export const CREAR_CURSO = gql`
  mutation CrearCurso($input: CursoInput!) {
    crearCurso(input: $input) {
      _id
      id_docente
      nombre_curso
      activo
      estudiantes {
        id_estudiante
        nombre
      }
    }
  }
`;

export const ACTUALIZAR_CURSO = gql`
  mutation ActualizarCurso($id: ID!, $input: CursoActualizacionInput!) {
    actualizarCurso(id: $id, input: $input) {
      _id
      id_docente
      nombre_curso
      activo
      estudiantes {
        id_estudiante
        nombre
      }
    }
  }
`;

export const ELIMINAR_CURSO = gql`
  mutation EliminarCurso($id: ID!) {
    eliminarCurso(id: $id)
  }
`;

/* ── Usuarios ──────────────────────────────────── */
export const OBTENER_USUARIOS = gql`
  query ObtenerUsuarios {
    usuarios {
      _id
      nombre
      username
      roles
      contacto {
        numero
        correo
      }
      activo
      hijos
      id_representante
      id_cursos
    }
  }
`;

export const OBTENER_USUARIO_POR_ID = gql`
  query ObtenerUsuarioPorId($id: ID!) {
    usuarioPorId(id: $id) {
      _id
      nombre
      username
      roles
      contacto {
        numero
        correo
      }
      activo
      hijos
      id_representante
      id_cursos
    }
  }
`;

export const CREAR_USUARIO = gql`
  mutation CrearUsuario($input: UsuarioInput!) {
    crearUsuario(input: $input) {
      _id
      nombre
      username
      roles
      contacto {
        numero
        correo
      }
      activo
      hijos
      id_representante
      id_cursos
    }
  }
`;

export const ACTUALIZAR_USUARIO = gql`
  mutation ActualizarUsuario($id: ID!, $input: UsuarioActualizacionInput!) {
    actualizarUsuario(id: $id, input: $input) {
      _id
      nombre
      username
      roles
      contacto {
        numero
        correo
      }
      activo
    }
  }
`;

export const ELIMINAR_USUARIO = gql`
  mutation EliminarUsuario($id: ID!) {
    eliminarUsuario(id: $id)
  }
`;

/* ── Unidades Didácticas ────────────────────────── */
export const OBTENER_UNIDADES_DIDACTICAS = gql`
  query ObtenerUnidadesDidacticas {
    unidadesDidacticas {
      _id
      ambito
      objetivo_general
      objetivos_aprendizaje
      destrezas
      semanas_previstas
      descripcion
      tecnica_didactica
      fecha_inicio
      fecha_fin
      activo
      actividades {
        id_actividad
        tipo_actividad
        descripcion_actividad
        fecha_actividad
        activo
        archivos_adjuntos {
          tipo
          url
        }
        criterios_evaluacion {
          id_criterio
          tipo
        }
      }
    }
  }
`;

export const CREAR_UNIDAD_DIDACTICA_CRUD = gql`
  mutation CrearUnidadDidacticaCrud($input: UnidadDidacticaInput!) {
    crearUnidadDidacticaCrud(input: $input) {
      _id
      ambito
      objetivo_general
      objetivos_aprendizaje
      destrezas
      semanas_previstas
      descripcion
      tecnica_didactica
      fecha_inicio
      fecha_fin
      activo
    }
  }
`;

/* ── Unidades Didácticas (adicionales) ─────────────── */
export const ACTUALIZAR_UNIDAD_DIDACTICA = gql`
  mutation ActualizarUnidadDidactica($id: ID!, $input: UnidadDidacticaActualizacionInput!) {
    actualizarUnidadDidactica(id: $id, input: $input) {
      _id
      ambito
      objetivo_general
      objetivos_aprendizaje
      destrezas
      semanas_previstas
      descripcion
      tecnica_didactica
      fecha_inicio
      fecha_fin
      activo
      actividades {
        id_actividad
        tipo_actividad
        descripcion_actividad
        fecha_actividad
        activo
        criterios_evaluacion {
          id_criterio
          tipo
        }
      }
    }
  }
`;

export const CLONAR_UNIDAD_DIDACTICA = gql`
  mutation ClonarUnidadDidactica($id: ID!) {
    clonarUnidadDidactica(id: $id) {
      _id
      ambito
      objetivo_general
      destrezas
      semanas_previstas
      tecnica_didactica
      activo
    }
  }
`;

export const ARCHIVAR_UNIDAD_DIDACTICA = gql`
  mutation ArchivarUnidadDidactica($id: ID!) {
    archivarUnidadDidactica(id: $id) {
      _id
      ambito
      activo
    }
  }
`;

/* ── Autoevaluación Docente ─────────────────────── */
export const OBTENER_AUTOEVALUACIONES_DOCENTES = gql`
  query ObtenerAutoevaluacionesDocentes {
    autoevaluacionesDocentes {
      _id
      id_actividad
      id_docente
      fecha_completado
      respuestas_formulario {
        pregunta
        respuesta
        reflexion
      }
    }
  }
`;

export const REGISTRAR_AUTOEVALUACION_DOCENTE = gql`
  mutation RegistrarAutoevaluacionDocente(
    $actividadId: ID!
    $docenteId: ID!
    $respuestasInput: [RespuestaAutoevaluacionInput!]!
  ) {
    registrarAutoevaluacionDocente(
      actividadId: $actividadId
      docenteId: $docenteId
      respuestasInput: $respuestasInput
    ) {
      _id
      fecha_completado
    }
  }
`;

/* ── Evaluaciones de Estudiantes ─────────────────── */
export const OBTENER_EVALUACIONES_ESTUDIANTE = gql`
  query ObtenerEvaluacionesEstudiante {
    evaluacionesEstudiantes {
      _id
      id_actividad
      id_estudiante
      historial_versiones {
        version
        fecha_registro
        docente_evaluador
        evaluaciones_criterio {
          id_criterio
          nivel_logro
          observaciones
        }
      }
      ficha_monitoreo {
        clasificacion
        seriacion
        asimilacion_acomodacion
        justificacion
        autoregulacion
        observaciones
        acciones_apoyo
      }
      actividades_casa_completadas {
        id_actividad
        comentario
        fecha
      }
    }
  }
`;

/* ── Progreso de Hijo ────────────────────────────── */
export const OBTENER_PROGRESO_HIJO = gql`
  query ObtenerProgresoHijo($estudianteId: ID!, $actividadId: ID!) {
    obtenerProgresoHijo(estudianteId: $estudianteId, actividadId: $actividadId) {
      id_estudiante
      id_actividad
      version
      fecha_registro
      evaluaciones_criterio {
        id_criterio
        nivel_logro
        observaciones
      }
      ficha_monitoreo {
        clasificacion
        seriacion
        asimilacion_acomodacion
        justificacion
        autoregulacion
        observaciones
        acciones_apoyo
      }
    }
  }
`;

/* ── Actividades de Casa ────────────────────────── */
export const OBTENER_ACTIVIDADES_CASA = gql`
  query ObtenerActividadesCasa($estudianteId: ID!) {
    obtenerActividadesCasa(estudianteId: $estudianteId) {
      unidad_id
      actividad {
        id_actividad
        tipo_actividad
        descripcion_actividad
        fecha_actividad
        activo
        archivos_adjuntos {
          tipo
          url
        }
      }
    }
  }
`;

/* ── Mutación para Actividades de Casa ───────────── */
export const MARCAR_ACTIVIDAD_COMPLETADA = gql`
  mutation MarcarActividadCompletada($estudianteId: ID!, $actividadId: ID!, $comentario: String) {
    marcarActividadCompletada(estudianteId: $estudianteId, actividadId: $actividadId, comentario: $comentario) {
      exito
      mensaje
    }
  }
`;

/* ── Mutaciones para Docentes (Seguimiento) ──────── */
export const REGISTRAR_NUEVA_VERSION_EVALUACION = gql`
  mutation RegistrarNuevaVersionEvaluacion(
    $id_evaluacion: ID!
    $docente_evaluador: String!
    $evaluaciones_criterio: [EvaluacionCriterioInput!]!
  ) {
    registrarNuevaVersionEvaluacion(
      id_evaluacion: $id_evaluacion
      docente_evaluador: $docente_evaluador
      evaluaciones_criterio: $evaluaciones_criterio
    ) {
      _id
      historial_versiones {
        version
        fecha_registro
        docente_evaluador
      }
    }
  }
`;

export const ACTUALIZAR_FICHA_MONITOREO_ESTUDIANTE = gql`
  mutation ActualizarFichaMonitoreoEstudiante(
    $id_evaluacion: ID!
    $ficha: FichaMonitoreoInput!
  ) {
    actualizarFichaMonitoreoEstudiante(id_evaluacion: $id_evaluacion, ficha: $ficha) {
      _id
      ficha_monitoreo {
        clasificacion
        seriacion
        asimilacion_acomodacion
        justificacion
        autoregulacion
        observaciones
        acciones_apoyo
      }
    }
  }
`;

