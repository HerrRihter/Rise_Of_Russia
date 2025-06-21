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

async function updateFocusCoordinates() {
  try {
    // console.log('🔄 Обновление координат фокусов...');
    
    const focusTreeFilePath = path.join(__dirname, '..', 'public', 'history', 'presidential_focus_tree.json');
    // Читаем данные фокусов
    const focusTreeData = JSON.parse(fs.readFileSync(focusTreeFile, 'utf8'));
    const focusNodes = focusTreeData.focus_tree_nodes;
    
    console.log(`📊 Найдено фокусов: ${focusNodes.length}`);
    
    // Рассчитываем правильные координаты для центрирования
    // Поле шириной 500px, узел шириной 80px, отступ 20px, расстояние между узлами 120px
    // Для центрирования: (500 - 80) / 2 = 210px от левого края
    // Логическая координата: (210 - 20) / 120 = 1.58
    const centerX = 1.58; // Центрирование в поле 500px
    const verticalSpacing = 1.2; // Уменьшенное расстояние между фокусами
    
    // Обновляем координаты для каждого фокуса
    const updatedFocuses = focusNodes.map((focus, index) => {
      // Устанавливаем x в центр, y с равномерным распределением
      const updatedFocus = {
        id: focus.id,
        created_at: focus.created_at,
        title: focus.title,
        icon_path: focus.icon_path,
        duration: focus.duration,
        description: focus.description,
        x: centerX,
        y: index * verticalSpacing,
        prerequisites: focus.prerequisites
      };
      
      // Удаляем метаданные и детали эффектов
      delete updatedFocus.metadata;
      delete updatedFocus.effects;
      
      return updatedFocus;
    });
    
    console.log('📐 Новые координаты:');
    updatedFocuses.forEach(focus => {
      console.log(`   ${focus.title}: (${focus.x}, ${focus.y})`);
    });
    
    // Обновляем файл
    const updatedFocusTree = {
      focus_tree_nodes: updatedFocuses
    };
    
    fs.writeFileSync(focusTreeFile, JSON.stringify(updatedFocusTree, null, 2), 'utf-8');
    console.log('💾 Файл presidential_focus_tree.json обновлен');
    
    // Очищаем существующую коллекцию focus_tree_nodes
    const focusCollection = db.collection('focus_tree_nodes');
    const existingDocs = await focusCollection.get();
    
    console.log(`🗑️  Удаление ${existingDocs.size} существующих документов...`);
    for (const doc of existingDocs.docs) {
      await doc.ref.delete();
    }
    
    // Загружаем обновленные фокусы
    console.log('📤 Загрузка обновленных фокусов в Firestore...');
    for (const focus of updatedFocuses) {
      const docId = focus.id;
      await focusCollection.doc(docId).set({
        ...focus,
        uploaded_at: admin.firestore.FieldValue.serverTimestamp(),
        coordinates_updated: true
      });
      console.log(`✅ Загружен фокус: ${focus.title} (${focus.x}, ${focus.y})`);
    }
    
    console.log(`🎉 Успешно загружено ${updatedFocuses.length} фокусов с новыми координатами`);
    
    // Обновляем метаданные
    const metadata = {
      total_focuses: updatedFocuses.length,
      last_updated: admin.firestore.FieldValue.serverTimestamp(),
      version: '1.2',
      description: 'Древо национальных фокусов: решения президента (оптимизированное расположение)',
      categories: ['presidential_decisions'],
      layout_type: 'vertical_centered_optimized',
      coordinates: {
        x_center: centerX,
        y_start: 0,
        y_end: updatedFocuses.length - 1,
        spacing: verticalSpacing
      }
    };
    
    await db.collection('focus_tree_metadata').doc('current').set(metadata);
    console.log('📋 Метаданные обновлены');
    
  } catch (error) {
    console.error('❌ Ошибка при обновлении координат:', error);
    process.exit(1);
  }
  
  console.log('✅ Обновление координат завершено успешно!');
  process.exit(0);
}

// Запуск
updateFocusCoordinates(); 