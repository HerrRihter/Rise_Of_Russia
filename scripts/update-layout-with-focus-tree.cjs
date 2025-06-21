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

async function updateLayoutWithFocusTree() {
  console.log('🔄 Обновление layout с включением древа фокусов...');
  
  try {
    // Читаем данные фокусов
    const focusTreeData = JSON.parse(fs.readFileSync(focusTreeFile, 'utf8'));
    const focusNodes = focusTreeData.focus_tree_nodes;
    
    console.log(`📊 Найдено фокусов для layout: ${focusNodes.length}`);
    
    // Получаем текущий layout из Firestore
    const layoutCollection = db.collection('layout');
    const layoutDocs = await layoutCollection.get();
    
    let currentLayout = [];
    if (!layoutDocs.empty) {
      currentLayout = layoutDocs.docs.map(doc => doc.data());
      console.log(`📋 Текущий layout содержит ${currentLayout.length} элементов`);
    }
    
    // Создаем новый layout с включением фокусов
    const newLayout = [
      // Существующие элементы layout (если есть)
      ...currentLayout,
      
      // Добавляем секцию для древа фокусов
      {
        id: 'focus_tree_section',
        type: 'focus_tree',
        title: 'Древо Национальных Фокусов',
        description: 'Решения президента и ключевые политические курсы',
        position: {
          x: 0,
          y: 0,
          width: 12,
          height: 8
        },
        config: {
          show_connections: true,
          show_effects: true,
          show_metadata: true,
          auto_layout: true
        },
        metadata: {
          total_focuses: focusNodes.length,
          categories: ['presidential_decisions'],
          periods: focusNodes.map(f => f.metadata?.period).filter(Boolean),
          last_updated: new Date().toISOString()
        }
      },
      
      // Добавляем виджет для отображения текущего фокуса
      {
        id: 'current_focus_widget',
        type: 'current_focus',
        title: 'Текущий Фокус',
        description: 'Активный национальный фокус',
        position: {
          x: 12,
          y: 0,
          width: 4,
          height: 4
        },
        config: {
          show_effects: true,
          show_progress: true,
          show_next_focus: true
        }
      },
      
      // Добавляем виджет для истории фокусов
      {
        id: 'focus_history_widget',
        type: 'focus_history',
        title: 'История Фокусов',
        description: 'Выполненные национальные фокусы',
        position: {
          x: 12,
          y: 4,
          width: 4,
          height: 4
        },
        config: {
          show_completed: true,
          show_effects_summary: true,
          max_items: 10
        }
      }
    ];
    
    // Очищаем существующий layout
    console.log('🗑️  Очистка существующего layout...');
    for (const doc of layoutDocs.docs) {
      await doc.ref.delete();
    }
    
    // Загружаем новый layout
    console.log('📤 Загрузка обновленного layout...');
    for (let i = 0; i < newLayout.length; i++) {
      await layoutCollection.doc(String(i)).set({
        ...newLayout[i],
        uploaded_at: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`✅ Загружен элемент layout: ${newLayout[i].title || newLayout[i].id} (${i})`);
    }
    
    console.log(`🎉 Layout успешно обновлен! Добавлено ${newLayout.length} элементов`);
    
    // Создаем метаданные layout
    const layoutMetadata = {
      total_elements: newLayout.length,
      last_updated: admin.firestore.FieldValue.serverTimestamp(),
      version: '2.0',
      description: 'Layout с включением древа национальных фокусов',
      includes_focus_tree: true,
      focus_tree_elements: newLayout.filter(item => item.type && item.type.includes('focus')).length
    };
    
    await db.collection('layout_metadata').doc('current').set(layoutMetadata);
    console.log('📋 Метаданные layout обновлены');
    
  } catch (error) {
    console.error('❌ Ошибка при обновлении layout:', error);
    process.exit(1);
  }
  
  console.log('✅ Обновление layout завершено успешно!');
  process.exit(0);
}

// Запуск
updateLayoutWithFocusTree(); 