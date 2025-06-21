const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Путь к сервисному ключу (в корне проекта)
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function createSecondTermFocuses() {
  try {
    console.log('Создание фокусов второго срока...');
    
    // Родительский фокус "Второй срок"
    const parentFocus = {
      id: "second_term",
      name: "Второй срок",
      description: "Начало нового президентского срока требует формирования правительства, отражающего политические приоритеты и баланс сил в элитах.",
      icon_path: "history/focus_tree_icons/political_power.png",
      x: 8.5,
      y: 0,
      prerequisites: [],
      mutually_exclusive: [],
      completion_reward: "",
      ai_will_do: {
        factor: 1
      }
    };

    // Дочерние фокусы
    const childFocuses = [
      {
        id: "new_cabinet_new_tasks",
        name: "⚜️ Новый Кабинет – Новые Задачи",
        description: "Новый президентский срок начинается с переформатирования исполнительной власти. Правительство получает жёсткий мандат на реализацию национальных приоритетов — от инфраструктуры до науки. Централизация, технологическое развитие и стратегическая независимость становятся смыслом политического курса. Это кабинет мобилизации, а не баланса.",
        icon_path: "history/focus_tree_icons/political_power.png",
        x: 6.5,
        y: 1,
        prerequisites: ["second_term"],
        mutually_exclusive: ["pragmatic_center", "consensus_loyal", "business_signals", "dialogue_window"],
        completion_reward: "add_political_power = 3",
        ai_will_do: {
          factor: 1
        }
      },
      {
        id: "pragmatic_center",
        name: "☀️ Прагматичный Центр",
        description: "Курс на стратегическую централизацию не требует фронтального наступления на рынок. Новый кабинет сочетает политическую лояльность с экономическим прагматизмом. Удержание макроэкономической стабильности и управляемость важнее жёсткой чистки. Это выбор в пользу постепенности и точечного давления.",
        icon_path: "history/focus_tree_icons/political_power.png",
        x: 7.5,
        y: 1,
        prerequisites: ["second_term"],
        mutually_exclusive: ["new_cabinet_new_tasks", "consensus_loyal", "business_signals", "dialogue_window"],
        completion_reward: "add_political_power = 1",
        ai_will_do: {
          factor: 1
        }
      },
      {
        id: "consensus_loyal",
        name: "⚖️ Консенсус Лояльных",
        description: "После политической победы уместно не спешить с демонтажом сложившихся механизмов. Вместо резких шагов — сохранение проверенного баланса. Ключевые министры остаются на своих постах: каждый из них доказал лояльность и управляемость. Кабинет не отражает идеологический вектор, он — результат элитного компромисса, достаточного для стабильности.",
        icon_path: "history/focus_tree_icons/political_power.png",
        x: 8.5,
        y: 1,
        prerequisites: ["second_term"],
        mutually_exclusive: ["new_cabinet_new_tasks", "pragmatic_center", "business_signals", "dialogue_window"],
        completion_reward: "",
        ai_will_do: {
          factor: 1
        }
      },
      {
        id: "business_signals",
        name: "🌗 Сигналы Бизнесу",
        description: "После «дела ЮКОСа» экономике требуется не только контроль, но и уверенность в будущем. Новый кабинет даёт осторожный, но понятный сигнал предпринимателям: частная инициатива не под запретом. Власть демонстрирует возможность диалога — не равенства, но предсказуемости.",
        icon_path: "history/focus_tree_icons/political_power.png",
        x: 9.5,
        y: 1,
        prerequisites: ["second_term"],
        mutually_exclusive: ["new_cabinet_new_tasks", "pragmatic_center", "consensus_loyal", "dialogue_window"],
        completion_reward: "add_lunar_influence = -1",
        ai_will_do: {
          factor: 1
        }
      },
      {
        id: "dialogue_window",
        name: "🌑 Окно для Диалога",
        description: "Для преодоления международной изоляции и разблокировки инвестиций необходимо продемонстрировать открытость. Новое правительство включает фигуры с репутацией рыночных реформаторов. Это не поворот курса, но эксперимент с либерализацией. Он может закончиться как успехом, так и рецидивом турбулентности.",
        icon_path: "history/focus_tree_icons/political_power.png",
        x: 10.5,
        y: 1,
        prerequisites: ["second_term"],
        mutually_exclusive: ["new_cabinet_new_tasks", "pragmatic_center", "consensus_loyal", "business_signals"],
        completion_reward: "add_lunar_influence = -2",
        ai_will_do: {
          factor: 1
        }
      }
    ];

    // Загружаем родительский фокус
    await db.collection('focus_tree_nodes').doc(parentFocus.id).set(parentFocus);
    console.log(`✓ Создан родительский фокус: ${parentFocus.name} (${parentFocus.id})`);

    // Загружаем дочерние фокусы
    for (const focus of childFocuses) {
      await db.collection('focus_tree_nodes').doc(focus.id).set(focus);
      console.log(`✓ Создан фокус: ${focus.name} (${focus.id})`);
    }

    console.log('\n✅ Все фокусы второго срока успешно созданы в Firestore!');
    console.log(`📊 Общее количество созданных фокусов: ${childFocuses.length + 1}`);
    
  } catch (error) {
    console.error('❌ Ошибка при создании фокусов второго срока:', error);
    process.exit(1);
  }
}

createSecondTermFocuses(); 