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

// Функция для округления чисел до заданной точности
const round = (num, places) => {
	if (!('' + num).includes('e')) {
		return +(Math.round(num + 'e+' + places)  + 'e-' + places);
	} else {
		let arr = ('' + num).split('e');
		let sig = ''
		if (+arr[1] + places > 0) {
			sig = '+';
		}
		return +(Math.round(+arr[0] + 'e' + sig + (+arr[1] + places)) + 'e-' + places);
	}
}


async function fixFocusTreeStructure() {
  try {
    console.log('Начинаю проверку и исправление структуры фокусов...');
    
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
      const updateData = {};
      let needsUpdate = false;

      // 1. Проверка и переименование title -> name
      if (data.title && !data.name) {
        updateData.name = data.title;
        updateData.title = admin.firestore.FieldValue.delete();
        needsUpdate = true;
        console.log(`- Фокус '${data.id}': будет переименован (title -> name).`);
      }

      // 2. Проверка и округление координат
      if (typeof data.x === 'number' && data.x !== round(data.x, 4)) {
        updateData.x = round(data.x, 4);
        needsUpdate = true;
        console.log(`- Фокус '${data.id}': координата x будет округлена до ${updateData.x}.`);
      }
      if (typeof data.y === 'number' && data.y !== round(data.y, 4)) {
        updateData.y = round(data.y, 4);
        needsUpdate = true;
        console.log(`- Фокус '${data.id}': координата y будет округлена до ${updateData.y}.`);
      }

      if (needsUpdate) {
        batch.update(doc.ref, updateData);
        updatedCount++;
      }
    });

    if (updatedCount > 0) {
      await batch.commit();
      console.log(`\n✅ Успешно исправлена структура для ${updatedCount} фокусов.`);
    } else {
      console.log('\n✅ Проверка завершена. Проблем со структурой фокусов не найдено.');
    }

  } catch (error) {
    console.error('❌ Ошибка при исправлении структуры фокусов:', error);
    process.exit(1);
  }
}

fixFocusTreeStructure(); 