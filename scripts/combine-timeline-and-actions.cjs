const fs = require('fs');
const path = require('path');

// Пути к файлам
const timelinePath = path.join(__dirname, 'full_processed', 'turns_processed_2025-06-20T05-35-54-269Z_final_timeline.json');
const actionsPath = path.join(__dirname, 'actions_optimized.jsonl');
const outputPath = path.join(__dirname, 'combined_timeline.json');

// Чтение таймлайна ходов
const timeline = JSON.parse(fs.readFileSync(timelinePath, 'utf-8'));

// Чтение действий
const actions = fs.readFileSync(actionsPath, 'utf-8')
  .split('\n')
  .filter(Boolean)
  .map(line => JSON.parse(line));

// Индексируем действия по turn_id
const actionsByTurn = {};
actions.forEach(action => {
  if (!actionsByTurn[action.turn_id]) actionsByTurn[action.turn_id] = [];
  actionsByTurn[action.turn_id].push(action);
});

// Собираем итоговую хронологию
const result = [];
const allTurns = new Set();
// Сначала из таймлайна
Object.values(timeline.characters).forEach(eventsArr => {
  eventsArr.forEach(event => {
    allTurns.add(event.turn_id);
  });
});
// Затем из действий (на случай, если есть уникальные turn_id)
actions.forEach(action => allTurns.add(action.turn_id));

// Преобразуем в массив и сортируем по номеру хода
const sortedTurns = Array.from(allTurns).sort((a, b) => {
  const nA = parseInt(a.replace(/\D/g, ''));
  const nB = parseInt(b.replace(/\D/g, ''));
  return nA - nB;
});

for (const turn_id of sortedTurns) {
  // События из таймлайна
  const timelineEvents = [];
  Object.entries(timeline.characters).forEach(([char, eventsArr]) => {
    eventsArr.forEach(event => {
      if (event.turn_id === turn_id) {
        timelineEvents.push({ character: char, ...event });
      }
    });
  });
  // Действия
  const turnActions = actionsByTurn[turn_id] || [];
  result.push({
    turn_id,
    date: timelineEvents[0]?.date || null,
    timeline_context: timelineEvents.map(e => ({ character: e.character, context: e.context })),
    actions: turnActions.map(a => ({
      character: a.character,
      title: a.metadata.title,
      description: a.content.description,
      result: a.content.result,
      key_points: a.content.key_points
    }))
  });
}

fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');
console.log('✅ Итоговая хронология сохранена в', outputPath); 