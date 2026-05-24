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
