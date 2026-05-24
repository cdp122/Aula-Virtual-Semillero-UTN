const mongoose = require('mongoose');
require('dotenv').config();

(async () => {
  try {
    console.log('\n🔍 DIAGNÓSTICO DE CONEXIÓN A MONGODB\n');
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/aula_virtual';
    console.log('📍 URI:', uri);
    
    console.log('⏳ Intentando conectar...\n');
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ CONECTADO A MONGODB\n');
    const db = mongoose.connection.db;
    console.log('📊 Base de datos:', db.databaseName);
    
    // Listar colecciones
    const colecciones = await db.listCollections().toArray();
    console.log('\n📋 COLECCIONES Y DOCUMENTOS:\n');
    
    for (const col of colecciones) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`  ✓ ${col.name}: ${count} documentos`);
    }
    
    // Test específico: usuarios
    console.log('\n🔎 TEST ESPECÍFICO - COLECCIÓN usuarios:\n');
    const usuariosCollection = db.collection('usuarios');
    const count = await usuariosCollection.countDocuments();
    console.log(`Total de usuarios: ${count}`);
    
    if (count > 0) {
      const primerUsuario = await usuariosCollection.findOne();
      console.log('\n📄 Primer usuario:');
      console.log(JSON.stringify(primerUsuario, null, 2));
    }
    
    // Ahora probar con Mongoose Model
    console.log('\n\n🧪 PRUEBA CON MODELO MONGOOSE:\n');
    const { UsuarioModelo } = require('./entities/usuario/UsuarioModelo');
    
    const usuariosModelo = await UsuarioModelo.find().lean();
    console.log(`Usuarios encontrados por Modelo: ${usuariosModelo.length}`);
    
    if (usuariosModelo.length > 0) {
      console.log('Primer usuario del modelo:');
      console.log(JSON.stringify(usuariosModelo[0], null, 2));
    }
    
    await mongoose.connection.close();
    console.log('\n✅ Diagnóstico completado\n');
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();
