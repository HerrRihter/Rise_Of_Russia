const fs = require('fs');
const { optimizeTurnStructure } = require('./optimize-turns-structure.cjs');

// Функция для тестирования оптимизации одного хода
function testSingleTurnOptimization(inputPath, turnIndex = 0) {
  console.log('🧪 Тестирование оптимизации одного хода...');
  
  try {
    // Чтение файла
    const inputContent = fs.readFileSync(inputPath, 'utf8');
    const lines = inputContent.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      console.error('❌ Файл пуст или не содержит данных');
      return;
    }
    
    if (turnIndex >= lines.length) {
      console.error(`❌ Индекс ${turnIndex} превышает количество строк (${lines.length})`);
      return;
    }
    
    // Парсинг выбранного хода
    const originalTurn = JSON.parse(lines[turnIndex]);
    console.log(`📋 Обработка хода: ${originalTurn.title || originalTurn.id}`);
    
    // Оптимизация структуры
    const optimizedTurn = optimizeTurnStructure(originalTurn);
    
    // Сохранение результата
    const outputPath = `test_turn_${turnIndex}_optimized.json`;
    fs.writeFileSync(outputPath, JSON.stringify(optimizedTurn, null, 2), 'utf8');
    
    // Вывод статистики
    console.log('\n📊 Статистика оптимизации:');
    console.log(`   • Слов в оригинале: ${originalTurn.sections.reduce((acc, s) => acc + s.content.split(' ').length, 0)}`);
    console.log(`   • Слов после оптимизации: ${optimizedTurn.metadata.word_count}`);
    console.log(`   • Секций: ${optimizedTurn.metadata.sections_count}`);
    console.log(`   • Чанков: ${optimizedTurn.content.chunks.length}`);
    console.log(`   • Извлеченных людей: ${optimizedTurn.indexes.entities.people.length}`);
    console.log(`   • Извлеченных организаций: ${optimizedTurn.indexes.entities.organizations.length}`);
    console.log(`   • Извлеченных локаций: ${optimizedTurn.indexes.entities.locations.length}`);
    console.log(`   • Тем: ${optimizedTurn.indexes.themes.length}`);
    console.log(`   • Общее настроение: ${optimizedTurn.analysis.sentiment}`);
    
    // Вывод ключевых тем
    console.log('\n🎯 Ключевые темы:');
    optimizedTurn.indexes.themes.slice(0, 5).forEach(theme => {
      console.log(`   • ${theme.theme}: ${Math.round(theme.relevance * 100)}%`);
    });
    
    // Вывод ключевых сущностей
    console.log('\n👥 Ключевые люди:');
    optimizedTurn.indexes.entities.people.slice(0, 5).forEach(person => {
      console.log(`   • ${person}`);
    });
    
    console.log('\n🏢 Ключевые организации:');
    optimizedTurn.indexes.entities.organizations.slice(0, 5).forEach(org => {
      console.log(`   • ${org}`);
    });
    
    console.log('\n📍 Ключевые локации:');
    optimizedTurn.indexes.entities.locations.slice(0, 5).forEach(location => {
      console.log(`   • ${location}`);
    });
    
    // Вывод структуры чанков
    console.log('\n📦 Структура чанков:');
    optimizedTurn.content.chunks.slice(0, 3).forEach((chunk, index) => {
      console.log(`   • Чанк ${index + 1}: ${chunk.tokens_estimate} токенов, ${chunk.sentiment} настроение`);
    });
    
    console.log(`\n✅ Результат сохранен в: ${outputPath}`);
    
    return optimizedTurn;
    
  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error.message);
    return null;
  }
}

// Функция для сравнения структур
function compareStructures(original, optimized) {
  console.log('\n🔍 Сравнение структур:');
  
  const comparison = {
    original_size: JSON.stringify(original).length,
    optimized_size: JSON.stringify(optimized).length,
    size_reduction: 0,
    added_features: [],
    improved_accessibility: []
  };
  
  // Расчет уменьшения размера
  comparison.size_reduction = Math.round(
    (1 - comparison.optimized_size / comparison.original_size) * 100
  );
  
  // Анализ добавленных возможностей
  if (optimized.indexes) comparison.added_features.push('Индексы сущностей');
  if (optimized.analysis) comparison.added_features.push('Анализ настроения');
  if (optimized.content.chunks) comparison.added_features.push('Разбиение на чанки');
  if (optimized.indexes.themes) comparison.added_features.push('Извлечение тем');
  
  // Анализ улучшенной доступности
  if (optimized.metadata) comparison.improved_accessibility.push('Метаданные');
  if (optimized.content.key_points) comparison.improved_accessibility.push('Ключевые моменты');
  if (optimized.analysis.key_themes) comparison.improved_accessibility.push('Ключевые темы');
  
  console.log(`   • Размер оригинальной структуры: ${comparison.original_size} символов`);
  console.log(`   • Размер оптимизированной структуры: ${comparison.optimized_size} символов`);
  console.log(`   • Уменьшение размера: ${comparison.size_reduction}%`);
  
  console.log('\n✨ Добавленные возможности:');
  comparison.added_features.forEach(feature => {
    console.log(`   • ${feature}`);
  });
  
  console.log('\n🚀 Улучшенная доступность:');
  comparison.improved_accessibility.forEach(improvement => {
    console.log(`   • ${improvement}`);
  });
  
  return comparison;
}

// Основная функция
function main() {
  const inputPath = process.argv[2] || 'd:/Downloads/turns_hierarchical.jsonl';
  const turnIndex = parseInt(process.argv[3]) || 0;
  
  if (!fs.existsSync(inputPath)) {
    console.error(`❌ Файл не найден: ${inputPath}`);
    console.log('\n💡 Использование:');
    console.log('   node test-single-turn.js <input_file> [turn_index]');
    console.log('\n📝 Пример:');
    console.log('   node test-single-turn.js d:/Downloads/turns_hierarchical.jsonl 0');
    process.exit(1);
  }
  
  // Чтение оригинального хода для сравнения
  const inputContent = fs.readFileSync(inputPath, 'utf8');
  const lines = inputContent.split('\n').filter(line => line.trim());
  const originalTurn = JSON.parse(lines[turnIndex]);
  
  // Тестирование оптимизации
  const optimizedTurn = testSingleTurnOptimization(inputPath, turnIndex);
  
  if (optimizedTurn) {
    // Сравнение структур
    compareStructures(originalTurn, optimizedTurn);
    
    console.log('\n🎉 Тестирование завершено успешно!');
  } else {
    console.log('\n❌ Тестирование завершилось с ошибкой');
    process.exit(1);
  }
}

// Экспорт функций
module.exports = {
  testSingleTurnOptimization,
  compareStructures
};

// Если скрипт запущен напрямую
if (require.main === module) {
  main();
} 