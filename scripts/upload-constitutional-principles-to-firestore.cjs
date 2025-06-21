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

async function uploadConstitutionalPrinciples() {
  try {
    // console.log('Загрузка конституционных принципов в Firestore...');
    const principlesFilePath = path.join(__dirname, '..', 'public', 'history', 'constitutional_principles.json');
    const principlesFileContent = await fs.promises.readFile(principlesFilePath, 'utf8');
    const principlesData = JSON.parse(principlesFileContent);
    // console.log(`Найдено ${principlesData.principles.length} принципов конституции`);
    const principlesCollection = collection(db, 'constitutional_principles');
    let totalOptions = 0;
    for (const principle of principlesData.principles) {
      const docRef = doc(principlesCollection, principle.id);
      await setDoc(docRef, principle);
      totalOptions += principle.options.length;
      // console.log(`✓ Загружен принцип: ${principle.name} (${principle.options.length} вариантов)`);
    }
    // console.log('\n✅ Все конституционные принципы успешно загружены в Firestore!');
    // console.log(`📋 Общее количество вариантов: ${totalOptions}`);
  } catch (error) {
    console.error('❌ Ошибка при загрузке конституционных принципов:', error);
    process.exit(1);
  }
}

uploadConstitutionalPrinciples(); 