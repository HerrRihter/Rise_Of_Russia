const fs = require('fs');
const path = require('path');

// Функция для создания связей между действиями
function createActionConnections(actions) {
  const connections = {};
  
  // Группируем действия по персонажам
  const actionsByCharacter = {};
  actions.forEach(action => {
    if (!actionsByCharacter[action.character]) {
      actionsByCharacter[action.character] = [];
    }
    actionsByCharacter[action.character].push(action);
  });

  // Создаем связи для каждого персонажа
  Object.keys(actionsByCharacter).forEach(character => {
    const characterActions = actionsByCharacter[character].sort((a, b) => {
      // Сортируем по номеру хода
      const turnA = parseInt(a.turn_id.replace('turn_', ''));
      const turnB = parseInt(b.turn_id.replace('turn_', ''));
      return turnA - turnB;
    });

    characterActions.forEach((action, index) => {
      const actionId = action.action_id;
      connections[actionId] = {
        character: character,
        turn_id: action.turn_id,
        previous_action: index > 0 ? characterActions[index - 1].action_id : null,
        next_action: index < characterActions.length - 1 ? characterActions[index + 1].action_id : null,
        related_actions: [],
        character_arc: {
          total_actions: characterActions.length,
          action_number: index + 1,
          success_rate: characterActions.filter(a => a.indexes.success_level === 'high').length / characterActions.length
        }
      };

      // Находим связанные действия по темам и сущностям
      const relatedActions = findRelatedActions(action, actions);
      connections[actionId].related_actions = relatedActions;
    });
  });

  return connections;
}

// Функция для поиска связанных действий
function findRelatedActions(action, allActions) {
  const related = [];
  const actionThemes = action.indexes.themes.map(t => t.theme);
  const actionEntities = Object.values(action.indexes.entities).flat();

  allActions.forEach(otherAction => {
    if (otherAction.action_id === action.action_id) return;

    let relevance = 0;

    // Проверяем совпадение тем
    const otherThemes = otherAction.indexes.themes.map(t => t.theme);
    const themeOverlap = actionThemes.filter(theme => otherThemes.includes(theme));
    relevance += themeOverlap.length * 0.3;

    // Проверяем совпадение сущностей
    const otherEntities = Object.values(otherAction.indexes.entities).flat();
    const entityOverlap = actionEntities.filter(entity => otherEntities.includes(entity));
    relevance += entityOverlap.length * 0.2;

    // Проверяем совпадение тегов
    const tagOverlap = action.content.tags.filter(tag => otherAction.content.tags.includes(tag));
    relevance += tagOverlap.length * 0.4;

    // Проверяем временную близость
    const turnA = parseInt(action.turn_id.replace('turn_', ''));
    const turnB = parseInt(otherAction.turn_id.replace('turn_', ''));
    const turnDistance = Math.abs(turnA - turnB);
    if (turnDistance <= 2) {
      relevance += (3 - turnDistance) * 0.1;
    }

    if (relevance >= 0.3) {
      related.push({
        action_id: otherAction.action_id,
        character: otherAction.character,
        relevance: Math.min(relevance, 1.0),
        connection_type: determineConnectionType(action, otherAction, relevance)
      });
    }
  });

  return related.sort((a, b) => b.relevance - a.relevance).slice(0, 5);
}

// Функция для определения типа связи
function determineConnectionType(action1, action2, relevance) {
  if (action1.character === action2.character) {
    return 'character_sequence';
  }
  
  const themeOverlap = action1.indexes.themes.some(t1 => 
    action2.indexes.themes.some(t2 => t2.theme === t1.theme)
  );
  
  if (themeOverlap) {
    return 'thematic';
  }
  
  const entityOverlap = Object.values(action1.indexes.entities).flat().some(entity =>
    Object.values(action2.indexes.entities).flat().includes(entity)
  );
  
  if (entityOverlap) {
    return 'entity_based';
  }
  
  return 'temporal';
}

// Функция для создания временных линий
function createActionTimelines(actions) {
  const timelines = {
    by_character: {},
    by_turn: {},
    by_theme: {},
    by_entity: {}
  };

  // Временная линия по персонажам
  actions.forEach(action => {
    if (!timelines.by_character[action.character]) {
      timelines.by_character[action.character] = [];
    }
    timelines.by_character[action.character].push({
      action_id: action.action_id,
      turn_id: action.turn_id,
      title: action.metadata.title,
      success_score: action.metadata.success_score,
      success_level: action.indexes.success_level,
      themes: action.indexes.themes.map(t => t.theme)
    });
  });

  // Сортируем по ходам
  Object.keys(timelines.by_character).forEach(character => {
    timelines.by_character[character].sort((a, b) => {
      const turnA = parseInt(a.turn_id.replace('turn_', ''));
      const turnB = parseInt(b.turn_id.replace('turn_', ''));
      return turnA - turnB;
    });
  });

  // Временная линия по ходам
  actions.forEach(action => {
    if (!timelines.by_turn[action.turn_id]) {
      timelines.by_turn[action.turn_id] = [];
    }
    timelines.by_turn[action.turn_id].push({
      action_id: action.action_id,
      character: action.character,
      title: action.metadata.title,
      success_score: action.metadata.success_score,
      success_level: action.indexes.success_level
    });
  });

  // Временная линия по темам
  actions.forEach(action => {
    action.indexes.themes.forEach(theme => {
      if (!timelines.by_theme[theme.theme]) {
        timelines.by_theme[theme.theme] = [];
      }
      timelines.by_theme[theme.theme].push({
        action_id: action.action_id,
        character: action.character,
        turn_id: action.turn_id,
        title: action.metadata.title,
        success_score: action.metadata.success_score,
        relevance: theme.relevance
      });
    });
  });

  // Временная линия по сущностям
  actions.forEach(action => {
    Object.entries(action.indexes.entities).forEach(([entityType, entities]) => {
      entities.forEach(entity => {
        if (!timelines.by_entity[entity]) {
          timelines.by_entity[entity] = [];
        }
        timelines.by_entity[entity].push({
          action_id: action.action_id,
          character: action.character,
          turn_id: action.turn_id,
          title: action.metadata.title,
          entity_type: entityType,
          success_score: action.metadata.success_score
        });
      });
    });
  });

  return timelines;
}

// Функция для создания поискового индекса
function createSearchIndex(actions) {
  const searchIndex = {
    by_character: {},
    by_turn: {},
    by_theme: {},
    by_entity: {},
    by_success_level: { high: [], medium: [], low: [] },
    by_sentiment: { positive: [], neutral: [], negative: [] },
    by_tag: {},
    by_date_range: {}
  };

  actions.forEach(action => {
    // Индекс по персонажам
    if (!searchIndex.by_character[action.character]) {
      searchIndex.by_character[action.character] = [];
    }
    searchIndex.by_character[action.character].push(action.action_id);

    // Индекс по ходам
    if (!searchIndex.by_turn[action.turn_id]) {
      searchIndex.by_turn[action.turn_id] = [];
    }
    searchIndex.by_turn[action.turn_id].push(action.action_id);

    // Индекс по темам
    action.indexes.themes.forEach(theme => {
      if (!searchIndex.by_theme[theme.theme]) {
        searchIndex.by_theme[theme.theme] = [];
      }
      searchIndex.by_theme[theme.theme].push(action.action_id);
    });

    // Индекс по сущностям
    Object.entries(action.indexes.entities).forEach(([entityType, entities]) => {
      entities.forEach(entity => {
        if (!searchIndex.by_entity[entity]) {
          searchIndex.by_entity[entity] = [];
        }
        searchIndex.by_entity[entity].push(action.action_id);
      });
    });

    // Индекс по уровню успешности
    searchIndex.by_success_level[action.indexes.success_level].push(action.action_id);

    // Индекс по настроению
    searchIndex.by_sentiment[action.metadata.sentiment_overall].push(action.action_id);

    // Индекс по тегам
    action.content.tags.forEach(tag => {
      if (!searchIndex.by_tag[tag]) {
        searchIndex.by_tag[tag] = [];
      }
      searchIndex.by_tag[tag].push(action.action_id);
    });
  });

  return searchIndex;
}

// Функция для анализа паттернов действий
function analyzeActionPatterns(actions) {
  const patterns = {
    character_patterns: {},
    thematic_patterns: {},
    success_patterns: {},
    temporal_patterns: {}
  };

  // Анализ паттернов персонажей
  const actionsByCharacter = {};
  actions.forEach(action => {
    if (!actionsByCharacter[action.character]) {
      actionsByCharacter[action.character] = [];
    }
    actionsByCharacter[action.character].push(action);
  });

  Object.entries(actionsByCharacter).forEach(([character, characterActions]) => {
    const successRate = characterActions.filter(a => a.indexes.success_level === 'high').length / characterActions.length;
    const avgSuccessScore = characterActions.reduce((sum, a) => sum + a.metadata.success_score, 0) / characterActions.length;
    const preferredThemes = getPreferredThemes(characterActions);
    const preferredEntities = getPreferredEntities(characterActions);

    patterns.character_patterns[character] = {
      total_actions: characterActions.length,
      success_rate: successRate,
      average_success_score: avgSuccessScore,
      preferred_themes: preferredThemes,
      preferred_entities: preferredEntities,
      action_frequency: characterActions.length / 10 // предполагаем 10 ходов
    };
  });

  // Анализ тематических паттернов
  const themeStats = {};
  actions.forEach(action => {
    action.indexes.themes.forEach(theme => {
      if (!themeStats[theme.theme]) {
        themeStats[theme.theme] = { count: 0, total_relevance: 0, success_scores: [] };
      }
      themeStats[theme.theme].count++;
      themeStats[theme.theme].total_relevance += theme.relevance;
      themeStats[theme.theme].success_scores.push(action.metadata.success_score);
    });
  });

  Object.entries(themeStats).forEach(([theme, stats]) => {
    patterns.thematic_patterns[theme] = {
      frequency: stats.count,
      average_relevance: stats.total_relevance / stats.count,
      average_success_score: stats.success_scores.reduce((sum, score) => sum + score, 0) / stats.success_scores.length,
      success_distribution: {
        high: stats.success_scores.filter(score => score >= 15).length,
        medium: stats.success_scores.filter(score => score >= 10 && score < 15).length,
        low: stats.success_scores.filter(score => score < 10).length
      }
    };
  });

  return patterns;
}

// Вспомогательная функция для получения предпочитаемых тем
function getPreferredThemes(actions) {
  const themeCounts = {};
  actions.forEach(action => {
    action.indexes.themes.forEach(theme => {
      themeCounts[theme.theme] = (themeCounts[theme.theme] || 0) + 1;
    });
  });

  return Object.entries(themeCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([theme, count]) => ({ theme, count }));
}

// Вспомогательная функция для получения предпочитаемых сущностей
function getPreferredEntities(actions) {
  const entityCounts = {};
  actions.forEach(action => {
    Object.values(action.indexes.entities).flat().forEach(entity => {
      entityCounts[entity] = (entityCounts[entity] || 0) + 1;
    });
  });

  return Object.entries(entityCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([entity, count]) => ({ entity, count }));
}

// Основная функция обработки
function processActionsWithConnections(inputPath, outputPath) {
  console.log('🔗 Создание связей между действиями...');

  // Читаем оптимизированные действия
  const inputData = fs.readFileSync(inputPath, 'utf8');
  const actions = inputData.trim().split('\n').map(line => JSON.parse(line));

  console.log(`📊 Обработка ${actions.length} действий`);

  // Создаем связи
  const connections = createActionConnections(actions);
  console.log(`🔗 Создано ${Object.keys(connections).length} связей`);

  // Создаем временные линии
  const timelines = createActionTimelines(actions);
  console.log(`📅 Созданы временные линии для ${Object.keys(timelines.by_character).length} персонажей`);

  // Создаем поисковый индекс
  const searchIndex = createSearchIndex(actions);
  console.log(`🔍 Создан поисковый индекс`);

  // Анализируем паттерны
  const patterns = analyzeActionPatterns(actions);
  console.log(`📊 Проанализированы паттерны действий`);

  // Создаем финальную структуру
  const finalStructure = {
    metadata: {
      total_actions: actions.length,
      total_characters: Object.keys(timelines.by_character).length,
      total_turns: Object.keys(timelines.by_turn).length,
      processing_date: new Date().toISOString()
    },
    actions: actions,
    connections: connections,
    timelines: timelines,
    search_index: searchIndex,
    patterns: patterns
  };

  // Сохраняем результат
  fs.writeFileSync(outputPath, JSON.stringify(finalStructure, null, 2));
  console.log(`✅ Финальная структура сохранена в ${outputPath}`);

  return {
    total_actions: actions.length,
    total_connections: Object.keys(connections).length,
    characters: Object.keys(timelines.by_character).length,
    output_path: outputPath
  };
}

// Экспорт функций
module.exports = {
  processActionsWithConnections,
  createActionConnections,
  createActionTimelines,
  createSearchIndex,
  analyzeActionPatterns
};

// Если скрипт запущен напрямую
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Использование: node create-action-connections.cjs <input_file> <output_file>');
    process.exit(1);
  }

  const [inputPath, outputPath] = args;
  
  try {
    const result = processActionsWithConnections(inputPath, outputPath);
    console.log('📈 Результаты обработки:', result);
  } catch (error) {
    console.error('❌ Ошибка обработки:', error.message);
    process.exit(1);
  }
} 