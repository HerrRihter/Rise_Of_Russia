const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const { getFirestore, collection, getDocs, writeBatch, doc, setDoc } = require('firebase-admin/firestore');

// Пути к файлам
const serviceAccount = require('../serviceAccountKey.json');
const focusTreeFile = path.join(__dirname, 'presidential_focus_tree.json');

// Инициализация Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = getFirestore();

async function uploadFocusTree() {
  try {
    // console.log('🌳 Загрузка древа фокусов в Firestore...');
    const focusTreeFilePath = path.join(__dirname, '..', 'public', 'history', 'focus_tree_nodes.json');
    const focusTreeFileContent = await fs.readFile(focusTreeFilePath, 'utf8');
    const focusNodes = JSON.parse(focusTreeFileContent);
    // console.log(`📊 Найдено фокусов: ${focusNodes.length}`);
    const focusTreeCollection = collection(db, 'focus_tree_nodes');
    const existingDocs = await getDocs(focusTreeCollection);
    if (!existingDocs.empty) {
      // console.log(`🗑️  Удаление ${existingDocs.size} существующих документов...`);
      const batch = writeBatch(db);
      existingDocs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    }
    // console.log('📤 Загрузка фокусов в Firestore...');
    const batch = writeBatch(db);
    focusNodes.forEach(focus => {
      const docId = focus.id;
      const docRef = doc(focusTreeCollection, docId);
      batch.set(docRef, focus);
      // console.log(`✅ Загружен фокус: ${focus.title} (${docId})`);
    });
    await batch.commit();
    // console.log(`🎉 Успешно загружено ${focusNodes.length} фокусов в коллекцию 'focus_tree_nodes'`);
    const metadataDocRef = doc(db, 'national_focus_data', 'metadata');
    const metadata = {
      total_count: focusNodes.length,
      last_updated: new Date().toISOString(),
    };
    await setDoc(metadataDocRef, metadata, { merge: true });
    // console.log('📋 Метаданные древа фокусов обновлены');
    // console.log('✅ Загрузка завершена успешно!');
  } catch (error) {
    console.error('❌ Ошибка при загрузке древа фокусов:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

// Запуск
uploadFocusTree(); 