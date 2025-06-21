const fs = require('fs');
const path = require('path');

// Функция для извлечения сущностей из текста
function extractEntities(text) {
  const entities = {
    people: [],
    organizations: [],
    locations: [],
    events: [],
    concepts: []
  };

  // Простые паттерны для извлечения (можно улучшить с помощью NLP)
  const peoplePatterns = [
    /([А-Я][а-я]+ [А-Я][а-я]+)/g,
    /([А-Я][а-я]+ [А-Я]\. [А-Я]\.)/g
  ];

  const organizationPatterns = [
    /(ФСБ|МВД|МЧС|МИД|АП|Совет Федерации|Госдума|Кремль|Ростех|НФБ|ЧВК|Марс)/g,
    /(Минэкономразвития|Минобороны|Минфин|Минтранс|Минобрнауки)/g
  ];

  const locationPatterns = [
    /(Москва|Петербург|Владивосток|Приморье|Кавказ|Чечня|Дагестан|Ингушетия|Украина|СНГ|АСЕАН)/g,
    /(Дальний Восток|Северный Кавказ|Средняя Азия)/g
  ];

  // Извлечение людей
  peoplePatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      entities.people.push(...matches.filter(match => match.length > 3));
    }
  });

  // Извлечение организаций
  organizationPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      entities.organizations.push(...matches);
    }
  });

  // Извлечение локаций
  locationPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      entities.locations.push(...matches);
    }
  });

  // Удаление дубликатов
  Object.keys(entities).forEach(key => {
    entities[key] = [...new Set(entities[key])];
  });

  return entities;
}

// Функция для анализа настроения
function analyzeSentiment(text, successScore) {
  const positiveWords = ['успешно', 'удалось', 'достигнуто', 'укреплено', 'поддержано', 'одобрено'];
  const negativeWords = ['провал', 'неудача', 'отклонено', 'заблокировано', 'сорвалось', 'провалилось'];
  
  const textLower = text.toLowerCase();
  let positiveCount = 0;
  let negativeCount = 0;

  positiveWords.forEach(word => {
    if (textLower.includes(word)) positiveCount++;
  });

  negativeWords.forEach(word => {
    if (textLower.includes(word)) negativeCount++;
  });

  // Учитываем success_score
  if (successScore >= 15) positiveCount += 2;
  else if (successScore <= 5) negativeCount += 2;

  if (positiveCount > negativeCount) return 'positive';
  else if (negativeCount > positiveCount) return 'negative';
  else return 'neutral';
}

// Функция для извлечения тем
function extractThemes(text, tags) {
  const themes = [];
  const textLower = text.toLowerCase();
  
  const themePatterns = {
    'politics': ['политика', 'аппарат', 'кремль', 'администрация', 'правительство'],
    'economy': ['экономика', 'финансы', 'банк', 'инвестиции', 'бизнес', 'производство'],
    'security': ['безопасность', 'ФСБ', 'МВД', 'операция', 'антитеррор', 'силовики'],
    'diplomacy': ['дипломатия', 'МИД', 'международные', 'внешняя политика'],
    'infrastructure': ['инфраструктура', 'строительство', 'транспорт', 'развитие'],
    'education': ['образование', 'вуз', 'наука', 'исследования'],
    'culture': ['культура', 'музей', 'история', 'духовность']
  };

  Object.entries(themePatterns).forEach(([theme, keywords]) => {
    const relevance = keywords.reduce((score, keyword) => {
      return score + (textLower.includes(keyword) ? 1 : 0);
    }, 0);

    if (relevance > 0) {
      themes.push({
        theme,
        relevance: Math.min(relevance / keywords.length, 1.0)
      });
    }
  });

  // Добавляем темы из тегов
  tags.forEach(tag => {
    const tagLower = tag.toLowerCase();
    Object.entries(themePatterns).forEach(([theme, keywords]) => {
      if (keywords.some(keyword => tagLower.includes(keyword))) {
        const existingTheme = themes.find(t => t.theme === theme);
        if (existingTheme) {
          existingTheme.relevance = Math.min(existingTheme.relevance + 0.3, 1.0);
        } else {
          themes.push({ theme, relevance: 0.5 });
        }
      }
    });
  });

  return themes.sort((a, b) => b.relevance - a.relevance);
}

// Функция для создания чанков
function createChunks(text, actionId) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const chunks = [];
  let currentChunk = '';
  let chunkId = 1;

  sentences.forEach(sentence => {
    const sentenceWithPunctuation = sentence.trim() + '.';
    
    if ((currentChunk + sentenceWithPunctuation).length > 500) {
      if (currentChunk.trim()) {
        chunks.push({
          chunk_id: `${actionId}_chunk_${chunkId}`,
          content: currentChunk.trim(),
          tokens_estimate: Math.ceil(currentChunk.length / 4),
          entities: extractEntities(currentChunk),
          sentiment: analyzeSentiment(currentChunk, 0)
        });
        chunkId++;
      }
      currentChunk = sentenceWithPunctuation;
    } else {
      currentChunk += ' ' + sentenceWithPunctuation;
    }
  });

  if (currentChunk.trim()) {
    chunks.push({
      chunk_id: `${actionId}_chunk_${chunkId}`,
      content: currentChunk.trim(),
      tokens_estimate: Math.ceil(currentChunk.length / 4),
      entities: extractEntities(currentChunk),
      sentiment: analyzeSentiment(currentChunk, 0)
    });
  }

  return chunks;
}

// Функция для анализа сложности
function analyzeComplexity(text, successScore) {
  const wordCount = text.split(/\s+/).length;
  const sentenceCount = text.split(/[.!?]+/).length - 1;
  const avgWordsPerSentence = wordCount / sentenceCount;
  
  let complexity = 'low';
  if (wordCount > 100 || avgWordsPerSentence > 20 || successScore > 15) {
    complexity = 'high';
  } else if (wordCount > 50 || avgWordsPerSentence > 15) {
    complexity = 'medium';
  }

  return complexity;
}

// Функция для извлечения ключевых моментов
function extractKeyPoints(text, result) {
  const keyPoints = [];
  
  // Извлекаем ключевые фразы из результата
  const resultSentences = result.split(/[.!?]+/).filter(s => s.trim().length > 10);
  resultSentences.forEach(sentence => {
    const trimmed = sentence.trim();
    if (trimmed.length > 20 && trimmed.length < 100) {
      keyPoints.push(trimmed);
    }
  });

  return keyPoints.slice(0, 3); // Ограничиваем тремя ключевыми моментами
}

// Основная функция оптимизации действия
function optimizeAction(action) {
  const optimized = {
    action_id: action.id,
    turn_id: action.turn,
    character: action.character,
    metadata: {
      title: action.title,
      date: action.date,
      success_score: action.success_score,
      word_count: action.text.split(/\s+/).length,
      complexity_score: analyzeComplexity(action.text, action.success_score),
      sentiment_overall: analyzeSentiment(action.text + ' ' + action.result, action.success_score)
    },
    content: {
      description: action.text,
      result: action.result,
      tags: action.tags,
      chunks: createChunks(action.text + ' ' + action.result, action.id),
      key_points: extractKeyPoints(action.text, action.result)
    },
    indexes: {
      entities: extractEntities(action.text + ' ' + action.result),
      themes: extractThemes(action.text + ' ' + action.result, action.tags),
      success_level: action.success_score >= 15 ? 'high' : action.success_score >= 10 ? 'medium' : 'low'
    },
    analysis: {
      success_analysis: action.success_score >= 15 ? 'successful' : action.success_score >= 10 ? 'partial' : 'failed',
      impact_scope: action.text.includes('федеральный') || action.text.includes('международный') ? 'federal' : 'local',
      risk_level: action.success_score <= 5 ? 'high' : action.success_score <= 10 ? 'medium' : 'low',
      strategic_value: action.text.includes('стратегический') || action.text.includes('ключевой') ? 'high' : 'medium'
    }
  };

  return optimized;
}

// Функция для обработки файла действий
function processActionsFile(inputPath, outputPath) {
  console.log('🔄 Обработка файла действий...');
  
  const inputData = fs.readFileSync(inputPath, 'utf8');
  const lines = inputData.trim().split('\n');
  const actions = [];
  
  lines.forEach((line, index) => {
    try {
      const action = JSON.parse(line);
      actions.push(action);
    } catch (error) {
      console.warn(`⚠️ Ошибка парсинга строки ${index + 1}:`, error.message);
    }
  });

  console.log(`📊 Найдено ${actions.length} действий`);

  const optimizedActions = actions.map(action => optimizeAction(action));
  
  // Сохраняем оптимизированные действия
  const outputData = optimizedActions.map(action => JSON.stringify(action)).join('\n');
  fs.writeFileSync(outputPath, outputData);
  
  console.log(`✅ Оптимизированные действия сохранены в ${outputPath}`);
  
  return {
    total_actions: actions.length,
    processed_actions: optimizedActions.length,
    output_path: outputPath
  };
}

// Функция для создания отчета о качестве
function createQualityReport(actions) {
  const report = {
    total_actions: actions.length,
    characters: {},
    turns: {},
    success_distribution: { high: 0, medium: 0, low: 0 },
    sentiment_distribution: { positive: 0, neutral: 0, negative: 0 },
    theme_distribution: {},
    entity_coverage: { people: 0, organizations: 0, locations: 0 },
    processing_date: new Date().toISOString()
  };

  actions.forEach(action => {
    // Распределение по персонажам
    const character = action.character;
    report.characters[character] = (report.characters[character] || 0) + 1;

    // Распределение по ходам
    const turn = action.turn_id;
    report.turns[turn] = (report.turns[turn] || 0) + 1;

    // Распределение по успешности
    const successLevel = action.indexes.success_level;
    report.success_distribution[successLevel]++;

    // Распределение по настроению
    const sentiment = action.metadata.sentiment_overall;
    report.sentiment_distribution[sentiment]++;

    // Распределение по темам
    action.indexes.themes.forEach(theme => {
      report.theme_distribution[theme.theme] = (report.theme_distribution[theme.theme] || 0) + 1;
    });

    // Покрытие сущностей
    Object.keys(action.indexes.entities).forEach(entityType => {
      const count = action.indexes.entities[entityType].length;
      report.entity_coverage[entityType] += count;
    });
  });

  return report;
}

// Экспорт функций
module.exports = {
  processActionsFile,
  optimizeAction,
  createQualityReport,
  extractEntities,
  analyzeSentiment,
  extractThemes
};

// Если скрипт запущен напрямую
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Использование: node optimize-actions-structure.cjs <input_file> <output_file>');
    process.exit(1);
  }

  const [inputPath, outputPath] = args;
  
  try {
    const result = processActionsFile(inputPath, outputPath);
    console.log('📈 Результаты обработки:', result);
    
    // Создаем отчет о качестве
    const inputData = fs.readFileSync(outputPath, 'utf8');
    const actions = inputData.trim().split('\n').map(line => JSON.parse(line));
    const qualityReport = createQualityReport(actions);
    
    const reportPath = outputPath.replace('.jsonl', '_quality_report.json');
    fs.writeFileSync(reportPath, JSON.stringify(qualityReport, null, 2));
    console.log(`📊 Отчет о качестве сохранен в ${reportPath}`);
    
  } catch (error) {
    console.error('❌ Ошибка обработки:', error.message);
    process.exit(1);
  }
} 