const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Путь к сервисному ключу (в корне проекта)
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function uploadLeadersExtended() {
  try {
    console.log('Загрузка расширенных лидеров в Firestore...');
    
    // Читаем файл с расширенными лидерами
    const leadersPath = path.join(process.cwd(), 'public', 'history', 'leaders_extended.json');
    const leadersData = JSON.parse(fs.readFileSync(leadersPath, 'utf8'));
    
    console.log(`Найдено ${leadersData.options.length} лидеров`);
    
    // Загружаем каждого лидера в Firestore
    for (const leader of leadersData.options) {
      try {
        await db.collection('leaders').doc(leader.id).set(leader);
        console.log(`✓ Загружен лидер: ${leader.name} (${leader.id})`);
      } catch (error) {
        console.error(`❌ Ошибка при загрузке лидера ${leader.id}:`, error.message);
      }
    }
    
    console.log('\n✅ Все расширенные лидеры успешно загружены в Firestore!');
    console.log(`📊 Общее количество загруженных лидеров: ${leadersData.options.length}`);
    
  } catch (error) {
    console.error('❌ Ошибка при загрузке расширенных лидеров:', error);
    process.exit(1);
  }
}

uploadLeadersExtended(); 