// =============================================================================
// SCRIPT DE INICIALIZACIÓN (SEED) PARA MONGODB - PROYECTO SEMILLERO UTN 2026
// =============================================================================

// Seleccionar la base de datos del proyecto
//db = db.getSiblingDb('aula_virtual');

// Limpiar colecciones previas para garantizar idoneidad en el desarrollo
db.roles.drop();
db.criterios_evaluacion.drop();
db.niveles.drop();
db.descriptores.drop();
db.preguntas_autoevaluacion.drop();
db.usuarios.drop();
db.cursos.drop();
db.unidades_didacticas.drop();
db.evaluaciones_estudiantes.drop();
db.autoevaluaciones_docentes.drop();

// =============================================================================
// 0. COLECCIONES BASE (Catalogos y configuracion inicial)
// =============================================================================
db.roles.insertMany([
  {
    "_id": "rol-doc",
    "nombre_rol": "Docente",
    "permisos_rol": {
      "USUARIO": { "LEER": true },
      "CURSO": { "CREAR": true, "LEER": true, "ACTUALIZAR": true }
    },
    "activo": true
  },
  {
    "_id": "rol-padre",
    "nombre_rol": "Padre",
    "permisos_rol": {
      "USUARIO": { "LEER": true },
      "CURSO": { "LEER": true }
    },
    "activo": true
  },
  {
    "_id": "rol-est",
    "nombre_rol": "Estudiante",
    "permisos_rol": {
      "CURSO": { "LEER": true }
    },
    "activo": true
  }
]);

db.criterios_evaluacion.insertMany([
  {
    "_id": "crit-001",
    "tipo_criterio": "Clasificacion de Informacion",
    "descripcion_criterio": "Identifica y clasifica informacion relevante.",
    "activo": true
  },
  {
    "_id": "crit-002",
    "tipo_criterio": "Seriacion y Ordenamiento",
    "descripcion_criterio": "Ordena secuencias y patrones simples.",
    "activo": true
  }
]);

db.niveles.insertMany([
  { "_id": "niv-ini", "descripcion_nivel": "INICIADO", "activo": true },
  { "_id": "niv-pro", "descripcion_nivel": "EN PROCESO", "activo": true },
  { "_id": "niv-log", "descripcion_nivel": "LOGRADO", "activo": true }
]);

db.descriptores.insertMany([
  {
    "_id": "desc-001",
    "descripcion_descriptores": "Reconoce personas seguras en el entorno.",
    "activo": true
  },
  {
    "_id": "desc-002",
    "descripcion_descriptores": "Aplica normas basicas de seguridad.",
    "activo": true
  }
]);

db.preguntas_autoevaluacion.insertMany([
  {
    "_id": "preg-001",
    "pregunta": "1. ¿Provocaron las actividades un conflicto cognitivo que desafiara sus esquemas previos?",
    "activo": true
  },
  {
    "_id": "preg-002",
    "pregunta": "2. ¿Se priorizo el uso de material concreto antes de pasar a representaciones abstractas?",
    "activo": true
  },
  {
    "_id": "preg-003",
    "pregunta": "3. ¿El lenguaje utilizado fue adecuado para el nivel de egocentrismo del nino?",
    "activo": true
  },
  {
    "_id": "preg-004",
    "pregunta": "4. ¿Se permitio que el nino descubriera la solucion por si mismo?",
    "activo": true
  }
]);

// =============================================================================
// 1. COLECCIÓN: USUARIOS (Implementando el Polimorfismo NoSQL)
// =============================================================================
db.usuarios.insertMany([
  {
    "_id": "usr-doc-001",
    "nombre": "Gladys Confecciones (Docente UTN)",
    "username": "gladys.doc",
    "contrasena": "$2b$10$rXgH6Y7zK...", // Hash simulado de ejemplo
    "roles": ["rol-doc"],
    "contacto": { "numero": "0961234567", "correo": "gconfecciones@utn.edu.ec" },
    "activo": true
  },
  {
    "_id": "usr-pad-101",
    "nombre": "Carlos Puentestar (Representante)",
    "username": "carlos.padre",
    "contrasena": "$2b$10$yTfR8M1pX...",
    "roles": ["rol-padre"],
    "contacto": { "numero": "0998765432", "correo": "carlos.puentestar@mail.com" },
    "activo": true,
    "hijos": ["est-001"] // Vinculación directa con su hijo representado
  },
  {
    "_id": "usr-pad-102",
    "nombre": "Yajaira Lizbeth Quilumba",
    "username": "yajaira.padre",
    "contrasena": "$2b$10$pLmW2N4qV...",
    "roles": ["rol-padre"],
    "contacto": { "numero": "0987654321", "correo": "ylquilumba@mail.com" },
    "activo": true,
    "hijos": ["est-002"]
  },
  {
    "_id": "est-001",
    "nombre": "Pedrito Puentestar (Alumno)",
    "username": "pedrito.p",
    "roles": ["rol-est"],
    "activo": true,
    "id_representante": "usr-pad-101",
    "id_cursos": ["cur-inicial-4a"]
  },
  {
    "_id": "est-002",
    "nombre": "Mayuri Estefania Rivera (Alumna)",
    "username": "mayuri.r",
    "roles": ["rol-est"],
    "activo": true,
    "id_representante": "usr-pad-102",
    "id_cursos": ["cur-inicial-4a"]
  }
]);

// =============================================================================
// 2. COLECCIÓN: CURSOS (Aulas Virtuales Organizadas)
// =============================================================================
db.cursos.insertMany([
  { 
    "_id": "cur-inicial-4a",
    "id_docente": "usr-doc-001",
    "nombre_curso": "Cuarto Semestre - Educación Inicial - Aula A",
    "activo" : true,
    "estudiantes": [
      { "id_estudiante": "est-001", "nombre": "Pedrito Puentestar (Alumno)" },
      { "id_estudiante": "est-002", "nombre": "Mayuri Estefania Rivera (Alumna)" }
    ]
  }
]);

db.unidades_didacticas.insertMany([{
    "_id": "uni-did-001",
    "ambito": "Seguridad Personal",
    "objetivo_general": "Desarrollar en los niños la capacidad de identificar personas seguras e inseguras, promoviendo prácticas de seguridad personal en su entorno cotidiano.",
    "objetivos_aprendizaje": [
      "Reconocer características de personas seguras e inseguras en su entorno.",
      "Aplicar normas básicas de seguridad personal en situaciones cotidianas."
    ],
    "destrezas": [
      "Identificar a los miembros de su familia y personas cercanas, reconociendo quienes cuidan de él/ella.",
      "Practicar normas de seguridad que eviten el peligro en situaciones cotidianas."
    ],
    "tecnica_didactica": "Aprendizaje Basado en Problemas (ABP) y Modelamiento",
    "fecha_inicio": ISODate("2026-05-18"),
    "fecha_fin": ISODate("2026-06-19"),
    "activo" : true,
    "actividades": [
    {
        "id_actividad": "act-sem1-001",
        "tipo_actividad": "CLASE",
        "descripcion_actividad": "Los niños durante la primera semana van a investigar cuál es el tipo de persona con el que no les agradaría compartir y con las que ellos se sentirían seguros, identificando características físicas o gestuales.",
        "archivos_adjuntos": [{
            "tipo": "URL", "url": "https://www.youtube.com/watch?v=b2V5c1T2DEg"
        }],
        "fecha_actividad": ISODate("2026-05-19"),
        "activo": true,
        "criterios_evaluacion": [
            {
                "id_criterio": "crit-001",
                "tipo": "Clasificacion de Informacion"
            },
            {
                "id_criterio": "crit-002",
                "tipo": "Seriacion y Ordenamiento" 
            }
        ]
    }
]
      }
    ]);

// =============================================================================
// 4. COLECCIÓN: EVALUACIONES_ESTUDIANTES (Trazabilidad y Ficha de Monitoreo)
// =============================================================================
db.evaluaciones_estudiantes.insertMany([
  {
    "_id": "eval-est-001-act-sem1-001",
    "id_actividad": "act-sem1-001",
    "id_estudiante": "est-001",
    "historial_versiones": [
      {
        "version": 1,
        "fecha_registro": ISODate("2026-05-21T15:00:00Z"),
        "docente_evaluador": "usr-doc-001",
        "evaluaciones_criterio": [
          {
            "id_criterio": "crit-001",
            "nivel_logro": "EN PROCESO",
            "observaciones": "Identifica parcialmente personas seguras."
          },
          {
            "id_criterio": "crit-002",
            "nivel_logro": "INICIADO",
            "observaciones": "Requiere apoyo para ordenar informacion."
          }
        ]
      }
    ],
    "ficha_monitoreo": {
      "clasificacion": "EN PROCESO",
      "seriacion": "INICIADO",
      "asimilacion_acomodacion": "EN PROCESO",
      "justificacion": "Necesita refuerzo con ejemplos cercanos.",
      "autoregulacion": "EN PROCESO",
      "observaciones": "Participa con interes.",
      "acciones_apoyo": "Refuerzo con material visual."
    }
  }
]);

// =============================================================================
// 5. COLECCIÓN: AUTOEVALUACION_DOCENTE (Aislamiento de Seguridad Reflexiva)
// =============================================================================
db.autoevaluaciones_docentes.insertMany([
  {
    "_id": "auto-doc-001",
    "id_actividad": "act-sem1-001",
    "id_docente": "usr-doc-001",
    "fecha_completado": ISODate("2026-05-21T15:00:00Z"),
    "respuestas_formulario": [
      {
        "pregunta": "1. ¿Provocaron las actividades un conflicto cognitivo que desafiara sus esquemas previos?",
        "respuesta": "SI",
        "reflexion": "El uso de la lámina del desconocido con gabardina y gafas rompió la idea inicial que tenían de que las personas peligrosas solo portaban armas físicas."
      },
      {
        "pregunta": "2. ¿Se priorizó el uso de material concreto antes de pasar a representaciones abstractas?",
        "respuesta": "SI",
        "reflexion": "Trabajamos de forma excelente con los recortes colocados en la cartelera de la pared dividida en verde y rojo." 
      },
      {
        "pregunta": "3. ¿El lenguaje utilizado fue adecuado para el nivel de egocentrismo del niño?",
        "respuesta": "EN PROCESO",
        "reflexion": "Debo simplificar ciertos descriptores y enfocar más las analogías hacia sus propias mascotas en la transferencia." 
      },
      {
        "pregunta": "4. ¿Se permitió que el niño descubriera la solución por sí mismo (aprendizaje por descubrimiento)?",
        "respuesta": "SI",
        "reflexion": "Ellos mismos concluyeron que a un extraño no se le puede dar el nombre ni la dirección del hogar."
      }
    ]
  }
]);

print("¡Base de datos 'aula_virtual' inicializada con éxito con los datos requeridos!");