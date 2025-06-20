# Оптимизированная структура ходов для нейросети

## Обзор

Этот документ описывает оптимизированную структуру данных для эффективного чтения нейросетью.

## Структура файлов

### 1. Основные файлы
- `turns_processed_*_final.json` - Полная оптимизированная структура
- `turns_processed_*_optimized.jsonl` - Базовые оптимизированные ходы
- `turns_processed_*_example.json` - Пример структуры одного хода

### 2. Дополнительные файлы
- `turns_processed_*_timeline.json` - Временные линии событий
- `turns_processed_*_search_index.json` - Поисковый индекс
- `turns_processed_*_quality_report.json` - Отчет о качестве обработки

## Структура хода

### Метаданные
```json
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
```

### Контент
```json
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
```

### Индексы
```json
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
```

### Связи
```json
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
```

### Анализ
```json
{
  "analysis": {
    "sentiment": "neutral",
    "complexity": "high",
    "key_themes": ["politics", "economy"],
    "risk_factors": [],
    "opportunities": []
  }
}
```

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
```javascript
const data = JSON.parse(fs.readFileSync('turns_final.json', 'utf8'));
const turns = data.turns;
const timeline = data.timeline;
const searchIndex = data.search_index;
```

### Поиск по сущностям
```javascript
const putinTurns = searchIndex.by_entity['Путин'];
```

### Поиск по темам
```javascript
const politicsTurns = searchIndex.by_theme['politics'];
```

### Временная линия
```javascript
const putinTimeline = timeline.characters['Путин'];
```

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
