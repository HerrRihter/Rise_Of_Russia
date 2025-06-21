const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const { getFirestore, collection, doc, setDoc } = require('firebase-admin/firestore');

// Путь к сервисному ключу (в корне проекта)
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = getFirestore();

async function uploadLeadersExtended() {
  try {
    // console.log('Загрузка расширенных лидеров в Firestore...');
    
    const leadersFilePath = path.join(__dirname, '..', 'public', 'history', 'leaders_extended.json');
    const leadersFileContent = await fs.promises.readFile(leadersFilePath, 'utf8');
    const leadersData = JSON.parse(leadersFileContent);

    if (!leadersData || !leadersData.options || !Array.isArray(leadersData.options)) {
        throw new Error('Некорректная структура файла leaders_extended.json. Ожидается объект с ключом "options" (массив).');
    }

    // console.log(`Найдено ${leadersData.options.length} лидеров`);
    const leadersCollection = collection(db, 'leaders');
    
    for (const leader of leadersData.options) {
      const docRef = doc(leadersCollection, leader.id);
      await setDoc(docRef, leader);
      // console.log(`✓ Загружен лидер: ${leader.name} (${leader.id})`);
    }

    // console.log('\n✅ Все расширенные лидеры успешно загружены в Firestore!');
    // console.log(`📊 Общее количество загруженных лидеров: ${leadersData.options.length}`);

  } catch (error) {
    console.error('❌ Ошибка при загрузке лидеров:', error);
    process.exit(1);
  }
}

uploadLeadersExtended(); 