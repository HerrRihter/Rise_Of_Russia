const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs').promises;
const path = require('path');

// Путь к сервисному ключу (предполагаем, что он в корне проекта)
const serviceAccount = require('../serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

async function uploadLeaders() {
  try {
    // console.log('Загрузка расширенных лидеров в Firestore...');
    
    const leadersFilePath = path.join(__dirname, '..', 'public', 'history', 'leaders_extended.json');
    const leadersFileContent = await fs.readFile(leadersFilePath, 'utf8');
    const leadersData = JSON.parse(leadersFileContent);

    if (!leadersData || !leadersData.options || !Array.isArray(leadersData.options)) {
        throw new Error('Некорректная структура файла leaders_extended.json. Ожидается объект с ключом "options" (массив).');
    }

    // console.log(`Найдено ${leadersData.options.length} лидеров`);
    const leadersCollection = db.collection('leaders');
    
    for (const leader of leadersData.options) {
      await leadersCollection.doc(leader.id).set(leader);
      // console.log(`✓ Загружен лидер: ${leader.name} (${leader.id})`);
    }

    // console.log('\n✅ Все расширенные лидеры успешно загружены в Firestore!');
    // console.log(`📊 Общее количество загруженных лидеров: ${leadersData.options.length}`);

  } catch (error) {
    console.error('❌ Ошибка при загрузке лидеров:', error);
    process.exit(1);
  }
}

uploadLeaders().then(() => {
    // console.log('✅ Загрузка лидеров завершена.');
}); 