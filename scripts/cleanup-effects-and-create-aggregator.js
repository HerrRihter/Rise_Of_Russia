import admin from 'firebase-admin';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const aggregatorId = 'spirit_roll_mods_aggregator';
const aggregatorData = {
  id: aggregatorId,
  name: 'Сводка модификаторов бросков',
  icon_path: 'history/national_spirits_icons/aggregator.png',
  is_aggregator: true,
  description: 'Показывает все модификаторы бросков, действующие от активных национальных духов.',
  roll_modifiers: {}
};

async function cleanupAndCreateAggregator() {
  // Очистка effects_summary у всех духов
  const spiritsSnap = await db.collection('national_spirits').get();
  for (const docSnap of spiritsSnap.docs) {
    await docSnap.ref.update({ effects_summary: '' });
    console.log(`Очищен effects_summary: ${docSnap.id}`);
  }
  // Создание агрегатора, если его нет
  const aggRef = db.collection('national_spirits').doc(aggregatorId);
  const aggSnap = await aggRef.get();
  if (!aggSnap.exists) {
    await aggRef.set(aggregatorData);
    console.log('Создан spirit_roll_mods_aggregator');
  } else {
    console.log('spirit_roll_mods_aggregator уже существует');
  }
}

cleanupAndCreateAggregator().then(() => {
  console.log('Готово!');
  process.exit(0);
}).catch(e => {
  console.error('Ошибка:', e);
  process.exit(1);
}); 