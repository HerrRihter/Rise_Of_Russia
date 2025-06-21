const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const serviceAccount = require('../serviceAccountKey.json');
const inputFile = path.join(__dirname, '../public/history/corporations.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

async function uploadCorporations() {
  if (!fs.existsSync(inputFile)) {
    console.error('corporations.json not found!');
    process.exit(1);
  }
  const data = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
  const corporationsArr = data.options || [];
  const col = db.collection('corporations');
  // Очищаем коллекцию (если нужно)
  const existing = await col.get();
  for (const doc of existing.docs) {
    await doc.ref.delete();
  }
  // Загружаем новые данные
  for (const corp of corporationsArr) {
    await col.doc(corp.id).set(corp);
    console.log(`corporations/${corp.id} загружен`);
  }
  console.log('Corporations успешно обновлены в Firestore!');
  process.exit(0);
}

uploadCorporations(); 