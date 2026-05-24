const { MongoClient } = require('mongodb');

(async () => {
  let client;
  try {
    console.log('\n🔍 BÚSQUEDA COMPLETA DE DATOS EN MONGODB\n');
    
    client = new MongoClient('mongodb://localhost:27017/');
    await client.connect();
    
    // Listar todas las bases de datos
    const adminDb = client.db('admin');
    let databases = [];
    
    try {
      const result = await adminDb.admin().listDatabases();
      databases = result.databases;
    } catch (e) {
      console.log('⚠️  No se puede listar bases de datos con admin. Intentando aula_virtual...');
      databases = [{name: 'aula_virtual'}];
    }
    
    console.log('📊 BASES DE DATOS ENCONTRADAS:\n');
    for (const db of databases) {
      console.log(`  • ${db.name}`);
    }
    
    // Conectar a aula_virtual y buscar las colecciones
    console.log('\n📋 ANALIZANDO aula_virtual:\n');
    const db = client.db('aula_virtual');
    
    const colecciones = await db.listCollections().toArray();
    console.log(`Colecciones encontradas: ${colecciones.length}\n`);
    
    for (const col of colecciones) {
      const count = await db.collection(col.name).countDocuments();
      const estado = count > 0 ? `✅ ${count} docs` : '❌ vacía';
      console.log(`  ${col.name}: ${estado}`);
      
      if (count > 0) {
        const primerDoc = await db.collection(col.name).findOne();
        console.log(`    └─ Primer documento:`, JSON.stringify(primerDoc).substring(0, 100) + '...');
      }
    }
    
    console.log('\n✅ Análisis completado\n');
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
  } finally {
    if (client) await client.close();
  }
})();
