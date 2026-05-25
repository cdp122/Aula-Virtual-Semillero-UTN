// =============================================================================
// SCRIPT DE GENERACIÓN DE DATOS MASIVOS PARA PRUEBAS (Semillero UTN 2026)
// =============================================================================
//
// Este script llena la base de datos con un volumen considerable de datos de prueba
// diseñados específicamente para validar todos los requisitos del sistema:
//
// 1. Autenticación REST + JWT (Todos los usuarios tienen la contraseña "1234").
// 2. Cuenta con múltiples hijos (El representante Carlos Puentestar tiene 2 hijos).
// 3. Trazabilidad de versiones (El alumno Pedrito tiene 3 versiones de evaluación en la actividad 1).
// 4. Comparativa de logros en el tiempo (Pedrito tiene evaluaciones en la semana 1 y 2).
// 5. Seguimiento Grupal (Muestra un reporte grupal consolidado con 20 alumnos).
// 6. Alerta de Refuerzo Grupal (El criterio 2 tiene >50% de alumnos en Iniciado/Sin Evaluar).
// 7. Actividades en Casa (Algunas marcadas como completadas con comentarios por el padre).
//
// Para ejecutarlo: node Backend/generar_datos_masivos.js
// =============================================================================

const { MongoClient } = require('mongodb');
require('dotenv').config();

const generarDatosMasivos = async () => {
  let client;
  try {
    console.log('\n🚀 GENERANDO DATOS MASIVOS PARA PRUEBAS EN MONGO\n');
    
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/aula_virtual';
    client = new MongoClient(uri);
    await client.connect();
    
    const db = client.db('aula_virtual');
    
    console.log('🗑️  Limpiando base de datos previa...');
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
      { _id: "rol-doc", nombre_rol: "Docente", activo: true },
      { _id: "rol-padre", nombre_rol: "Padre", activo: true },
      { _id: "rol-est", nombre_rol: "Estudiante", activo: true }
    ]);

    // 1. CRITERIOS DE EVALUACIÓN
    console.log('📝 Insertando criterios de evaluación...');
    await db.collection('criterios_evaluacion').insertMany([
      { _id: "crit-001", tipo_criterio: "Clasificacion de Informacion", descripcion_criterio: "Identifica y clasifica informacion relevante.", activo: true },
      { _id: "crit-002", tipo_criterio: "Seriacion y Ordenamiento", descripcion_criterio: "Ordena secuencias y patrones simples.", activo: true }
    ]);

    // 2. NIVELES
    console.log('📝 Insertando niveles...');
    await db.collection('niveles').insertMany([
      { _id: "niv-ini", descripcion_nivel: "INICIADO", activo: true },
      { _id: "niv-pro", descripcion_nivel: "EN PROCESO", activo: true },
      { _id: "niv-log", descripcion_nivel: "LOGRADO", activo: true }
    ]);

    // 3. DESCRIPTORES
    await db.collection('descriptores').insertMany([
      { _id: "desc-001", descripcion_descriptores: "Reconoce personas seguras en el entorno.", activo: true },
      { _id: "desc-002", descripcion_descriptores: "Aplica normas basicas de seguridad.", activo: true }
    ]);

    // 4. PREGUNTAS AUTOEVALUACIÓN
    await db.collection('preguntas_autoevaluacion').insertMany([
      { _id: "preg-001", pregunta: "1. ¿Provocaron las actividades un conflicto cognitivo que desafiara sus esquemas previos?", activo: true },
      { _id: "preg-002", pregunta: "2. ¿Se priorizo el uso de material concreto antes de pasar a representaciones abstractas?", activo: true }
    ]);

    // 5. GENERAR ALUMNOS Y REPRESENTANTES (20 de cada uno)
    console.log('📝 Generando 20 alumnos y representantes (carlos.padre tendrá múltiples hijos)...');
    
    const alumnos = [];
    const padres = [];
    
    // Alumno 1 y Alumno 2 serán hermanos (Hijos de Carlos Puentestar para probar el selector de múltiples hijos)
    padres.push({
      _id: "usr-pad-101",
      nombre: "Carlos Puentestar (Representante)",
      username: "carlos.padre",
      contrasena: "1234",
      roles: ["rol-padre"],
      contacto: { numero: "0998765432", correo: "carlos.puentestar@mail.com" },
      activo: true,
      hijos: ["est-001", "est-002"] // Múltiples hijos
    });

    alumnos.push({
      _id: "est-001",
      nombre: "Pedrito Puentestar (Alumno 1)",
      username: "pedrito.p",
      roles: ["rol-est"],
      activo: true,
      id_representante: "usr-pad-101",
      id_cursos: ["cur-inicial-4a"]
    });

    alumnos.push({
      _id: "est-002",
      nombre: "Juanito Puentestar (Alumno 2)",
      username: "juanito.p",
      roles: ["rol-est"],
      activo: true,
      id_representante: "usr-pad-101",
      id_cursos: ["cur-inicial-4a"]
    });

    // Alumnos del 3 al 20 (Cada uno con su respectivo padre)
    const nombresAlumnos = [
      "Ana García", "Carlos López", "María Rodríguez", "Luis Martínez", 
      "Sofia Pérez", "Diego Gómez", "Laura Sánchez", "José Díaz", 
      "Elena Fernández", "Miguel Torres", "Valentina Ramírez", "Andrés Cruz", 
      "Camila Morales", "Mateo Ortiz", "Isabella Flores", "Gabriel Castro", 
      "Daniela Silva", "Lucas Romero"
    ];

    const nombresPadres = [
      "Roberto García", "Lucía López", "Patricia Rodríguez", "Jorge Martínez", 
      "Gabriela Pérez", "Fernando Gómez", "Marta Sánchez", "Francisco Díaz", 
      "Carmen Fernández", "Ángel Torres", "Beatriz Ramírez", "Raúl Cruz", 
      "Diana Morales", "Hugo Ortiz", "Inés Flores", "Julio Castro", 
      "Silvia Silva", "Mario Romero"
    ];

    for (let i = 0; i < nombresAlumnos.length; i++) {
      const idx = i + 3;
      const idEst = `est-00${idx}`;
      const idPad = `usr-pad-10${idx}`;

      padres.push({
        _id: idPad,
        nombre: `${nombresPadres[i]} (Representante)`,
        username: `padre.${nombresAlumnos[i].toLowerCase().split(' ')[0]}`,
        contrasena: "1234",
        roles: ["rol-padre"],
        contacto: { numero: `09910000${idx}`, correo: `${nombresAlumnos[i].toLowerCase().split(' ')[0]}@mail.com` },
        activo: true,
        hijos: [idEst]
      });

      alumnos.push({
        _id: idEst,
        nombre: `${nombresAlumnos[i]} (Alumno)`,
        username: `${nombresAlumnos[i].toLowerCase().replace(' ', '.')}`,
        roles: ["rol-est"],
        activo: true,
        id_representante: idPad,
        id_cursos: ["cur-inicial-4a"]
      });
    }

    // Insertar Docente
    const docente = {
      _id: "usr-doc-001",
      nombre: "Gladys Confecciones (Docente UTN)",
      username: "gladys.doc",
      contrasena: "1234",
      roles: ["rol-doc"],
      contacto: { numero: "0961234567", correo: "gconfecciones@utn.edu.ec" },
      activo: true
    };

    await db.collection('usuarios').insertMany([docente, ...padres, ...alumnos]);

    // 6. CURSO
    console.log('📝 Insertando curso...');
    await db.collection('cursos').insertOne({
      _id: "cur-inicial-4a",
      id_docente: "usr-doc-001",
      nombre_curso: "Cuarto Semestre - Educación Inicial - Aula A",
      activo: true,
      estudiantes: alumnos.map(a => ({ id_estudiante: a._id, nombre: a.nombre }))
    });

    // 7. UNIDADES DIDÁCTICAS Y ACTIVIDADES (2 unidades con actividades CLASE y CASA)
    console.log('📝 Insertando unidades didácticas y actividades...');
    await db.collection('unidades_didacticas').insertMany([
      {
        _id: "uni-did-001",
        ambito: "Seguridad Personal",
        objetivo_general: "Desarrollar en los niños la capacidad de identificar personas seguras e inseguras.",
        objetivos_aprendizaje: ["Reconocer características de personas seguras e inseguras en su entorno."],
        destrezas: ["Identificar a los miembros de su familia y personas cercanas."],
        tecnica_didactica: "Modelamiento",
        fecha_inicio: new Date("2026-05-18"),
        fecha_fin: new Date("2026-05-24"),
        activo: true,
        actividades: [
          {
            id_actividad: "act-sem1-001",
            tipo_actividad: "CLASE",
            descripcion_actividad: "Semana 1 Clase: Investigar personas seguras e inseguras mediante imágenes.",
            archivos_adjuntos: [{ tipo: "URL", url: "https://www.youtube.com/watch?v=b2V5c1T2DEg" }],
            fecha_actividad: new Date("2026-05-19"),
            activo: true,
            criterios_evaluacion: [
              { id_criterio: "crit-001", tipo: "Clasificacion de Informacion" },
              { id_criterio: "crit-002", tipo: "Seriacion y Ordenamiento" }
            ]
          },
          {
            id_actividad: "act-sem1-002",
            tipo_actividad: "CASA",
            descripcion_actividad: "Semana 1 Casa: Dibujar el círculo de seguridad familiar en el hogar.",
            archivos_adjuntos: [],
            fecha_actividad: new Date("2026-05-20"),
            activo: true,
            criterios_evaluacion: []
          }
        ]
      },
      {
        _id: "uni-did-002",
        ambito: "Reconocimiento del Entorno",
        objetivo_general: "Reconocer zonas de riesgo y zonas seguras dentro y fuera del aula.",
        objetivos_aprendizaje: ["Clasificar objetos y zonas peligrosas."],
        destrezas: ["Seguir instrucciones de evacuación simples."],
        tecnica_didactica: "Aprendizaje Basado en Juego",
        fecha_inicio: new Date("2026-05-25"),
        fecha_fin: new Date("2026-06-01"),
        activo: true,
        actividades: [
          {
            id_actividad: "act-sem2-001",
            tipo_actividad: "CLASE",
            descripcion_actividad: "Semana 2 Clase: Mapa interactivo de zonas de riesgo del centro educativo.",
            archivos_adjuntos: [],
            fecha_actividad: new Date("2026-05-26"),
            activo: true,
            criterios_evaluacion: [
              { id_criterio: "crit-001", tipo: "Clasificacion de Informacion" }
            ]
          }
        ]
      }
    ]);

    // 8. EVALUACIONES DE ESTUDIANTES (Con historial y alertas grupales)
    console.log('📝 Generando historial de evaluaciones (Pedrito tendrá 3 versiones)...');

    const evaluacionesEstudiantes = [];

    // --- ALUMNO 1 (Pedrito): Historial de versiones y avance en el tiempo ---
    // Actividad 1 (3 versiones para verificar trazabilidad inmutable - RF-D04 y RNF-06)
    evaluacionesEstudiantes.push({
      _id: "eval-est-001-act-sem1-001",
      id_actividad: "act-sem1-001",
      id_estudiante: "est-001",
      historial_versiones: [
        {
          version: 1,
          fecha_registro: new Date("2026-05-19T10:00:00Z"),
          docente_evaluador: "usr-doc-001",
          evaluaciones_criterio: [
            { id_criterio: "crit-001", nivel_logro: "INICIADO", observaciones: "Le cuesta clasificar personas seguras." },
            { id_criterio: "crit-002", nivel_logro: "INICIADO", observaciones: "No logra ordenar secuencias." }
          ]
        },
        {
          version: 2,
          fecha_registro: new Date("2026-05-21T11:00:00Z"),
          docente_evaluador: "usr-doc-001",
          evaluaciones_criterio: [
            { id_criterio: "crit-001", nivel_logro: "EN PROCESO", observaciones: "Identifica a sus padres correctamente." },
            { id_criterio: "crit-002", nivel_logro: "INICIADO", observaciones: "Requiere material concreto de apoyo." }
          ]
        },
        {
          version: 3,
          fecha_registro: new Date("2026-05-23T15:00:00Z"),
          docente_evaluador: "usr-doc-001",
          evaluaciones_criterio: [
            { id_criterio: "crit-001", nivel_logro: "LOGRADO", observaciones: "Excelente. Clasifica perfectamente personas seguras." },
            { id_criterio: "crit-002", nivel_logro: "EN PROCESO", observaciones: "Ordena secuencias cortas con ayuda." }
          ]
        }
      ],
      ficha_monitoreo: {
        clasificacion: "LOGRADO",
        seriacion: "EN PROCESO",
        asimilacion_acomodacion: "LOGRADO",
        justificacion: "Explicó que los extraños no deben saber su nombre.",
        autoregulacion: "LOGRADO",
        observaciones: "Pedrito ha progresado de forma admirable esta semana.",
        acciones_apoyo: "Recomiendo reforzar seriación en casa usando juguetes de diferentes tamaños."
      },
      actividades_casa_completadas: [
        {
          id_actividad: "act-sem1-002",
          comentario: "Dibujamos en familia en la sala. Pedrito se divirtió mucho reconociendo a sus tíos.",
          fecha: new Date("2026-05-22T18:00:00Z")
        }
      ]
    });

    // Actividad 2 (Para probar comparativa en el tiempo en PerfilHijo.vue - RF-F03)
    evaluacionesEstudiantes.push({
      _id: "eval-est-001-act-sem2-001",
      id_actividad: "act-sem2-001",
      id_estudiante: "est-001",
      historial_versiones: [
        {
          version: 1,
          fecha_registro: new Date("2026-05-26T09:00:00Z"),
          docente_evaluador: "usr-doc-001",
          evaluaciones_criterio: [
            { id_criterio: "crit-001", nivel_logro: "LOGRADO", observaciones: "Reconoce sin problemas zonas de riesgo." }
          ]
        }
      ]
    });


    // --- ALUMNO 2 (Juanito - Hermano de Pedrito): Evaluado parcialmente ---
    evaluacionesEstudiantes.push({
      _id: "eval-est-002-act-sem1-001",
      id_actividad: "act-sem1-001",
      id_estudiante: "est-002",
      historial_versiones: [
        {
          version: 1,
          fecha_registro: new Date("2026-05-23T15:30:00Z"),
          docente_evaluador: "usr-doc-001",
          evaluaciones_criterio: [
            { id_criterio: "crit-001", nivel_logro: "EN PROCESO", observaciones: "Aún confunde ciertas señales visuales." },
            { id_criterio: "crit-002", nivel_logro: "INICIADO", observaciones: "Tiene dificultad en secuencias lógicas." }
          ]
        }
      ],
      ficha_monitoreo: {
        clasificacion: "EN PROCESO",
        seriacion: "INICIADO",
        asimilacion_acomodacion: "EN PROCESO",
        justificacion: "Dice que todos los que sonríen son buenos.",
        autoregulacion: "INICIADO",
        observaciones: "Juanito requiere acompañamiento personalizado.",
        acciones_apoyo: "Ver vídeos interactivos sobre autocuidado sugeridos en el canal."
      }
    });

    // --- ALUMNOS DEL 3 AL 20 (Para Seguimiento Grupal - RF-D05) ---
    // Distribuiremos las notas de la Actividad 1 para que:
    // - crit-001 (Clasificación): 8 Logrado, 5 En Proceso, 2 Iniciado, 5 Sin Evaluar (Total 20) -> NO da alerta.
    // - crit-002 (Seriación): 1 Logrado, 2 En Proceso, 12 Iniciado, 5 Sin Evaluar (Total 20) -> ALERTA DE REFUERZO GRUPAL (Iniciado + Sin Evaluar = 17, > 50%).
    for (let idx = 3; idx <= 20; idx++) {
      const idEst = `est-00${idx}`;
      
      // Los alumnos 16 al 20 quedarán sin evaluación en esta actividad (Sin Evaluar / No Evaluado)
      if (idx > 15) continue;

      let n1 = "INICIADO";
      let n2 = "INICIADO";

      // Alumnos 3 a 10: Logrado en crit-001
      if (idx <= 10) n1 = "LOGRADO";
      // Alumnos 11 a 15: En Proceso en crit-001
      else if (idx <= 15) n1 = "EN PROCESO";

      // Solo Alumno 3 Logrado en crit-002, Alumnos 4-5 En Proceso, los demás Iniciados
      if (idx === 3) n2 = "LOGRADO";
      else if (idx <= 5) n2 = "EN PROCESO";

      evaluacionesEstudiantes.push({
        _id: `eval-est-00${idx}-act-sem1-001`,
        id_actividad: "act-sem1-001",
        id_estudiante: idEst,
        historial_versiones: [
          {
            version: 1,
            fecha_registro: new Date("2026-05-23T16:00:00Z"),
            docente_evaluador: "usr-doc-001",
            evaluaciones_criterio: [
              { id_criterio: "crit-001", nivel_logro: n1, observaciones: "Desempeño general de prueba." },
              { id_criterio: "crit-002", nivel_logro: n2, observaciones: "Falta potenciar seriación." }
            ]
          }
        ],
        ficha_monitoreo: {
          clasificacion: n1,
          seriacion: n2,
          asimilacion_acomodacion: n1,
          justificacion: "Prueba grupal.",
          autoregulacion: n2,
          observaciones: "Todo correcto.",
          acciones_apoyo: "Revisar material."
        }
      });
    }

    await db.collection('evaluaciones_estudiantes').insertMany(evaluacionesEstudiantes);

    console.log('\n✅ BASE DE DATOS LLENADA CON DATOS MASIVOS DE PRUEBA');
    console.log('📊 Resumen de datos creados:');
    console.log('  • 1 Docente con credencial (gladys.doc / 1234)');
    console.log('  • 1 Representante con MULTIPLES HIJOS (carlos.padre / 1234)');
    console.log('  • 18 Representantes adicionales con credencial (padre.nombre / 1234)');
    console.log('  • 20 Alumnos matriculados en 1 Curso');
    console.log('  • 2 Unidades didácticas con 3 Actividades de Clase y 1 de Casa');
    console.log('  • 15 Alumnos evaluados en la Actividad 1 (5 alumnos quedan sin evaluar)');
    console.log('  • Alumno "Pedrito Puentestar" con 3 versiones de evaluación para validar Trazabilidad');
    console.log('  • Alumno "Pedrito Puentestar" con evaluaciones en Semana 1 y 2 para validar Avance Histórico\n');

  } catch (error) {
    console.error('❌ ERROR AL INSERTAR DATOS:', error.message);
    process.exit(1);
  } finally {
    if (client) await client.close();
  }
};

generarDatosMasivos();
