const fs = require('fs');

// Функция для создания связей между ходами
function createTurnConnections(turns) {
  console.log('Создание связей между ходами...');
  
  const connectedTurns = [];
  
  turns.forEach((turn, index) => {
    const connectedTurn = { ...turn };
    
    // Добавление связей с предыдущим и следующим ходом
    connectedTurn.connections = {
      previous_turn: index > 0 ? turns[index - 1].id : null,
      next_turn: index < turns.length - 1 ? turns[index + 1].id : null,
      related_turns: [],
      continuity_flags: {
        ongoing_crisis: [],
        new_developments: [],
        resolved_issues: []
      }
    };
    
    // Поиск связанных ходов по темам и сущностям
    const relatedTurns = findRelatedTurns(turn, turns, index);
    connectedTurn.connections.related_turns = relatedTurns;
    
    // Анализ непрерывности событий
    if (index > 0) {
      const previousTurn = turns[index - 1];
      const continuity = analyzeContinuity(previousTurn, turn);
      connectedTurn.connections.continuity_flags = continuity;
    }
    
    connectedTurns.push(connectedTurn);
  });
  
  return connectedTurns;
}

// Функция для поиска связанных ходов
function findRelatedTurns(currentTurn, allTurns, currentIndex) {
  const related = [];
  const currentEntities = new Set();
  const currentThemes = new Set();
  
  // Сбор всех сущностей и тем текущего хода
  Object.values(currentTurn.indexes.entities).forEach(entities => {
    entities.forEach(entity => currentEntities.add(entity.toLowerCase()));
  });
  
  currentTurn.indexes.themes.forEach(theme => {
    currentThemes.add(theme.theme);
  });
  
  // Поиск связанных ходов
  allTurns.forEach((turn, index) => {
    if (index === currentIndex) return;
    
    let relevanceScore = 0;
    
    // Проверка совпадения сущностей
    Object.values(turn.indexes.entities).forEach(entities => {
      entities.forEach(entity => {
        if (currentEntities.has(entity.toLowerCase())) {
          relevanceScore += 2;
        }
      });
    });
    
    // Проверка совпадения тем
    turn.indexes.themes.forEach(theme => {
      if (currentThemes.has(theme.theme)) {
        relevanceScore += 1;
      }
    });
    
    // Проверка временной близости
    const timeDistance = Math.abs(currentIndex - index);
    if (timeDistance <= 2) {
      relevanceScore += 1;
    }
    
    if (relevanceScore >= 3) {
      related.push({
        turn_id: turn.id,
        relevance_score: relevanceScore,
        connection_type: determineConnectionType(currentTurn, turn)
      });
    }
  });
  
  return related
    .sort((a, b) => b.relevance_score - a.relevance_score)
    .slice(0, 5)
    .map(r => r.turn_id);
}

// Функция для определения типа связи
function determineConnectionType(turn1, turn2) {
  const commonEntities = [];
  const commonThemes = [];
  
  // Поиск общих сущностей
  Object.keys(turn1.indexes.entities).forEach(entityType => {
    turn1.indexes.entities[entityType].forEach(entity => {
      if (turn2.indexes.entities[entityType]?.includes(entity)) {
        commonEntities.push(entity);
      }
    });
  });
  
  // Поиск общих тем
  turn1.indexes.themes.forEach(theme1 => {
    turn2.indexes.themes.forEach(theme2 => {
      if (theme1.theme === theme2.theme) {
        commonThemes.push(theme1.theme);
      }
    });
  });
  
  if (commonEntities.length > 2) return 'entity_heavy';
  if (commonThemes.length > 1) return 'theme_heavy';
  return 'general';
}

// Функция для анализа непрерывности событий
function analyzeContinuity(previousTurn, currentTurn) {
  const continuity = {
    ongoing_crisis: [],
    new_developments: [],
    resolved_issues: []
  };
  
  // Анализ кризисов
  const crisisKeywords = ['кризис', 'конфликт', 'напряженность', 'проблема', 'угроза'];
  const previousCrises = findKeywordsInTurn(previousTurn, crisisKeywords);
  const currentCrises = findKeywordsInTurn(currentTurn, crisisKeywords);
  
  // Продолжающиеся кризисы
  previousCrises.forEach(crisis => {
    if (currentCrises.includes(crisis)) {
      continuity.ongoing_crisis.push(crisis);
    }
  });
  
  // Новые кризисы
  currentCrises.forEach(crisis => {
    if (!previousCrises.includes(crisis)) {
      continuity.new_developments.push(crisis);
    }
  });
  
  // Разрешенные кризисы
  previousCrises.forEach(crisis => {
    if (!currentCrises.includes(crisis)) {
      continuity.resolved_issues.push(crisis);
    }
  });
  
  return continuity;
}

// Функция для поиска ключевых слов в ходе
function findKeywordsInTurn(turn, keywords) {
  const found = [];
  const content = JSON.stringify(turn).toLowerCase();
  
  keywords.forEach(keyword => {
    if (content.includes(keyword)) {
      found.push(keyword);
    }
  });
  
  return found;
}

// Функция для создания временных линий
function createTimeline(turns) {
  console.log('Создание временных линий...');
  
  const timeline = {
    events: [],
    characters: {},
    locations: {},
    themes: {}
  };
  
  turns.forEach(turn => {
    const turnDate = new Date(turn.metadata.date);
    
    // Добавление событий
    turn.content.key_events?.forEach(event => {
      timeline.events.push({
        date: turn.metadata.date,
        turn_id: turn.id,
        event: event,
        themes: turn.analysis.key_themes
      });
    });
    
    // Отслеживание персонажей
    turn.indexes.entities.people?.forEach(person => {
      if (!timeline.characters[person]) {
        timeline.characters[person] = [];
      }
      timeline.characters[person].push({
        date: turn.metadata.date,
        turn_id: turn.id,
        context: extractPersonContext(turn, person)
      });
    });
    
    // Отслеживание локаций
    turn.indexes.entities.locations?.forEach(location => {
      if (!timeline.locations[location]) {
        timeline.locations[location] = [];
      }
      timeline.locations[location].push({
        date: turn.metadata.date,
        turn_id: turn.id,
        context: extractLocationContext(turn, location)
      });
    });
  });
  
  return timeline;
}

// Функция для извлечения контекста персонажа
function extractPersonContext(turn, person) {
  const context = [];
  
  Object.values(turn.content.sections).forEach(section => {
    if (section.content.toLowerCase().includes(person.toLowerCase())) {
      const sentences = section.content.split(/[.!?]+/);
      sentences.forEach(sentence => {
        if (sentence.toLowerCase().includes(person.toLowerCase())) {
          context.push(sentence.trim());
        }
      });
    }
  });
  
  return context.slice(0, 3); // Возвращаем первые 3 упоминания
}

// Функция для извлечения контекста локации
function extractLocationContext(turn, location) {
  const context = [];
  
  Object.values(turn.content.sections).forEach(section => {
    if (section.content.toLowerCase().includes(location.toLowerCase())) {
      const sentences = section.content.split(/[.!?]+/);
      sentences.forEach(sentence => {
        if (sentence.toLowerCase().includes(location.toLowerCase())) {
          context.push(sentence.trim());
        }
      });
    }
  });
  
  return context.slice(0, 3);
}

// Функция для создания индекса для быстрого поиска
function createSearchIndex(turns) {
  console.log('Создание поискового индекса...');
  
  const searchIndex = {
    by_entity: {},
    by_theme: {},
    by_date: {},
    by_sentiment: {},
    by_complexity: {}
  };
  
  turns.forEach(turn => {
    // Индекс по сущностям
    Object.keys(turn.indexes.entities).forEach(entityType => {
      turn.indexes.entities[entityType].forEach(entity => {
        if (!searchIndex.by_entity[entity]) {
          searchIndex.by_entity[entity] = [];
        }
        searchIndex.by_entity[entity].push({
          turn_id: turn.id,
          date: turn.metadata.date,
          relevance: calculateEntityRelevance(turn, entity)
        });
      });
    });
    
    // Индекс по темам
    turn.indexes.themes.forEach(theme => {
      if (!searchIndex.by_theme[theme.theme]) {
        searchIndex.by_theme[theme.theme] = [];
      }
      searchIndex.by_theme[theme.theme].push({
        turn_id: turn.id,
        date: turn.metadata.date,
        relevance: theme.relevance
      });
    });
    
    // Индекс по датам
    const year = turn.metadata.date.split('-')[0];
    if (!searchIndex.by_date[year]) {
      searchIndex.by_date[year] = [];
    }
    searchIndex.by_date[year].push({
      turn_id: turn.id,
      date: turn.metadata.date,
      title: turn.metadata.title
    });
    
    // Индекс по настроению
    if (!searchIndex.by_sentiment[turn.analysis.sentiment]) {
      searchIndex.by_sentiment[turn.analysis.sentiment] = [];
    }
    searchIndex.by_sentiment[turn.analysis.sentiment].push({
      turn_id: turn.id,
      date: turn.metadata.date
    });
  });
  
  return searchIndex;
}

// Функция для расчета релевантности сущности
function calculateEntityRelevance(turn, entity) {
  let mentions = 0;
  const totalWords = turn.metadata.word_count;
  
  Object.values(turn.content.sections).forEach(section => {
    const entityMatches = (section.content.match(new RegExp(entity, 'gi')) || []).length;
    mentions += entityMatches;
  });
  
  return mentions / totalWords;
}

// Основная функция обработки
function processTurnsWithConnections(inputPath, outputPath) {
  console.log('Загрузка оптимизированных ходов...');
  
  const inputContent = fs.readFileSync(inputPath, 'utf8');
  const lines = inputContent.split('\n').filter(line => line.trim());
  const turns = lines.map(line => JSON.parse(line));
  
  console.log(`Загружено ходов: ${turns.length}`);
  
  // Создание связей
  const connectedTurns = createTurnConnections(turns);
  
  // Создание временных линий
  const timeline = createTimeline(connectedTurns);
  
  // Создание поискового индекса
  const searchIndex = createSearchIndex(connectedTurns);
  
  // Создание финальной структуры
  const finalStructure = {
    metadata: {
      total_turns: connectedTurns.length,
      processing_date: new Date().toISOString(),
      structure_version: '2.0',
      features: [
        'entity_extraction',
        'sentiment_analysis',
        'chunking',
        'theme_extraction',
        'turn_connections',
        'timeline',
        'search_index'
      ]
    },
    turns: connectedTurns,
    timeline: timeline,
    search_index: searchIndex
  };
  
  // Сохранение результата
  fs.writeFileSync(outputPath, JSON.stringify(finalStructure, null, 2), 'utf8');
  
  console.log(`Обработка завершена! Результат сохранен в: ${outputPath}`);
  
  // Создание дополнительных файлов
  const timelinePath = outputPath.replace('.json', '_timeline.json');
  fs.writeFileSync(timelinePath, JSON.stringify(timeline, null, 2), 'utf8');
  
  const searchIndexPath = outputPath.replace('.json', '_search_index.json');
  fs.writeFileSync(searchIndexPath, JSON.stringify(searchIndex, null, 2), 'utf8');
  
  return {
    turnsCount: connectedTurns.length,
    outputPath,
    timelinePath,
    searchIndexPath
  };
}

// Экспорт функций
module.exports = {
  createTurnConnections,
  createTimeline,
  createSearchIndex,
  processTurnsWithConnections
};

// Если скрипт запущен напрямую
if (require.main === module) {
  const inputPath = process.argv[2] || 'turns_optimized.jsonl';
  const outputPath = process.argv[3] || 'turns_final_structure.json';
  
  if (!fs.existsSync(inputPath)) {
    console.error(`Файл не найден: ${inputPath}`);
    process.exit(1);
  }
  
  processTurnsWithConnections(inputPath, outputPath);
} 