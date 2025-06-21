const fs = require('fs');
const path = require('path');

// Пути к файлам
const outputPath = path.join(__dirname, 'presidential_focus_tree.json');
const reportPath = path.join(__dirname, 'presidential_focus_tree_report.md');

// Новый стартовый фокус
const startFocus = {
  id: "president_reflects",
  turn_id: 12,
  period: "Стартовый период",
  title: "Президент размышляет",
  duration: 30,
  description: "Президент анализирует ситуацию в стране и готовится к принятию ключевых решений.",
  effects: { no_effect: true },
  x: -5,
  y: 0,
  prerequisites: []
};

// Обновленные президентские фокусы с новыми названиями
const presidentialDecisions = [
  {
    id: "personal_control",
    turn_id: 13,
    period: "Самый ранний из упомянутых",
    title: "Президент сам разберется",
    duration: 90,
    description: "Президент берет на себя прямое оперативное управление ключевыми процессами, проводит выездные совещания, дает прямые установки региональным лидерам и полпредам, инициирует кадровые перестановки для усиления лояльности.",
    effects: { no_effect: true },
    x: -4,
    y: 0,
    prerequisites: ["president_reflects"]
  },
  {
    id: "balance_conservation",
    turn_id: 14,
    period: "Период ранней консолидации",
    title: "Сохранение баланса",
    duration: 90,
    description: "Текущая модель управления фиксируется как оптимальная. Новые элементы не вводятся, процессы идут по инерции. Кураторам и полпредствам дается указание 'не углублять' вмешательство, поддерживая сложившееся равновесие.",
    effects: { no_effect: true },
    x: -3,
    y: 0,
    prerequisites: ["personal_control"]
  },
  {
    id: "inertia_maintenance",
    turn_id: 15,
    period: "Период до Хода 17",
    title: "Поддержание инерции",
    duration: 90,
    description: "Сохраняется ранее установленный порядок работы государственных структур. Решения принимаются преимущественно на ведомственном уровне, Администрация Президента отслеживает лишь избыточные риски, не меняя общей архитектуры управления.",
    effects: { no_effect: true },
    x: -2,
    y: 0,
    prerequisites: ["balance_conservation"]
  },
  {
    id: "waiting_mode",
    turn_id: 16,
    period: "Период до Хода 17",
    title: "Режим ожидания",
    duration: 90,
    description: "Новые масштабные инициативы и реформы откладываются. Государственным органам поручен мониторинг исполнения текущих решений, без активного вмешательства, если не происходит явных провалов. Период снижения аппаратной напряженности и замедления темпов преобразований.",
    effects: { no_effect: true },
    x: -1,
    y: 0,
    prerequisites: ["inertia_maintenance"]
  },
  {
    id: "external_perimeter",
    turn_id: 17,
    period: "Ранний лунарный или нейтральный период",
    title: "Антитеррор",
    duration: 90,
    description: "Интенсивность внутреннего давления на аппарат снижается. Основное внимание и дипломатические ресурсы переключаются на укрепление позиций России в СНГ и на Ближнем Востоке, используя 'охлаждение' в отношениях с Западом для поиска новых альянсов и рынков.",
    effects: { strengthened: ["Активная Политика в Ближнем Зарубежье"], weakened: ["Государство-Крепость"] },
    x: 0,
    y: 0,
    prerequisites: ["waiting_mode"]
  },
  {
    id: "total_mobilization",
    turn_id: 18,
    period: "Ранний период",
    title: "Тотальная мобилизация",
    duration: 90,
    description: "Борьба с внутренними и внешними угрозами (терроризм) объявлена абсолютным приоритетом. Инициирована реформа силовых структур, приняты законы, расширяющие полномочия спецслужб и ужесточающие контроль. Основной посыл – сплочение нации.",
    effects: { strengthened: ["Государство-Крепость"], weakened: ["Расколотое Общество", "Мягкая Сила"] },
    x: 1,
    y: 0,
    prerequisites: ["external_perimeter"]
  },
  {
    id: "national_projects",
    turn_id: 19,
    period: "Период еще ранее",
    title: "Курс на развитие",
    duration: 90,
    description: "Упор на реализацию крупных госпроектов в инфраструктуре и ОПК для модернизации и консолидации элит. Сохранен жесткий контроль в сфере безопасности, но ресурсы направлены на экономическое развитие под госпатронажем. Риторика 'мобилизации' несколько смягчилась.",
    effects: { strengthened: ["Национальные Проекты: Инфраструктурный Импульс", "Реиндустриализация ОПК и Тех. Суверенитет"], maintained: ["Государство-Крепость"] },
    x: 2,
    y: 0,
    prerequisites: ["total_mobilization"]
  },
  {
    id: "sovereign_democracy",
    turn_id: 20,
    period: "Период перед Весной 2003",
    title: "Суверенная демократия",
    duration: 90,
    description: "Акцент сделан на законодательном закреплении практик управления: усиление федерального центра, ограничение иностранного влияния, укрепление контроля над инфополем. Продолжалось давление на остающиеся очаги независимости в экономике и политике через юридические механизмы.",
    effects: { strengthened: ["Государство-Крепость", "Суверенная Экономика"], weakened: ["Расколотое Общество"] },
    x: 3,
    y: 0,
    prerequisites: ["national_projects"]
  },
  {
    id: "mobilization_course",
    turn_id: 21,
    period: "Весна 2003",
    title: "Мобилизационный курс",
    duration: 90,
    description: "Весной 2003 года был взят решительный курс на дальнейшее усиление государственной мощи и мобилизацию ресурсов. Приоритет отдавался укреплению силовых структур, контролю над инфопространством и границами. Экономика ориентировалась на нужды безопасности и 'суверенного развития' с усилением идеологического контроля.",
    effects: { strengthened: ["Государство-Крепость"], weakened: ["Расколотое Общество", "Мягкая Сила"] },
    x: 4,
    y: 0,
    prerequisites: ["sovereign_democracy"]
  },
  {
    id: "national_building",
    turn_id: 22,
    period: "Лето 2003",
    title: "Национальное строительство",
    duration: 90,
    description: "Государственная политика летом 2003 года была сфокусирована на реализации масштабных инфраструктурных и оборонных проектов, рассматриваемых как главный инструмент модернизации страны и способ консолидации элит. Финансовые ресурсы активно направлялись в ОПК и инфраструктуру под жестким центральным контролем. Поддерживалось формирование лояльных технократических политических сил.",
    effects: { strengthened: ["Национальные Проекты: Инфраструктурный Импульс", "Реиндустриализация ОПК и Тех. Суверенитет", "Суверенная Экономика"] },
    x: 5,
    y: 0,
    prerequisites: ["mobilization_course"]
  },
  {
    id: "presidential_control",
    turn_id: 23,
    period: "Осень 2003",
    title: "Управляемые выборы и госконтроль",
    duration: 90,
    description: "В преддверии декабрьских выборов в Государственную Думу, ключевые усилия государства были направлены на обеспечение полного контроля над избирательным процессом. Параллельно был дан старт активной фазе давления на крупные независимые бизнес-структуры (арест главы ЮКОСа), что обозначило курс на усиление государственного капитализма. Эта политика проводилась на фоне адаптации к меняющейся международной обстановке.",
    effects: { strengthened: ["Государство-Крепость", "Суверенная Экономика"], weakened: ["Расколотое Общество", "Мягкая Сила"] },
    x: 6,
    y: 0,
    prerequisites: ["national_building"]
  }
];

// Функция для создания иконок фокусов
function generateFocusIcons() {
  const icons = {
    "president_reflects": "history/focus_icons/president_reflects.png",
    "personal_control": "history/focus_icons/presidential_control.png",
    "balance_conservation": "history/focus_icons/balance.png",
    "inertia_maintenance": "history/focus_icons/stability.png",
    "waiting_mode": "history/focus_icons/monitoring.png",
    "external_perimeter": "history/focus_icons/foreign_policy.png",
    "total_mobilization": "history/focus_icons/security.png",
    "national_projects": "history/focus_icons/infrastructure.png",
    "sovereign_democracy": "history/focus_icons/sovereign_democracy.png",
    "mobilization_course": "history/focus_icons/mobilization.png",
    "national_building": "history/focus_icons/national_projects.png",
    "presidential_control": "history/focus_icons/election_control.png"
  };
  return icons;
}

// Функция для создания фокус-дерева
function createFocusTree() {
  const icons = generateFocusIcons();
  const focusTree = {
    focus_tree_nodes: [
      {
        id: startFocus.id,
        created_at: new Date().toISOString(),
        title: startFocus.title,
        icon_path: icons[startFocus.id] || "history/focus_icons/default.png",
        duration: startFocus.duration,
        description: startFocus.description,
        x: startFocus.x,
        y: startFocus.y,
        prerequisites: startFocus.prerequisites,
        metadata: {
          turn_id: startFocus.turn_id,
          period: startFocus.period,
          effects: startFocus.effects
        }
      },
      ...presidentialDecisions.map(decision => ({
        id: decision.id,
        created_at: new Date().toISOString(),
        title: decision.title,
        icon_path: icons[decision.id] || "history/focus_icons/default.png",
        duration: decision.duration,
        description: decision.description,
        x: decision.x,
        y: decision.y,
        prerequisites: decision.prerequisites,
        metadata: {
          turn_id: decision.turn_id,
          period: decision.period,
          effects: decision.effects
        }
      }))
    ]
  };
  
  return focusTree;
}

// Функция для создания отчета
function createReport(focusTree) {
  let report = `# Древо Национальных Фокусов: Решения Президента\n\n## Общая информация\n\n- **Всего фокусов**: ${focusTree.focus_tree_nodes.length}\n- **Период**: ${focusTree.focus_tree_nodes[0].metadata.period} - ${focusTree.focus_tree_nodes[focusTree.focus_tree_nodes.length - 1].metadata.period}\n- **Общая длительность**: ${focusTree.focus_tree_nodes.reduce((sum, focus) => sum + focus.duration, 0)} дней\n\n## Структура древа фокусов\n\n`;

  // Сортируем по turn_id для правильного порядка
  const sortedFocuses = focusTree.focus_tree_nodes.sort((a, b) => a.metadata.turn_id - b.metadata.turn_id);
  
  sortedFocuses.forEach(focus => {
    report += `### ${focus.metadata.period} (Ход ${focus.metadata.turn_id})\n\n**Фокус**: ${focus.title}\n**Длительность**: ${focus.duration} дней\n**Координаты**: (${focus.x}, ${focus.y})\n\n**Описание**: ${focus.description}\n\n**Влияние на Национальные Духи**:\n`;

    if (focus.metadata.effects.no_effect) {
      report += `- Не оказывалось значимого влияния\n`;
    } else {
      if (focus.metadata.effects.strengthened) {
        report += `- **Усилились**: ${focus.metadata.effects.strengthened.join(', ')}\n`;
      }
      if (focus.metadata.effects.weakened) {
        report += `- **Ослабли/Усугубились**: ${focus.metadata.effects.weakened.join(', ')}\n`;
      }
      if (focus.metadata.effects.maintained) {
        report += `- **Поддерживались**: ${focus.metadata.effects.maintained.join(', ')}\n`;
      }
    }
    
    report += `**Предварительные требования**: ${focus.prerequisites.length > 0 ? focus.prerequisites.join(', ') : 'Нет'}\n\n---\n`;
  });
  
  report += `\n## Анализ эволюции курса\n\n1. **Президент размышляет** — стартовый этап\n2. **Президент сам разберется** — прямое управление\n3. **Сохранение баланса** — фиксация достигнутого\n4. **Поддержание инерции** — инерционный период\n5. **Режим ожидания** — мониторинг\n6. **Антитеррор** — внешнеполитический и силовой акцент\n7. **Тотальная мобилизация** — мобилизационный рывок\n8. **Курс на развитие** — инвестиции и инфраструктура\n9. **Суверенная демократия** — законодательное оформление\n10. **Мобилизационный курс** — усиление контроля\n11. **Национальное строительство** — консолидация элит\n12. **Управляемые выборы и госконтроль** — финальный этап\n\n---\n*Древо фокусов сгенерировано на основе исторических решений президента*\n`;

  return report;
}

// Основная функция
function main() {
  console.log('🌳 Создание древа национальных фокусов...');
  
  const focusTree = createFocusTree();
  const report = createReport(focusTree);
  
  // Запись JSON файла
  fs.writeFileSync(outputPath, JSON.stringify(focusTree, null, 2), 'utf-8');
  
  // Запись отчета
  fs.writeFileSync(reportPath, report, 'utf-8');
  
  console.log(`✅ Создано фокусов: ${focusTree.focus_tree_nodes.length}`);
  console.log(`📁 JSON файл: ${outputPath}`);
  console.log(`📄 Отчет: ${reportPath}`);
}

// Запуск
main(); 