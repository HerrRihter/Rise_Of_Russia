const fs = require('fs');
const path = require('path');

// Пути к файлам
const combinedTimelinePath = path.join(__dirname, 'combined_timeline.json');
const outputPath = path.join(__dirname, 'historical_analysis.md');

// Чтение объединенной хронологии
const timeline = JSON.parse(fs.readFileSync(combinedTimelinePath, 'utf-8'));

// Функция для форматирования даты
function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Функция для анализа действий персонажа
function analyzeCharacterActions(actions) {
  const analysis = {
    totalActions: actions.length,
    successfulActions: actions.filter(a => a.success === 'success').length,
    failedActions: actions.filter(a => a.success === 'failure').length,
    mixedResults: actions.filter(a => a.success === 'mixed').length,
    characters: {}
  };

  // Группируем по персонажам
  actions.forEach(action => {
    if (!analysis.characters[action.character]) {
      analysis.characters[action.character] = {
        actions: [],
        successCount: 0,
        failureCount: 0
      };
    }
    analysis.characters[action.character].actions.push(action);
    if (action.success === 'success') analysis.characters[action.character].successCount++;
    if (action.success === 'failure') analysis.characters[action.character].failureCount++;
  });

  return analysis;
}

// Функция для определения ключевых тем
function extractKeyThemes(context, actions) {
  const themes = new Set();
  
  // Анализируем контекст
  const contextLower = context.toLowerCase();
  if (contextLower.includes('политик') || contextLower.includes('власть')) themes.add('Политика');
  if (contextLower.includes('экономик') || contextLower.includes('финанс')) themes.add('Экономика');
  if (contextLower.includes('безопасност') || contextLower.includes('оборон')) themes.add('Безопасность');
  if (contextLower.includes('международн') || contextLower.includes('дипломат')) themes.add('Международные отношения');
  if (contextLower.includes('социальн') || contextLower.includes('обществен')) themes.add('Социальная сфера');
  
  // Анализируем действия
  actions.forEach(action => {
    const actionLower = action.description.toLowerCase();
    if (actionLower.includes('реформа') || actionLower.includes('изменен')) themes.add('Реформы');
    if (actionLower.includes('конфликт') || actionLower.includes('противостояние')) themes.add('Конфликты');
    if (actionLower.includes('сотрудничество') || actionLower.includes('соглашение')) themes.add('Сотрудничество');
  });

  return Array.from(themes);
}

// Генерация исторического анализа
function generateHistoricalAnalysis() {
  let analysis = `# Исторический анализ: Россия в период трансформации

## Введение

Данный документ представляет собой аналитическое исследование ключевых событий и действий политических деятелей в России в период значительных социально-политических изменений. Анализ основан на хронологии событий и действиях ключевых персонажей, что позволяет проследить логику развития политических процессов и их влияние на различные сферы общественной жизни.

## Общая статистика

- **Всего ходов/периодов**: ${timeline.length}
- **Всего действий персонажей**: ${timeline.reduce((sum, turn) => sum + (turn.actions ? turn.actions.length : 0), 0)}
- **Период анализа**: ${timeline.length > 0 ? formatDate(timeline[0].date) : ''} - ${timeline.length > 0 ? formatDate(timeline[timeline.length - 1].date) : ''}

## Хронологический анализ

`;

  // Анализ по ходам
  timeline.forEach((turn, index) => {
    const turnNumber = index + 1;
    const date = formatDate(turn.date);
    const context = turn.context || 'Контекст не указан';
    const actions = turn.actions || [];
    
    if (actions.length > 0) {
      const actionAnalysis = analyzeCharacterActions(actions);
      const themes = extractKeyThemes(context, actions);
      
      analysis += `### Ход ${turnNumber}${date ? ` (${date})` : ''}

**Контекст периода:**
${context}

**Ключевые темы:** ${themes.join(', ')}

**Статистика действий:**
- Всего действий: ${actionAnalysis.totalActions}
- Успешных: ${actionAnalysis.successfulActions}
- Неудачных: ${actionAnalysis.failedActions}
- Смешанных результатов: ${actionAnalysis.mixedResults}

**Действия персонажей:**

`;

      // Анализ действий по персонажам
      Object.entries(actionAnalysis.characters).forEach(([character, charData]) => {
        analysis += `#### ${character}
- Действий: ${charData.actions.length}
- Успешных: ${charData.successCount}
- Неудачных: ${charData.failureCount}
- Процент успеха: ${charData.actions.length > 0 ? Math.round((charData.successCount / charData.actions.length) * 100) : 0}%

`;

        // Детализация действий
        charData.actions.forEach(action => {
          const successIcon = action.success === 'success' ? '✅' : 
                             action.success === 'failure' ? '❌' : '⚠️';
          analysis += `**${successIcon} ${action.title}**\n`;
          analysis += `*Результат:* ${action.result}\n`;
          if (action.key_points && action.key_points.length > 0) {
            analysis += `*Ключевые моменты:*\n`;
            action.key_points.forEach(point => {
              analysis += `- ${point}\n`;
            });
          }
          analysis += `\n`;
        });
      });
    } else {
      analysis += `### Ход ${turnNumber}${date ? ` (${date})` : ''}

**Контекст периода:**
${context}

*В данном периоде не зафиксировано действий персонажей.*

`;
    }
    
    analysis += `---\n\n`;
  });

  // Заключение
  analysis += `## Заключение

Данный анализ демонстрирует сложность и многогранность политических процессов в России. Каждый период характеризуется уникальным сочетанием внешних обстоятельств и действий ключевых политических фигур, что формирует динамичную картину развития страны.

### Ключевые выводы:

1. **Динамика политических процессов**: Политическая жизнь характеризуется высокой активностью и постоянными изменениями в расстановке сил.

2. **Роль личности в истории**: Действия отдельных политических деятелей оказывают значительное влияние на развитие событий.

3. **Многофакторность решений**: Политические решения принимаются с учетом множества факторов, включая экономические, социальные и международные аспекты.

4. **Неопределенность результатов**: Даже тщательно спланированные действия могут иметь непредвиденные последствия.

### Методологические замечания:

Данный анализ основан на структурированных данных о событиях и действиях. При интерпретации результатов следует учитывать, что любая историческая реконструкция является упрощением сложной реальности и может не отражать все нюансы и контексты происходивших событий.

---
*Документ сгенерирован автоматически на основе структурированных данных о событиях и действиях политических деятелей.*
`;

  return analysis;
}

// Запись результата
const analysis = generateHistoricalAnalysis();
fs.writeFileSync(outputPath, analysis, 'utf-8');

console.log(`✅ Исторический анализ создан: ${outputPath}`);
console.log(`📊 Обработано ходов: ${timeline.length}`);
console.log(`📈 Общее количество действий: ${timeline.reduce((sum, turn) => sum + (turn.actions ? turn.actions.length : 0), 0)}`); 