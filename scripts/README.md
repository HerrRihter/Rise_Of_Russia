# Оптимизация структуры ходов для нейросети

Этот набор скриптов предназначен для преобразования файла `turns_hierarchical.jsonl` в оптимальную структуру для эффективного чтения нейросетью.

## 📁 Структура файлов

```
scripts/
├── optimize-turns-structure.cjs      # Базовая оптимизация структуры
├── create-turn-connections.cjs       # Создание связей между ходами
├── process-turns-pipeline.cjs        # Полный пайплайн обработки
├── test-single-turn.cjs              # Тестирование на одном ходе
└── README.md                         # Этот файл
```

## 🚀 Быстрый старт

### 1. Тестирование на одном ходе

```bash
node test-single-turn.cjs d:/Downloads/turns_hierarchical.jsonl 0
```

Это создаст файл `test_turn_0_optimized.json` с оптимизированной структурой первого хода.

### 2. Полная обработка файла

```bash
node process-turns-pipeline.cjs d:/Downloads/turns_hierarchical.jsonl ./processed
```

Это создаст полную оптимизированную структуру со всеми связями и индексами.

## 📋 Описание скриптов

### `optimize-turns-structure.cjs`

**Назначение**: Базовая оптимизация структуры отдельных ходов

**Функции**:
- Извлечение сущностей (люди, организации, локации)
- Анализ настроения
- Разбиение на чанки
- Извлечение тем
- Создание индексов

**Использование**:
```bash
node optimize-turns-structure.cjs input.jsonl output.jsonl
```

### `create-turn-connections.cjs`

**Назначение**: Создание связей между ходами и дополнительная оптимизация

**Функции**:
- Создание связей между ходами
- Анализ непрерывности событий
- Создание временных линий
- Построение поискового индекса

**Использование**:
```bash
node create-turn-connections.cjs input.jsonl output.json
```

### `process-turns-pipeline.cjs`

**Назначение**: Полный пайплайн обработки

**Этапы**:
1. Базовая оптимизация структуры
2. Создание связей между ходами
3. Создание отчета о качестве
4. Генерация документации

**Использование**:
```bash
node process-turns-pipeline.cjs input.jsonl output_directory
```

### `test-single-turn.cjs`

**Назначение**: Тестирование оптимизации на одном ходе

**Функции**:
- Обработка одного хода
- Вывод статистики
- Сравнение структур
- Демонстрация возможностей

**Использование**:
```bash
node test-single-turn.cjs input.jsonl turn_index
```

## 📊 Оптимизированная структура

### Основные улучшения

1. **Структурированные метаданные**
   ```json
   {
     "metadata": {
       "title": "Заголовок",
       "date": "2000-11-01",
       "word_count": 15000,
       "complexity_score": 0.8,
       "sentiment_overall": "neutral"
     }
   }
   ```

2. **Разбиение на чанки**
   ```json
   {
     "content": {
       "chunks": [
         {
           "chunk_id": "turn_14_intro_1",
           "content": "Текст чанка",
           "tokens_estimate": 500,
           "sentiment": "neutral"
         }
       ]
     }
   }
   ```

3. **Извлеченные сущности**
   ```json
   {
     "indexes": {
       "entities": {
         "people": ["Путин", "Долгов"],
         "organizations": ["Кремль", "ФСБ"],
         "locations": ["Москва", "Петербург"]
       }
     }
   }
   ```

4. **Тематический анализ**
   ```json
   {
     "indexes": {
       "themes": [
         {"theme": "politics", "relevance": 0.9},
         {"theme": "economy", "relevance": 0.7}
       ]
     }
   }
   ```

5. **Связи между ходами**
   ```json
   {
     "connections": {
       "previous_turn": "turn_13",
       "next_turn": "turn_15",
       "related_turns": ["turn_12", "turn_16"]
     }
   }
   ```

## 🎯 Преимущества для нейросети

### 1. Эффективное использование контекстного окна
- Чанки размером 1000-2000 токенов
- Перекрытие между чанками
- Приоритизация по важности

### 2. Быстрый поиск информации
- Индексы по сущностям
- Индексы по темам
- Временные линии
- Поисковый индекс

### 3. Семантические связи
- Причинно-следственные связи
- Тематические группировки
- Непрерывность событий

### 4. Аналитические возможности
- Анализ настроения
- Оценка сложности
- Ключевые моменты
- Факторы риска и возможности

## 📈 Примеры использования

### Поиск по персонажу
```javascript
const putinTurns = searchIndex.by_entity['Путин'];
console.log(`Путин упоминается в ${putinTurns.length} ходах`);
```

### Анализ темы
```javascript
const politicsTurns = searchIndex.by_theme['politics'];
console.log(`Политические темы в ${politicsTurns.length} ходах`);
```

### Временная линия
```javascript
const putinTimeline = timeline.characters['Путин'];
putinTimeline.forEach(event => {
  console.log(`${event.date}: ${event.context[0]}`);
});
```

### Работа с чанками
```javascript
turn.content.chunks.forEach(chunk => {
  if (chunk.tokens_estimate <= 1000) {
    // Подходит для контекстного окна
    processChunk(chunk);
  }
});
```

## 🔧 Настройка

### Параметры чанкинга
В `optimize-turns-structure.cjs`:
```javascript
function splitIntoChunks(text, maxTokens = 1000) {
  // Измените maxTokens для другого размера чанков
}
```

### Словари для анализа
В `optimize-turns-structure.cjs`:
```javascript
const positiveWords = ['рост', 'успех', 'развитие'];
const negativeWords = ['кризис', 'проблема', 'конфликт'];
// Добавьте свои слова
```

### Темы для извлечения
В `optimize-turns-structure.cjs`:
```javascript
const themes = {
  politics: ['власть', 'кремль', 'президент'],
  economy: ['экономика', 'бизнес', 'инвестиции'],
  // Добавьте свои темы
};
```

## 📝 Выходные файлы

После полной обработки создаются:

1. **`turns_processed_*_final.json`** - Полная оптимизированная структура
2. **`turns_processed_*_optimized.jsonl`** - Базовые оптимизированные ходы
3. **`turns_processed_*_timeline.json`** - Временные линии событий
4. **`turns_processed_*_search_index.json`** - Поисковый индекс
5. **`turns_processed_*_quality_report.json`** - Отчет о качестве
6. **`turns_processed_*_example.json`** - Пример структуры
7. **`turns_processed_*_README.md`** - Документация

## 🐛 Устранение неполадок

### Ошибка "Файл не найден"
```bash
# Убедитесь, что путь к файлу правильный
ls d:/Downloads/turns_hierarchical.jsonl
```

### Ошибка "Модуль не найден"
```bash
# Убедитесь, что все скрипты в одной папке
ls scripts/*.cjs
```

### Ошибка парсинга JSON
```bash
# Проверьте формат файла
head -1 d:/Downloads/turns_hierarchical.jsonl | jq .
```

## 📞 Поддержка

При возникновении проблем:

1. Проверьте формат входного файла
2. Убедитесь, что все зависимости установлены
3. Проверьте права доступа к файлам
4. Запустите тест на одном ходе для диагностики

## 🔄 Версии

- **v1.0**: Базовая оптимизация с извлечением сущностей
- **v2.0**: Добавлены связи между ходами и временные линии
- **v2.1**: Улучшенный поисковый индекс и анализ качества 