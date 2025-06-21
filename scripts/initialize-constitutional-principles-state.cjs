const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Путь к сервисному ключу (в корне проекта)
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function initializeConstitutionalPrinciplesState() {
  try {
    console.log('Инициализация базовых значений конституционных принципов в state...');
    
    // Читаем файл с конституционными принципами
    const principlesPath = path.join(process.cwd(), 'public', 'history', 'constitutional_principles.json');
    const principlesData = JSON.parse(fs.readFileSync(principlesPath, 'utf8'));
    
    // Создаем базовые значения - берем первый вариант каждого принципа
    const initialPrinciples = {};
    for (const principle of principlesData.principles) {
      if (principle.options && principle.options.length > 0) {
        // Берем первый вариант как базовый
        const firstOption = principle.options[0];
        initialPrinciples[principle.id] = {
          principle_id: principle.id,
          selected_option_id: firstOption.id
        };
        console.log(`✓ Инициализирован принцип: ${principle.name} -> ${firstOption.name_display}`);
      }
    }
    
    // Сохраняем в state/main
    await db.collection('state').doc('main').set({
      constitutional_principles_selected_options: initialPrinciples
    }, { merge: true });
    
    console.log('\n✅ Базовые значения конституционных принципов успешно инициализированы в state!');
    console.log(`📊 Итого инициализировано: ${Object.keys(initialPrinciples).length} принципов`);
    
  } catch (error) {
    console.error('❌ Ошибка при инициализации конституционных принципов:', error);
    process.exit(1);
  }
}

initializeConstitutionalPrinciplesState(); 