const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Пути к файлам
const serviceAccount = require('../serviceAccountKey.json');
const focusTreeFile = path.join(__dirname, 'presidential_focus_tree.json');

// Инициализация Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function uploadFocusTree() {
  console.log('🌳 Загрузка древа фокусов в Firestore...');
  
  // Проверяем существование файла
  if (!fs.existsSync(focusTreeFile)) {
    console.error('❌ Файл presidential_focus_tree.json не найден!');
    process.exit(1);
  }
  
  try {
    // Читаем данные фокусов
    const focusTreeData = JSON.parse(fs.readFileSync(focusTreeFile, 'utf8'));
    const focusNodes = focusTreeData.focus_tree_nodes;
    
    console.log(`📊 Найдено фокусов: ${focusNodes.length}`);
    
    // Очищаем существующую коллекцию focus_tree_nodes
    const focusCollection = db.collection('focus_tree_nodes');
    const existingDocs = await focusCollection.get();
    
    console.log(`🗑️  Удаление ${existingDocs.size} существующих документов...`);
    for (const doc of existingDocs.docs) {
      await doc.ref.delete();
    }
    
    // Загружаем новые фокусы
    console.log('📤 Загрузка фокусов в Firestore...');
    for (const focus of focusNodes) {
      const docId = focus.id;
      await focusCollection.doc(docId).set({
        ...focus,
        uploaded_at: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`✅ Загружен фокус: ${focus.title} (${docId})`);
    }
    
    console.log(`🎉 Успешно загружено ${focusNodes.length} фокусов в коллекцию 'focus_tree_nodes'`);
    
    // Создаем сводный документ с метаданными
    const metadata = {
      total_focuses: focusNodes.length,
      last_updated: admin.firestore.FieldValue.serverTimestamp(),
      version: '1.0',
      description: 'Древо национальных фокусов: решения президента',
      periods: focusNodes.map(f => f.metadata?.period).filter(Boolean),
      categories: ['presidential_decisions']
    };
    
    await db.collection('focus_tree_metadata').doc('current').set(metadata);
    console.log('📋 Метаданные древа фокусов обновлены');
    
  } catch (error) {
    console.error('❌ Ошибка при загрузке фокусов:', error);
    process.exit(1);
  }
  
  console.log('✅ Загрузка завершена успешно!');
  process.exit(0);
}

// Запуск
uploadFocusTree(); 