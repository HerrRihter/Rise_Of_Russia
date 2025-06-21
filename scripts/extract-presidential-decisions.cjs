const fs = require('fs');
const path = require('path');

// Пути к файлам
const timelinePath = path.join(__dirname, 'full_processed', 'turns_processed_2025-06-20T05-35-54-269Z_final.json');
const outputPath = path.join(__dirname, 'presidential_decisions.json');

// Чтение файла с ходами
const timelineData = JSON.parse(fs.readFileSync(timelinePath, 'utf-8'));
const timeline = timelineData.turns; // Правильная структура

// Функция для извлечения решений президента
function extractPresidentialDecisions() {
  const decisions = [];
  
  timeline.forEach(turn => {
    const turnId = turn.turn_id;
    const date = turn.metadata ? turn.metadata.date : null;
    
    // Ищем presidential_options в секциях
    if (turn.content && turn.content.sections) {
      Object.values(turn.content.sections).forEach(section => {
        if (section.chunks) {
          section.chunks.forEach(chunk => {
            if (chunk.presidential_options && chunk.presidential_options.content) {
              const content = chunk.presidential_options.content;
              
              // Извлекаем баланс шкалы
              const balanceMatch = content.match(/Баланс[:\s]*([+-]?\d+)/);
              const balance = balanceMatch ? balanceMatch[1] : '0';
              
              // Извлекаем контекст
              const contextMatch = content.match(/\*\*Контекст:\*\*([^*]+)/);
              const context = contextMatch ? contextMatch[1].trim() : '';
              
              // Извлекаем варианты решений
              const options = [];
              const optionMatches = content.matchAll(/\*\*([^*]+)\*\*[^📌]*📌\*\* Итог:\*\*([^]*?)(?=\*\*[^*]+\*\*|$)/g);
              
              for (const match of optionMatches) {
                const optionTitle = match[1].trim();
                const optionContent = match[2].trim();
                
                // Извлекаем действия и итоги
                const actionsMatch = optionContent.match(/\*\*Действия:\*\*([^📌]*)/);
                const actions = actionsMatch ? actionsMatch[1].trim() : '';
                
                const resultMatch = optionContent.match(/\*\*📌 Итог:\*\*([^]*?)(?=\*\*[^*]+\*\*|$)/);
                const result = resultMatch ? resultMatch[1].trim() : '';
                
                options.push({
                  title: optionTitle,
                  actions: actions,
                  result: result
                });
              }
              
              decisions.push({
                turn_id: turnId,
                date: date,
                balance: balance,
                context: context,
                options: options,
                raw_content: content
              });
            }
          });
        }
      });
    }
    
    // Ищем упоминания решений президента в key_points
    if (turn.content && turn.content.sections) {
      Object.values(turn.content.sections).forEach(section => {
        if (section.key_points) {
          const presidentialMentions = section.key_points.filter(point => 
            point.toLowerCase().includes('президент') || 
            point.toLowerCase().includes('путин') ||
            point.toLowerCase().includes('кремль') ||
            point.toLowerCase().includes('администрация президента')
          );
          
          if (presidentialMentions.length > 0) {
            decisions.push({
              turn_id: turnId,
              date: date,
              type: 'mentions',
              mentions: presidentialMentions
            });
          }
        }
      });
    }
  });
  
  return decisions;
}

// Функция для анализа паттернов решений
function analyzeDecisionPatterns(decisions) {
  const analysis = {
    total_decisions: decisions.length,
    balance_distribution: {},
    common_themes: [],
    decision_evolution: []
  };
  
  // Анализ распределения баланса
  decisions.forEach(decision => {
    if (decision.balance) {
      const balance = decision.balance;
      analysis.balance_distribution[balance] = (analysis.balance_distribution[balance] || 0) + 1;
    }
  });
  
  // Анализ общих тем
  const themes = new Set();
  decisions.forEach(decision => {
    if (decision.context) {
      const contextLower = decision.context.toLowerCase();
      if (contextLower.includes('безопасность') || contextLower.includes('террор')) themes.add('Безопасность');
      if (contextLower.includes('экономик') || contextLower.includes('бизнес')) themes.add('Экономика');
      if (contextLower.includes('политик') || contextLower.includes('власть')) themes.add('Политика');
      if (contextLower.includes('международн') || contextLower.includes('внешн')) themes.add('Международные отношения');
      if (contextLower.includes('регион') || contextLower.includes('губернатор')) themes.add('Региональная политика');
    }
  });
  analysis.common_themes = Array.from(themes);
  
  // Эволюция решений по времени
  decisions.forEach(decision => {
    if (decision.date) {
      analysis.decision_evolution.push({
        date: decision.date,
        turn_id: decision.turn_id,
        balance: decision.balance,
        context_summary: decision.context ? decision.context.substring(0, 100) + '...' : ''
      });
    }
  });
  
  return analysis;
}

// Основная функция
function main() {
  console.log('🔍 Извлечение решений президента...');
  
  const decisions = extractPresidentialDecisions();
  const analysis = analyzeDecisionPatterns(decisions);
  
  const result = {
    metadata: {
      total_decisions: decisions.length,
      extraction_date: new Date().toISOString(),
      source_file: timelinePath
    },
    analysis: analysis,
    decisions: decisions
  };
  
  // Запись результата
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');
  
  console.log(`✅ Извлечено решений президента: ${decisions.length}`);
  console.log(`📊 Распределение баланса:`, analysis.balance_distribution);
  console.log(`🎯 Основные темы:`, analysis.common_themes.join(', '));
  console.log(`📁 Результат сохранен: ${outputPath}`);
  
  // Создание краткого отчета
  const reportPath = path.join(__dirname, 'presidential_decisions_report.md');
  let report = `# Отчет по решениям президента

## Общая статистика

- **Всего решений**: ${decisions.length}
- **Период**: ${decisions.length > 0 ? decisions[0].date : 'N/A'} - ${decisions.length > 0 ? decisions[decisions.length - 1].date : 'N/A'}

## Распределение по балансу шкалы

`;

  Object.entries(analysis.balance_distribution).forEach(([balance, count]) => {
    const label = balance > 0 ? 'Соларный' : balance < 0 ? 'Лунарный' : 'Нейтральный';
    report += `- **${balance}** (${label}): ${count} решений\n`;
  });
  
  report += `
## Основные темы решений

${analysis.common_themes.map(theme => `- ${theme}`).join('\n')}

## Эволюция решений

`;

  analysis.decision_evolution.forEach(evolution => {
    report += `### ${evolution.date} (${evolution.turn_id})
- **Баланс**: ${evolution.balance}
- **Контекст**: ${evolution.context_summary}

`;
  });
  
  report += `
## Детализация решений

`;

  decisions.forEach((decision, index) => {
    if (decision.options) {
      report += `### ${decision.turn_id} (${decision.date || 'N/A'})
**Баланс**: ${decision.balance}
**Контекст**: ${decision.context}

**Варианты решений:**
`;
      
      decision.options.forEach(option => {
        report += `#### ${option.title}
**Действия**: ${option.actions}
**Результат**: ${option.result}

`;
      });
    }
  });
  
  fs.writeFileSync(reportPath, report, 'utf-8');
  console.log(`📄 Отчет создан: ${reportPath}`);
}

// Запуск
main(); 