const fs = require('fs');
const path = require('path');

// Функция для извлечения ключевых сущностей из текста
function extractEntities(text) {
  const entities = {
    people: [],
    organizations: [],
    locations: [],
    events: [],
    concepts: []
  };

  // Простые паттерны для извлечения сущностей (в реальном проекте лучше использовать NLP)
  const peoplePattern = /([А-Я][а-я]+ [А-Я][а-я]+)/g;
  const orgPattern = /([А-Я]{2,}|[А-Я][а-я]+ [А-Я][а-я]+)/g;
  const locationPattern = /(Москва|Петербург|Владивосток|Приморье|Кавказ|Сибирь|Поволжье)/g;
  
  // Извлечение людей
  const peopleMatches = text.match(peoplePattern) || [];
  entities.people = [...new Set(peopleMatches)];

  // Извлечение организаций
  const orgMatches = text.match(orgPattern) || [];
  entities.organizations = [...new Set(orgMatches)];

  // Извлечение локаций
  const locationMatches = text.match(locationPattern) || [];
  entities.locations = [...new Set(locationMatches)];

  return entities;
}

// Функция для разбиения текста на чанки
function splitIntoChunks(text, maxTokens = 1000) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const chunks = [];
  let currentChunk = '';
  let currentTokens = 0;

  for (const sentence of sentences) {
    const sentenceTokens = sentence.split(' ').length;
    
    if (currentTokens + sentenceTokens > maxTokens && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
      currentTokens = sentenceTokens;
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
      currentTokens += sentenceTokens;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

// Функция для анализа тональности (упрощенная)
function analyzeSentiment(text) {
  const positiveWords = ['рост', 'успех', 'развитие', 'укрепление', 'прогресс'];
  const negativeWords = ['кризис', 'проблема', 'конфликт', 'напряженность', 'угроза'];
  
  const words = text.toLowerCase().split(/\s+/);
  let positiveCount = 0;
  let negativeCount = 0;

  words.forEach(word => {
    if (positiveWords.some(pw => word.includes(pw))) positiveCount++;
    if (negativeWords.some(nw => word.includes(nw))) negativeCount++;
  });

  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

// Функция для извлечения ключевых тем
function extractKeyThemes(text) {
  const themes = {
    politics: ['власть', 'кремль', 'президент', 'правительство', 'вертикаль'],
    economy: ['экономика', 'бизнес', 'инвестиции', 'нефть', 'финансы'],
    security: ['безопасность', 'силовые', 'контроль', 'порядок'],
    international: ['международные', 'внешняя политика', 'дипломатия'],
    society: ['общество', 'культура', 'социальная сфера']
  };

  const foundThemes = [];
  const lowerText = text.toLowerCase();

  Object.entries(themes).forEach(([theme, keywords]) => {
    const matchCount = keywords.filter(keyword => 
      lowerText.includes(keyword)
    ).length;
    
    if (matchCount > 0) {
      foundThemes.push({
        theme,
        relevance: matchCount / keywords.length
      });
    }
  });

  return foundThemes.sort((a, b) => b.relevance - a.relevance);
}

// Основная функция оптимизации структуры
function optimizeTurnStructure(originalTurn) {
  const optimized = {
    turn_id: originalTurn.turn_id,
    id: originalTurn.id,
    metadata: {
      title: originalTurn.title,
      date: originalTurn.date,
      period: originalTurn.period,
      summary: originalTurn.summary,
      word_count: originalTurn.sections.reduce((acc, section) => 
        acc + section.content.split(' ').length, 0
      ),
      sections_count: originalTurn.sections.length,
      complexity_score: 0.8, // Можно вычислить на основе длины и сложности текста
      sentiment_overall: 'neutral'
    },
    content: {
      sections: {},
      chunks: [],
      key_events: [],
      key_decisions: []
    },
    indexes: {
      entities: {
        people: [],
        organizations: [],
        locations: [],
        events: [],
        concepts: []
      },
      themes: [],
      topics: {}
    },
    connections: {
      temporal: {},
      causal: {},
      thematic: {}
    },
    analysis: {
      sentiment: 'neutral',
      complexity: 'high',
      key_themes: [],
      risk_factors: [],
      opportunities: []
    }
  };

  // Обработка секций
  originalTurn.sections.forEach(section => {
    const sectionName = section.section;
    const content = section.content;
    
    // Извлечение сущностей
    const entities = extractEntities(content);
    
    // Анализ тональности
    const sentiment = analyzeSentiment(content);
    
    // Извлечение тем
    const themes = extractKeyThemes(content);
    
    // Разбиение на чанки
    const chunks = splitIntoChunks(content);
    
    // Оптимизированная секция
    optimized.content.sections[sectionName] = {
      content: content,
      entities: entities,
      sentiment: sentiment,
      themes: themes,
      chunks: chunks.map((chunk, index) => ({
        chunk_id: `${originalTurn.id}_${sectionName}_${index + 1}`,
        content: chunk,
        tokens_estimate: chunk.split(' ').length,
        entities: extractEntities(chunk),
        sentiment: analyzeSentiment(chunk)
      })),
      key_points: extractKeyPoints(content),
      word_count: content.split(' ').length
    };

    // Добавление чанков в общий массив
    optimized.content.chunks.push(...optimized.content.sections[sectionName].chunks);
    
    // Обновление индексов
    Object.keys(entities).forEach(entityType => {
      optimized.indexes.entities[entityType].push(...entities[entityType]);
    });
    
    optimized.indexes.themes.push(...themes);
  });

  // Удаление дубликатов в индексах
  Object.keys(optimized.indexes.entities).forEach(entityType => {
    optimized.indexes.entities[entityType] = [...new Set(optimized.indexes.entities[entityType])];
  });

  // Анализ общих тем
  optimized.analysis.key_themes = optimized.indexes.themes
    .slice(0, 5)
    .map(theme => theme.theme);

  // Определение общего настроения
  const sentiments = Object.values(optimized.content.sections)
    .map(section => section.sentiment);
  
  const positiveCount = sentiments.filter(s => s === 'positive').length;
  const negativeCount = sentiments.filter(s => s === 'negative').length;
  
  if (positiveCount > negativeCount) optimized.analysis.sentiment = 'positive';
  else if (negativeCount > positiveCount) optimized.analysis.sentiment = 'negative';

  return optimized;
}

// Функция для извлечения ключевых моментов
function extractKeyPoints(text) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const keyPoints = [];
  
  // Простая эвристика для определения важных предложений
  const importantKeywords = ['важно', 'ключевой', 'основной', 'главный', 'решение', 'изменение'];
  
  sentences.forEach(sentence => {
    const lowerSentence = sentence.toLowerCase();
    const importance = importantKeywords.filter(keyword => 
      lowerSentence.includes(keyword)
    ).length;
    
    if (importance > 0 || sentence.length > 100) {
      keyPoints.push({
        text: sentence.trim(),
        importance: importance
      });
    }
  });

  return keyPoints
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 5)
    .map(point => point.text);
}

// Функция для обработки всего файла
function processTurnsFile(inputPath, outputPath) {
  console.log('Начинаю обработку файла...');
  
  const inputContent = fs.readFileSync(inputPath, 'utf8');
  const lines = inputContent.split('\n').filter(line => line.trim());
  
  const optimizedTurns = [];
  let processedCount = 0;

  lines.forEach((line, index) => {
    try {
      const originalTurn = JSON.parse(line);
      const optimizedTurn = optimizeTurnStructure(originalTurn);
      optimizedTurns.push(optimizedTurn);
      
      processedCount++;
      if (processedCount % 10 === 0) {
        console.log(`Обработано ходов: ${processedCount}`);
      }
    } catch (error) {
      console.error(`Ошибка при обработке строки ${index + 1}:`, error.message);
    }
  });

  // Сохранение оптимизированного файла
  const outputContent = optimizedTurns.map(turn => JSON.stringify(turn)).join('\n');
  fs.writeFileSync(outputPath, outputContent, 'utf8');
  
  console.log(`Обработка завершена! Обработано ходов: ${processedCount}`);
  console.log(`Результат сохранен в: ${outputPath}`);
  
  // Создание дополнительного файла с метаданными
  const metadata = {
    total_turns: processedCount,
    processing_date: new Date().toISOString(),
    structure_version: '1.0',
    optimization_features: [
      'entity_extraction',
      'sentiment_analysis', 
      'chunking',
      'theme_extraction',
      'indexing'
    ]
  };
  
  const metadataPath = outputPath.replace('.jsonl', '_metadata.json');
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf8');
  
  return {
    processedCount,
    outputPath,
    metadataPath
  };
}

// Экспорт функций
module.exports = {
  optimizeTurnStructure,
  processTurnsFile,
  extractEntities,
  splitIntoChunks,
  analyzeSentiment,
  extractKeyThemes
};

// Если скрипт запущен напрямую
if (require.main === module) {
  const inputPath = process.argv[2] || 'd:/Downloads/turns_hierarchical.jsonl';
  const outputPath = process.argv[3] || 'turns_optimized.jsonl';
  
  if (!fs.existsSync(inputPath)) {
    console.error(`Файл не найден: ${inputPath}`);
    process.exit(1);
  }
  
  processTurnsFile(inputPath, outputPath);
} 