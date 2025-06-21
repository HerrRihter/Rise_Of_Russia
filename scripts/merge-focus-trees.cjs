const fs = require('fs');
const path = require('path');

// Пути к файлам
const existingFocusTreePath = path.join(__dirname, '..', 'public', 'history', 'focus_tree_nodes.json');
const presidentialFocusTreePath = path.join(__dirname, 'presidential_focus_tree.json');
const mergedOutputPath = path.join(__dirname, '..', 'public', 'history', 'focus_tree_nodes_merged.json');
const backupPath = path.join(__dirname, '..', 'public', 'history', 'focus_tree_nodes_backup.json');

// Чтение существующего древа фокусов
const existingFocusTree = JSON.parse(fs.readFileSync(existingFocusTreePath, 'utf-8'));

// Чтение президентского древа фокусов
const presidentialFocusTree = JSON.parse(fs.readFileSync(presidentialFocusTreePath, 'utf-8'));

// Создание резервной копии
fs.writeFileSync(backupPath, JSON.stringify(existingFocusTree, null, 2), 'utf-8');

// Функция для объединения фокусов
function mergeFocusTrees() {
  const mergedFocusTree = {
    focus_tree_nodes: []
  };
  
  // Добавляем существующие фокусы
  existingFocusTree.focus_tree_nodes.forEach(focus => {
    mergedFocusTree.focus_tree_nodes.push({
      ...focus,
      category: 'economic_reforms' // Добавляем категорию для группировки
    });
  });
  
  // Добавляем президентские фокусы
  presidentialFocusTree.focus_tree_nodes.forEach(focus => {
    mergedFocusTree.focus_tree_nodes.push({
      ...focus,
      category: 'presidential_decisions' // Добавляем категорию для группировки
    });
  });
  
  return mergedFocusTree;
}

// Функция для создания отчета об объединении
function createMergeReport(existingCount, presidentialCount, mergedCount) {
  const report = `# Отчет об объединении древа фокусов

## Статистика объединения

- **Существующих фокусов**: ${existingCount}
- **Президентских фокусов**: ${presidentialCount}
- **Всего после объединения**: ${mergedCount}

## Структура объединенного древа

### Экономические реформы (${existingCount} фокусов)
- Либерализация
- Национализация  
- Начало экономических реформ

### Решения президента (${presidentialCount} фокусов)
- Личный Контроль Президента (Ход 13)
- Консервация Достигнутого Баланса Сил (Ход 14)
- Поддержание Инерции (Ход 15)
- Режим Ожидания (Ход 16)
- Укрепление Внешнего Периметра (Ход 17)
- Тотальная Мобилизация (Ход 18)
- Госинвестиции в Национальные Проекты (Ход 19)
- Формализация 'Суверенной Демократии' (Ход 20)
- Консолидация Государства (Ход 21)
- Национальное Строительство (Ход 22)
- Управляемые Выборы (Ход 23)

## Координаты фокусов

### Экономические реформы
- start_economic_reforms: (1.5, 0)
- liberalization: (2.5, 1)
- nationalisation: (0.5, 1)

### Президентские решения
- turn_13_personal_control: (-4, 0)
- turn_14_balance_conservation: (-3, 0)
- turn_15_inertia_maintenance: (-2, 0)
- turn_16_waiting_mode: (-1, 0)
- turn_17_external_perimeter: (0, 0)
- turn_18_total_mobilization: (1, 0)
- turn_19_national_projects: (2, 0)
- turn_20_sovereign_democracy: (3, 0)
- turn_21_mobilization_course: (4, 0)
- turn_22_national_building: (5, 0)
- turn_23_presidential_control: (6, 0)

## Резервная копия

Создана резервная копия оригинального файла: \`focus_tree_nodes_backup.json\`

---
*Объединение выполнено: ${new Date().toISOString()}*
`;

  return report;
}

// Основная функция
function main() {
  console.log('🔄 Объединение древа фокусов...');
  
  const mergedFocusTree = mergeFocusTrees();
  const existingCount = existingFocusTree.focus_tree_nodes.length;
  const presidentialCount = presidentialFocusTree.focus_tree_nodes.length;
  const mergedCount = mergedFocusTree.focus_tree_nodes.length;
  
  // Запись объединенного файла
  fs.writeFileSync(mergedOutputPath, JSON.stringify(mergedFocusTree, null, 2), 'utf-8');
  
  // Создание отчета
  const report = createMergeReport(existingCount, presidentialCount, mergedCount);
  const reportPath = path.join(__dirname, 'merge_focus_trees_report.md');
  fs.writeFileSync(reportPath, report, 'utf-8');
  
  console.log(`✅ Объединение завершено!`);
  console.log(`📁 Объединенный файл: ${mergedOutputPath}`);
  console.log(`📄 Отчет: ${reportPath}`);
  console.log(`💾 Резервная копия: ${backupPath}`);
  
  console.log(`📊 Статистика:`);
  console.log(`   - Существующих фокусов: ${existingCount}`);
  console.log(`   - Президентских фокусов: ${presidentialCount}`);
  console.log(`   - Всего после объединения: ${mergedCount}`);
  
  // Проверка на конфликты координат
  const coordinates = mergedFocusTree.focus_tree_nodes.map(focus => ({id: focus.id, x: focus.x, y: focus.y}));
  const duplicateCoords = coordinates.filter((coord, index) => 
    coordinates.findIndex(c => c.x === coord.x && c.y === coord.y) !== index
  );
  
  if (duplicateCoords.length > 0) {
    console.log(`⚠️  Внимание: Найдены дублирующиеся координаты:`);
    duplicateCoords.forEach(coord => {
      console.log(`   - ${coord.id}: (${coord.x}, ${coord.y})`);
    });
  } else {
    console.log(`✅ Конфликтов координат не найдено`);
  }
}

// Запуск
main(); 