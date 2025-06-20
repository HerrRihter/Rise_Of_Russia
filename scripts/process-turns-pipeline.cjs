const fs = require('fs');
const path = require('path');

// Импорт модулей обработки
const { processTurnsFile } = require('./optimize-turns-structure.cjs');
const { processTurnsWithConnections } = require('./create-turn-connections.cjs');

// Функция для создания примера оптимизированной структуры
function createExampleStructure() {
  const example = {
    turn_id: 1,
    id: "turn_14",
    metadata: {
      title: "Россия, Ноябрь 2000 — Январь 2001: Дисциплина Вертикали",
      date: "2000-11-01",
      period: "зима 2000-2001",
      summary: "Укрепление «вертикали власти» и контроля над регионами...",
      word_count: 15000,
      sections_count: 10,
      complexity_score: 0.8,
      sentiment_overall: "neutral"
    },
    content: {
      sections: {
        intro: {
          content: "**Вступление.** Общественные настроения отразили последствия предыдущего этапа...",
          entities: {
            people: ["Путин"],
            organizations: ["Кремль"],
            locations: ["Москва", "Петербург", "Владивосток"],
            events: [],
            concepts: ["вертикаль власти", "стабильность"]
          },
          sentiment: "neutral",
          themes: [
            { theme: "politics", relevance: 0.8 },
            { theme: "society", relevance: 0.6 }
          ],
          chunks: [
            {
              chunk_id: "turn_14_intro_1",
              content: "**Вступление.** Общественные настроения отразили последствия предыдущего этапа...",
              tokens_estimate: 500,
              entities: { people: ["Путин"], organizations: ["Кремль"] },
              sentiment: "neutral"
            }
          ],
          key_points: [
            "Укрепление вертикали власти",
            "Переход от олигархии к управляемому бизнесу"
          ],
          word_count: 2500
        }
      },
      chunks: [],
      key_events: [
        "Укрепление вертикали власти",
        "Запуск программы Москва-2010",
        "Конфликт с южнокорейскими инвесторами"
      ],
      key_decisions: [
        "Усиление контроля над регионами",
        "Переход к технократическому управлению"
      ]
    },
    indexes: {
      entities: {
        people: ["Путин", "Долгов", "Литвинов"],
        organizations: ["Кремль", "ФСБ", "Совет Федерации"],
        locations: ["Москва", "Петербург", "Владивосток", "Приморье"],
        events: ["Бульдозерная революция"],
        concepts: ["вертикаль власти", "управляемая стабильность"]
      },
      themes: [
        { theme: "politics", relevance: 0.9 },
        { theme: "economy", relevance: 0.7 },
        { theme: "security", relevance: 0.6 }
      ],
      topics: {
        "централизация": ["политика", "управление"],
        "экономическая модернизация": ["экономика", "технологии"],
        "силовая политика": ["безопасность", "контроль"]
      }
    },
    connections: {
      previous_turn: "turn_13",
      next_turn: "turn_15",
      related_turns: ["turn_12", "turn_16"],
      continuity_flags: {
        ongoing_crisis: ["дальневосточные инвестиции"],
        new_developments: ["позиция США", "кавказская ситуация"],
        resolved_issues: []
      }
    },
    analysis: {
      sentiment: "neutral",
      complexity: "high",
      key_themes: ["politics", "economy", "security"],
      risk_factors: [
        "напряженность на Кавказе",
        "конфликт с иностранными инвесторами"
      ],
      opportunities: [
        "экономический рост",
        "технологическая модернизация"
      ]
    }
  };

  return example;
}

// Функция для валидации структуры
function validateStructure(turn) {
  const errors = [];
  
  // Проверка обязательных полей
  const requiredFields = ['turn_id', 'id', 'metadata', 'content', 'indexes', 'analysis'];
  requiredFields.forEach(field => {
    if (!turn[field]) {
      errors.push(`Отсутствует обязательное поле: ${field}`);
    }
  });
  
  // Проверка метаданных
  if (turn.metadata) {
    const requiredMetadata = ['title', 'date', 'summary'];
    requiredMetadata.forEach(field => {
      if (!turn.metadata[field]) {
        errors.push(`Отсутствует обязательное поле в metadata: ${field}`);
      }
    });
  }
  
  // Проверка индексов
  if (turn.indexes) {
    const requiredIndexes = ['entities', 'themes'];
    requiredIndexes.forEach(field => {
      if (!turn.indexes[field]) {
        errors.push(`Отсутствует обязательное поле в indexes: ${field}`);
      }
    });
  }
  
  return errors;
}

// Функция для создания отчета о качестве
function createQualityReport(turns) {
  const report = {
    total_turns: turns.length,
    validation_errors: 0,
    average_word_count: 0,
    average_sections: 0,
    sentiment_distribution: {},
    theme_distribution: {},
    entity_coverage: {},
    processing_date: new Date().toISOString()
  };
  
  let totalWords = 0;
  let totalSections = 0;
  let errors = 0;
  
  turns.forEach(turn => {
    // Подсчет ошибок валидации
    const validationErrors = validateStructure(turn);
    errors += validationErrors.length;
    
    // Подсчет статистики
    totalWords += turn.metadata?.word_count || 0;
    totalSections += turn.metadata?.sections_count || 0;
    
    // Распределение настроений
    const sentiment = turn.analysis?.sentiment || 'unknown';
    report.sentiment_distribution[sentiment] = (report.sentiment_distribution[sentiment] || 0) + 1;
    
    // Распределение тем
    turn.indexes?.themes?.forEach(theme => {
      report.theme_distribution[theme.theme] = (report.theme_distribution[theme.theme] || 0) + 1;
    });
    
    // Покрытие сущностей
    Object.keys(turn.indexes?.entities || {}).forEach(entityType => {
      const count = turn.indexes.entities[entityType].length;
      report.entity_coverage[entityType] = (report.entity_coverage[entityType] || 0) + count;
    });
  });
  
  report.validation_errors = errors;
  report.average_word_count = Math.round(totalWords / turns.length);
  report.average_sections = Math.round(totalSections / turns.length);
  
  return report;
}

// Основная функция пайплайна
async function processTurnsPipeline(inputPath, outputDir = './processed') {
  console.log('🚀 Запуск пайплайна обработки ходов...');
  
  // Создание директории для результатов
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const baseOutputPath = path.join(outputDir, `turns_processed_${timestamp}`);
  
  try {
    // Шаг 1: Базовая оптимизация структуры
    console.log('\n📋 Шаг 1: Базовая оптимизация структуры...');
    const optimizedPath = `${baseOutputPath}_optimized.jsonl`;
    const step1Result = processTurnsFile(inputPath, optimizedPath);
    
    console.log(`✅ Шаг 1 завершен: ${step1Result.processedCount} ходов обработано`);
    
    // Шаг 2: Создание связей и дополнительная оптимизация
    console.log('\n🔗 Шаг 2: Создание связей между ходами...');
    const finalPath = `${baseOutputPath}_final.json`;
    const step2Result = processTurnsWithConnections(optimizedPath, finalPath);
    
    console.log(`✅ Шаг 2 завершен: ${step2Result.turnsCount} ходов с связями`);
    
    // Шаг 3: Создание отчета о качестве
    console.log('\n📊 Шаг 3: Создание отчета о качестве...');
    const finalContent = fs.readFileSync(finalPath, 'utf8');
    const finalData = JSON.parse(finalContent);
    const qualityReport = createQualityReport(finalData.turns);
    
    const reportPath = `${baseOutputPath}_quality_report.json`;
    fs.writeFileSync(reportPath, JSON.stringify(qualityReport, null, 2), 'utf8');
    
    console.log(`✅ Шаг 3 завершен: отчет сохранен в ${reportPath}`);
    
    // Шаг 4: Создание примера структуры
    console.log('\n📝 Шаг 4: Создание примера структуры...');
    const exampleStructure = createExampleStructure();
    const examplePath = `${baseOutputPath}_example.json`;
    fs.writeFileSync(examplePath, JSON.stringify(exampleStructure, null, 2), 'utf8');
    
    console.log(`✅ Шаг 4 завершен: пример сохранен в ${examplePath}`);
    
    // Создание README с описанием структуры
    console.log('\n📖 Создание документации...');
    const readmeContent = createReadmeDocumentation();
    const readmePath = `${baseOutputPath}_README.md`;
    fs.writeFileSync(readmePath, readmeContent, 'utf8');
    
    console.log(`✅ Документация сохранена в ${readmePath}`);
    
    // Финальный отчет
    console.log('\n🎉 Пайплайн обработки завершен успешно!');
    console.log('\n📁 Созданные файлы:');
    console.log(`   • ${optimizedPath} - Оптимизированные ходы`);
    console.log(`   • ${finalPath} - Финальная структура с связями`);
    console.log(`   • ${step2Result.timelinePath} - Временные линии`);
    console.log(`   • ${step2Result.searchIndexPath} - Поисковый индекс`);
    console.log(`   • ${reportPath} - Отчет о качестве`);
    console.log(`   • ${examplePath} - Пример структуры`);
    console.log(`   • ${readmePath} - Документация`);
    
    return {
      success: true,
      files: {
        optimized: optimizedPath,
        final: finalPath,
        timeline: step2Result.timelinePath,
        searchIndex: step2Result.searchIndexPath,
        qualityReport: reportPath,
        example: examplePath,
        readme: readmePath
      },
      stats: {
        totalTurns: step2Result.turnsCount,
        qualityReport: qualityReport
      }
    };
    
  } catch (error) {
    console.error('❌ Ошибка в пайплайне:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Функция для создания документации
function createReadmeDocumentation() {
  return `# Оптимизированная структура ходов для нейросети

## Обзор

Этот документ описывает оптимизированную структуру данных для эффективного чтения нейросетью.

## Структура файлов

### 1. Основные файлы
- \`turns_processed_*_final.json\` - Полная оптимизированная структура
- \`turns_processed_*_optimized.jsonl\` - Базовые оптимизированные ходы
- \`turns_processed_*_example.json\` - Пример структуры одного хода

### 2. Дополнительные файлы
- \`turns_processed_*_timeline.json\` - Временные линии событий
- \`turns_processed_*_search_index.json\` - Поисковый индекс
- \`turns_processed_*_quality_report.json\` - Отчет о качестве обработки

## Структура хода

### Метаданные
\`\`\`json
{
  "metadata": {
    "title": "Заголовок хода",
    "date": "2000-11-01",
    "period": "зима 2000-2001",
    "summary": "Краткое описание",
    "word_count": 15000,
    "sections_count": 10,
    "complexity_score": 0.8,
    "sentiment_overall": "neutral"
  }
}
\`\`\`

### Контент
\`\`\`json
{
  "content": {
    "sections": {
      "intro": {
        "content": "Текст секции",
        "entities": { "people": [], "organizations": [] },
        "sentiment": "neutral",
        "themes": [{ "theme": "politics", "relevance": 0.8 }],
        "chunks": [{ "chunk_id": "id", "content": "чанк", "tokens_estimate": 500 }],
        "key_points": ["ключевые моменты"]
      }
    },
    "chunks": [],
    "key_events": [],
    "key_decisions": []
  }
}
\`\`\`

### Индексы
\`\`\`json
{
  "indexes": {
    "entities": {
      "people": ["Путин", "Долгов"],
      "organizations": ["Кремль", "ФСБ"],
      "locations": ["Москва", "Петербург"],
      "events": [],
      "concepts": ["вертикаль власти"]
    },
    "themes": [{ "theme": "politics", "relevance": 0.9 }]
  }
}
\`\`\`

### Связи
\`\`\`json
{
  "connections": {
    "previous_turn": "turn_13",
    "next_turn": "turn_15",
    "related_turns": ["turn_12", "turn_16"],
    "continuity_flags": {
      "ongoing_crisis": [],
      "new_developments": [],
      "resolved_issues": []
    }
  }
}
\`\`\`

### Анализ
\`\`\`json
{
  "analysis": {
    "sentiment": "neutral",
    "complexity": "high",
    "key_themes": ["politics", "economy"],
    "risk_factors": [],
    "opportunities": []
  }
}
\`\`\`

## Преимущества для нейросети

### 1. Структурированные данные
- Четкое разделение на секции и чанки
- Извлеченные сущности и темы
- Анализ настроения

### 2. Быстрый поиск
- Индексы по сущностям, темам, датам
- Связи между ходами
- Временные линии

### 3. Оптимизированные чанки
- Размер чанков адаптирован под контекстное окно
- Перекрытие между чанками
- Метаданные для каждого чанка

### 4. Семантические связи
- Причинно-следственные связи
- Тематические группировки
- Непрерывность событий

## Использование

### Загрузка данных
\`\`\`javascript
const data = JSON.parse(fs.readFileSync('turns_final.json', 'utf8'));
const turns = data.turns;
const timeline = data.timeline;
const searchIndex = data.search_index;
\`\`\`

### Поиск по сущностям
\`\`\`javascript
const putinTurns = searchIndex.by_entity['Путин'];
\`\`\`

### Поиск по темам
\`\`\`javascript
const politicsTurns = searchIndex.by_theme['politics'];
\`\`\`

### Временная линия
\`\`\`javascript
const putinTimeline = timeline.characters['Путин'];
\`\`\`

## Рекомендации по использованию

1. **Контекстное окно**: Используйте чанки размером 1000-2000 токенов
2. **Приоритизация**: Обращайте внимание на relevance в темах и сущностях
3. **Связи**: Используйте connections для понимания контекста
4. **Временные линии**: Отслеживайте развитие событий во времени
5. **Анализ**: Учитывайте sentiment и complexity для выбора стратегии

## Версии структуры

- **v1.0**: Базовая оптимизация с извлечением сущностей
- **v2.0**: Добавлены связи между ходами и временные линии
- **v2.1**: Улучшенный поисковый индекс и анализ качества
`;
}

// Экспорт функций
module.exports = {
  processTurnsPipeline,
  validateStructure,
  createQualityReport,
  createExampleStructure
};

// Если скрипт запущен напрямую
if (require.main === module) {
  const inputPath = process.argv[2] || 'd:/Downloads/turns_hierarchical.jsonl';
  const outputDir = process.argv[3] || './processed';
  
  if (!fs.existsSync(inputPath)) {
    console.error(`❌ Файл не найден: ${inputPath}`);
    console.log('\n💡 Использование:');
    console.log('   node process-turns-pipeline.js <input_file> [output_directory]');
    console.log('\n📝 Пример:');
    console.log('   node process-turns-pipeline.js d:/Downloads/turns_hierarchical.jsonl ./processed');
    process.exit(1);
  }
  
  processTurnsPipeline(inputPath, outputDir)
    .then(result => {
      if (result.success) {
        console.log('\n✅ Пайплайн завершен успешно!');
        process.exit(0);
      } else {
        console.error('\n❌ Пайплайн завершился с ошибкой:', result.error);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n❌ Неожиданная ошибка:', error.message);
      process.exit(1);
    });
} 