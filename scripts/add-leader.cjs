const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');

// --- НАСТРОЙКА ---
// Укажите путь к вашему файлу ключа сервисного аккаунта
const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');
const serviceAccount = require(serviceAccountPath);

// Инициализация Firebase Admin SDK
initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
console.log('✅ Firebase Admin SDK инициализирован.');

// --- ДАННЫЕ НОВОГО ЛИДЕРА ---
const leaderId = 'khomyakov_yaroslav';
const leaderData = {
  id: leaderId,
  name: 'Ярослав Хомяков',
  portrait_path: 'history/leaders_portraits/khomyakov_yaroslav.png',
  tooltip_summary: 'Обаятельный и авантюрный политик из команды Суркова. Несмотря на образ добродушного и забавного малого, является компетентным и серьезным специалистом.',
  description: 'Ярослав Хомяков — яркий и обаятельный политик, известный своим авантюрным стилем и принадлежностью к команде Владислава Суркова в Администрации Президента. За образом добродушного и забавного человека скрывается компетентный и серьезный специалист, способный эффективно решать поставленные задачи.',
  // Добавляем пустые или стандартные значения для остальных полей, чтобы соответствовать структуре
  category: 'advisor', // или другая категория, если нужно
  effects_summary: '',
  ideology_tags: [],
  ideology_tags_rus: []
};

async function addLeaderToFirestore() {
  try {
    console.log(`\n➕ Попытка добавить лидера с ID: ${leaderId}`);
    const leaderRef = db.collection('leaders').doc(leaderId);
    
    await leaderRef.set(leaderData);
    
    console.log('🎉 Успех! Лидер успешно добавлен/обновлен в Firestore.');
    console.log('----------------------------------------');
    console.log('Данные лидера:', JSON.stringify(leaderData, null, 2));
    console.log('----------------------------------------');

  } catch (error) {
    console.error('❌ Ошибка при добавлении лидера в Firestore:', error);
    process.exit(1);
  }
}

addLeaderToFirestore(); 