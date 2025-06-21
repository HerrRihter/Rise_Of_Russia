const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const serviceAccount = require('../serviceAccountKey.json');
const inputFile = path.join(__dirname, '../public/history/layout.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

async function uploadLayout() {
  if (!fs.existsSync(inputFile)) {
    console.error('layout.json not found!');
    process.exit(1);
  }
  const layoutArr = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
  // Очищаем коллекцию layout (если нужно)
  const layoutCol = db.collection('layout');
  const existing = await layoutCol.get();
  for (const doc of existing.docs) {
    await doc.ref.delete();
  }
  // Загружаем новый layout
  const batch = db.batch();

  for (let i = 0; i < layoutArr.length; i++) {
    const docRef = db.collection('layout').doc(String(i));
    batch.set(docRef, layoutArr[i]);
    // console.log(`layout/${i} загружен`);
  }

  await batch.commit();
  // console.log('Layout успешно обновлён в Firestore!');
  process.exit(0);
}

uploadLayout().catch(console.error);