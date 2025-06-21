const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Путь к сервисному ключу (в корне проекта)
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function uploadConstitutionalPrinciples() {
  try {
    console.log('Загрузка конституционных принципов в Firestore...');
    const principlesPath = path.join(process.cwd(), 'public', 'history', 'constitutional_principles.json');
    const principlesData = JSON.parse(fs.readFileSync(principlesPath, 'utf8'));
    console.log(`Найдено ${principlesData.principles.length} принципов конституции`);
    for (const principle of principlesData.principles) {
      await db.collection('constitutional_principles').doc(principle.id).set(principle);
      console.log(`✓ Загружен принцип: ${principle.name} (${principle.options.length} вариантов)`);
    }
    console.log('\n✅ Все конституционные принципы успешно загружены в Firestore!');
    const totalOptions = principlesData.principles.reduce((sum, principle) => sum + principle.options.length, 0);
    console.log(`📋 Общее количество вариантов: ${totalOptions}`);
  } catch (error) {
    console.error('❌ Ошибка при загрузке конституционных принципов:', error);
    process.exit(1);
  }
}

uploadConstitutionalPrinciples(); 