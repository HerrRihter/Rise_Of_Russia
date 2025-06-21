const admin = require('firebase-admin');
const path = require('path');

// Путь к сервисному ключу (в корне проекта)
const serviceAccount = require('../serviceAccountKey.json');

// Инициализация Firebase Admin
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  if (error.code !== 'app/duplicate-app') {
    throw error;
  }
}

const db = admin.firestore();

async function revertFocusNameToTitle() {
  try {
    console.log('Начинаю откат изменений: переименование name -> title...');
    
    const focusNodesRef = db.collection('focus_tree_nodes');
    const snapshot = await focusNodesRef.get();

    if (snapshot.empty) {
      console.log('Коллекция focus_tree_nodes пуста. Нечего исправлять.');
      return;
    }

    let updatedCount = 0;
    const batch = db.batch();

    snapshot.forEach(doc => {
      const data = doc.data();
      
      // Проверяем, есть ли поле name и нет ли поля title
      if (data.name && !data.title) {
        const updateData = {
          title: data.name,
          name: admin.firestore.FieldValue.delete()
        };
        batch.update(doc.ref, updateData);
        updatedCount++;
        console.log(`- Фокус '${data.id}': будет возвращено имя поля (name -> title).`);
      }
    });

    if (updatedCount > 0) {
      await batch.commit();
      console.log(`\n✅ Успешно возвращено имя поля для ${updatedCount} фокусов.`);
    } else {
      console.log('\n✅ Проверка завершена. Не найдено фокусов для отката изменений.');
    }

  } catch (error) {
    console.error('❌ Ошибка при откате изменений фокусов:', error);
    process.exit(1);
  }
}

revertFocusNameToTitle(); 