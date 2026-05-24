const { MongoClient } = require('mongodb');
require('dotenv').config();

const ejecutarSeed = async () => {
  let client;
  try {
    console.log('\n🌱 EJECUTANDO SEED DE MONGODB\n');
    
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/aula_virtual';
    client = new MongoClient(uri);
    await client.connect();
    
    const db = client.db('aula_virtual');
    
    console.log('🗑️  Limpiando colecciones previas...\n');
    await Promise.all([
      db.collection('roles').deleteMany({}),
      db.collection('criterios_evaluacion').deleteMany({}),
      db.collection('niveles').deleteMany({}),
      db.collection('descriptores').deleteMany({}),
      db.collection('preguntas_autoevaluacion').deleteMany({}),
      db.collection('usuarios').deleteMany({}),
      db.collection('cursos').deleteMany({}),
      db.collection('unidades_didacticas').deleteMany({}),
      db.collection('evaluaciones_estudiantes').deleteMany({}),
      db.collection('autoevaluaciones_docentes').deleteMany({})
    ]);
    
    // 0. ROLES
    console.log('📝 Insertando roles...');
    await db.collection('roles').insertMany([
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
    
    // 1. CRITERIOS DE EVALUACIÓN
    console.log('📝 Insertando criterios de evaluación...');
    await db.collection('criterios_evaluacion').insertMany([
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
    
    // 2. NIVELES
    console.log('📝 Insertando niveles...');
    await db.collection('niveles').insertMany([
      { "_id": "niv-ini", "descripcion_nivel": "INICIADO", "activo": true },
      { "_id": "niv-pro", "descripcion_nivel": "EN PROCESO", "activo": true },
      { "_id": "niv-log", "descripcion_nivel": "LOGRADO", "activo": true }
    ]);
    
    // 3. DESCRIPTORES
    console.log('📝 Insertando descriptores...');
    await db.collection('descriptores').insertMany([
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
    
    // 4. PREGUNTAS AUTOEVALUACIÓN
    console.log('📝 Insertando preguntas de autoevaluación...');
    await db.collection('preguntas_autoevaluacion').insertMany([
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
    
    // 5. USUARIOS
    console.log('📝 Insertando usuarios...');
    await db.collection('usuarios').insertMany([
      {
        "_id": "usr-doc-001",
        "nombre": "Gladys Confecciones (Docente UTN)",
        "username": "gladys.doc",
        "contrasena": "$2b$10$rXgH6Y7zK...",
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
        "hijos": ["est-001"]
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
    
    // 6. CURSOS
    console.log('📝 Insertando cursos...');
    await db.collection('cursos').insertMany([
      {
        "_id": "cur-inicial-4a",
        "id_docente": "usr-doc-001",
        "nombre_curso": "Cuarto Semestre - Educación Inicial - Aula A",
        "activo": true,
        "estudiantes": [
          { "id_estudiante": "est-001", "nombre": "Pedrito Puentestar (Alumno)" },
          { "id_estudiante": "est-002", "nombre": "Mayuri Estefania Rivera (Alumna)" }
        ]
      }
    ]);
    
    // 7. UNIDADES DIDÁCTICAS
    console.log('📝 Insertando unidades didácticas...');
    await db.collection('unidades_didacticas').insertMany([
      {
        "_id": "uni-did-001",
        "ambito": "Seguridad Personal",
        "objetivo_general": "Desarrollar en los niños la capacidad de identificar personas seguras e inseguras.",
        "objetivos_aprendizaje": [
          "Reconocer características de personas seguras e inseguras en su entorno.",
          "Aplicar normas básicas de seguridad personal en situaciones cotidianas."
        ],
        "destrezas": [
          "Identificar a los miembros de su familia y personas cercanas.",
          "Practicar normas de seguridad que eviten el peligro en situaciones cotidianas."
        ],
        "tecnica_didactica": "Aprendizaje Basado en Problemas (ABP) y Modelamiento",
        "fecha_inicio": new Date("2026-05-18"),
        "fecha_fin": new Date("2026-06-19"),
        "activo": true,
        "actividades": [
          {
            "id_actividad": "act-sem1-001",
            "tipo_actividad": "CLASE",
            "descripcion_actividad": "Los niños durante la primera semana van a investigar cuál es el tipo de persona con el que no les agradaría compartir.",
            "archivos_adjuntos": [{ "tipo": "URL", "url": "https://www.youtube.com/watch?v=b2V5c1T2DEg" }],
            "fecha_actividad": new Date("2026-05-19"),
            "activo": true,
            "criterios_evaluacion": [
              { "id_criterio": "crit-001", "tipo": "Clasificacion de Informacion" },
              { "id_criterio": "crit-002", "tipo": "Seriacion y Ordenamiento" }
            ]
          }
        ]
      }
    ]);
    
    // 8. EVALUACIONES ESTUDIANTES
    console.log('📝 Insertando evaluaciones de estudiantes...');
    await db.collection('evaluaciones_estudiantes').insertMany([
      {
        "_id": "eval-est-001-act-sem1-001",
        "id_actividad": "act-sem1-001",
        "id_estudiante": "est-001",
        "historial_versiones": [
          {
            "version": 1,
            "fecha_registro": new Date("2026-05-21T15:00:00Z"),
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
    
    // 9. AUTOEVALUACIONES DOCENTES
    console.log('📝 Insertando autoevaluaciones docentes...');
    await db.collection('autoevaluaciones_docentes').insertMany([
      {
        "_id": "auto-doc-001",
        "id_actividad": "act-sem1-001",
        "id_docente": "usr-doc-001",
        "fecha_completado": new Date("2026-05-21T15:00:00Z"),
        "respuestas_formulario": [
          {
            "pregunta": "1. ¿Provocaron las actividades un conflicto cognitivo que desafiara sus esquemas previos?",
            "respuesta": "SI",
            "reflexion": "El uso de la lámina rompió la idea inicial."
          },
          {
            "pregunta": "2. ¿Se priorizó el uso de material concreto antes de pasar a representaciones abstractas?",
            "respuesta": "SI",
            "reflexion": "Trabajamos de forma excelente con los recortes colocados en la cartelera."
          },
          {
            "pregunta": "3. ¿El lenguaje utilizado fue adecuado para el nivel de egocentrismo del niño?",
            "respuesta": "EN PROCESO",
            "reflexion": "Debo simplificar ciertos descriptores."
          },
          {
            "pregunta": "4. ¿Se permitió que el niño descubriera la solución por sí mismo?",
            "respuesta": "SI",
            "reflexion": "Ellos mismos concluyeron que a un extraño no se le puede dar el nombre."
          }
        ]
      }
    ]);
    
    console.log('\n✅ BASE DE DATOS INICIALIZADA CON ÉXITO\n');
    console.log('📊 Resumen de datos insertados:');
    console.log('  • 3 roles');
    console.log('  • 2 criterios de evaluación');
    console.log('  • 3 niveles');
    console.log('  • 2 descriptores');
    console.log('  • 4 preguntas de autoevaluación');
    console.log('  • 5 usuarios');
    console.log('  • 1 curso');
    console.log('  • 1 unidad didáctica');
    console.log('  • 1 evaluación de estudiante');
    console.log('  • 1 autoevaluación docente\n');
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    process.exit(1);
  } finally {
    if (client) await client.close();
  }
};

ejecutarSeed();
