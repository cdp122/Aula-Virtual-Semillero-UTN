const mongoose = require('mongoose');
require('dotenv').config();

(async () => {
  try {
    console.log('\n🔍 LISTANDO TODAS LAS BASES DE DATOS\n');
    
    // Conectar con el usuario admin
    await mongoose.connect('mongodb://localhost:27017/', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    const db = mongoose.connection.db;
    const admin = db.admin();
    
    // Listar todas las bases de datos
    const bases = await admin.listDatabases();
    console.log('📊 BASES DE DATOS EN EL SERVIDOR:\n');
    
    for (const base of bases.databases) {
      console.log(`  • ${base.name}`);
    }
    
    // Conectar a aula_virtual y listar colecciones
    await mongoose.connection.close();
    
    console.log('\n\n📋 COLECCIONES EN aula_virtual:\n');
    await mongoose.connect('mongodb://localhost:27017/aula_virtual');
    
    const colecciones = await mongoose.connection.db.listCollections().toArray();
    
    for (const col of colecciones) {
      const count = await mongoose.connection.db.collection(col.name).countDocuments();
      console.log(`  • ${col.name}: ${count} documentos`);
    }
    
    await mongoose.connection.close();
    console.log('\n✅ Completado\n');
  } catch (error) {
    console.error('❌ ERROR:', error.message);
  }
})();
