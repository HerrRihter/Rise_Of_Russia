import { addTooltipEvents } from './Tooltip.js';

export function NationalSpirits({ active_national_spirit_ids, definitions }) {
  const spiritsContainer = document.createElement('div');
  spiritsContainer.className = 'national-spirits';
  if (active_national_spirit_ids.length > 0 && definitions.national_spirits) {
    const totalDevelopmentImpulses = { education: 0, healthcare: 0, welfare: 0, agriculture: 0, industry: 0, internal_security: 0, military_might: 0, social_development: 0, rozvidka: 0 };
    active_national_spirit_ids.forEach(spiritId => { const spiritData = definitions.national_spirits[spiritId]; if (spiritData && spiritData.development_impulses) { for (const areaKey in spiritData.development_impulses) { if (totalDevelopmentImpulses.hasOwnProperty(areaKey)) { totalDevelopmentImpulses[areaKey] += spiritData.development_impulses[areaKey]; } } } });
    active_national_spirit_ids.forEach(spiritId => {
      const spiritData = definitions.national_spirits[spiritId];
      if (spiritData) {
        const spiritIcon = document.createElement('div');
        spiritIcon.className = 'spirit-icon';
        spiritIcon.innerHTML = `<img src="${spiritData.icon_path || ''}" alt="${spiritData.name || ''}">`;
        let tooltipEffects = spiritData.effects_summary;
        if (spiritData.is_aggregator) { let dynamicSummary = "Суммарные импульсы к развитию:"; for (const areaKey in totalDevelopmentImpulses) { const areaDef = definitions.development_areas[areaKey]; const areaName = areaDef ? areaDef.name : areaKey; const impulseValue = totalDevelopmentImpulses[areaKey]; if (impulseValue !== 0) { dynamicSummary += `\n  ${areaName}: ${impulseValue > 0 ? '+' : ''}${impulseValue}`; } } tooltipEffects = dynamicSummary; }
        addTooltipEvents(spiritIcon, spiritData.name, tooltipEffects, spiritData.description);
        spiritsContainer.appendChild(spiritIcon);
      }
    });
  }
  return spiritsContainer;
} 