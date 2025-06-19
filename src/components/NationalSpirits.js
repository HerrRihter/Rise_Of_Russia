import { addTooltipEvents } from './Tooltip.js';

const ROLL_MODIFIERS_LABELS = {
  education: "Действия, связанные с наукой и образованием",
  healthcare: "Медицинские реформы и здравоохранение",
  welfare: "Социальные программы и поддержка населения",
  agriculture: "Сельскохозяйственные инициативы",
  industry: "Промышленные проекты и модернизация",
  internal_security: "Внутренняя безопасность и спецслужбы",
  military_might: "Военные операции и оборона",
  social_development: "Общественные и культурные инициативы, политика и пропаганда",
  governance: "Государственное управление и честность",
  diplomacy: "Дипломатия и международные отношения"
};

function generateEffectsSummary(roll_modifiers) {
  if (!roll_modifiers) return '';
  return Object.entries(roll_modifiers)
    .filter(([_, value]) => value !== 0)
    .map(([key, value]) => `${ROLL_MODIFIERS_LABELS[key] || key}: ${value > 0 ? '+' : ''}${value}`)
    .join('\n');
}

export function NationalSpirits({ active_national_spirit_ids, definitions }) {
  const spiritsContainer = document.createElement('div');
  spiritsContainer.className = 'national-spirits';
  if (active_national_spirit_ids.length > 0 && definitions.national_spirits) {
    const totalDevelopmentImpulses = { education: 0, healthcare: 0, welfare: 0, agriculture: 0, industry: 0, internal_security: 0, military_might: 0, social_development: 0 };
    active_national_spirit_ids.forEach(spiritId => { const spiritData = definitions.national_spirits[spiritId]; if (spiritData && spiritData.development_impulses) { for (const areaKey in spiritData.development_impulses) { if (totalDevelopmentImpulses.hasOwnProperty(areaKey)) { totalDevelopmentImpulses[areaKey] += spiritData.development_impulses[areaKey]; } } } });
    active_national_spirit_ids.forEach(spiritId => {
      const spiritData = definitions.national_spirits[spiritId];
      if (spiritData) {
        const spiritIcon = document.createElement('div');
        spiritIcon.className = 'spirit-icon';
        spiritIcon.innerHTML = `<img src="${spiritData.icon_path || ''}" alt="${spiritData.name || ''}">`;
        let tooltipEffects = '';
        if (spiritData.roll_modifiers) {
          tooltipEffects = generateEffectsSummary(spiritData.roll_modifiers);
        } else if (spiritData.effects_summary) {
          tooltipEffects = spiritData.effects_summary;
        }
        if (spiritData.is_aggregator && spiritData.id !== 'spirit_roll_mods_aggregator') { let dynamicSummary = "Суммарные импульсы к развитию:"; for (const areaKey in totalDevelopmentImpulses) { const areaDef = definitions.development_areas[areaKey]; const areaName = areaDef ? areaDef.name : areaKey; const impulseValue = totalDevelopmentImpulses[areaKey]; if (impulseValue !== 0) { dynamicSummary += `\n  ${areaName}: ${impulseValue > 0 ? '+' : ''}${impulseValue}`; } } tooltipEffects = dynamicSummary; }
        addTooltipEvents(spiritIcon, spiritData.name, tooltipEffects, spiritData.description);
        spiritsContainer.appendChild(spiritIcon);
      }
    });

    // === Агрегатор модификаторов бросков ===
    const aggregator = Object.values(definitions.national_spirits).find(s => s.id === 'spirit_roll_mods_aggregator');
    if (aggregator) {
      // Собираем все возможные ключи roll_modifiers у активных духов
      const allKeys = new Set();
      active_national_spirit_ids.forEach(spiritId => {
        if (spiritId === aggregator.id) return;
        const spirit = definitions.national_spirits[spiritId];
        if (spirit && spirit.roll_modifiers) {
          Object.keys(spirit.roll_modifiers).forEach(key => allKeys.add(key));
        }
      });
      const totalRollMods = {};
      allKeys.forEach(key => { totalRollMods[key] = 0; });
      // Суммируем по всем ключам
      active_national_spirit_ids.forEach(spiritId => {
        if (spiritId === aggregator.id) return;
        const spirit = definitions.national_spirits[spiritId];
        if (spirit && spirit.roll_modifiers) {
          for (const key in spirit.roll_modifiers) {
            if (typeof totalRollMods[key] === 'number') {
              totalRollMods[key] += spirit.roll_modifiers[key];
            }
          }
        }
      });
      let rollModsSummary = '';
      for (const key in totalRollMods) {
        if (totalRollMods[key] !== 0) {
          rollModsSummary += `\n${ROLL_MODIFIERS_LABELS[key] || key}: ${totalRollMods[key] > 0 ? '+' : ''}${totalRollMods[key]}`;
        }
      }
      if (!rollModsSummary) rollModsSummary = 'Нет модификаторов бросков от активных духов.';
      const aggregatorIcon = document.createElement('div');
      aggregatorIcon.className = 'spirit-icon';
      aggregatorIcon.innerHTML = `<img src="${aggregator.icon_path}" alt="${aggregator.name}">`;
      addTooltipEvents(aggregatorIcon, aggregator.name, rollModsSummary, aggregator.description);
      spiritsContainer.appendChild(aggregatorIcon);
    }
  }
  return spiritsContainer;
} 