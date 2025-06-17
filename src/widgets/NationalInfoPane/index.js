import './style.css';
import { addTooltipEvents } from '../../tooltip.js';
import { openModal } from '../../modal.js';
import widgets from '../index.js';

// --- Вспомогательные функции (без изменений) ---
function handlePieChartMouseMove(event, canvas, sectors, tooltipEl) { if (!tooltipEl) return; const rect = canvas.getBoundingClientRect(); const mouseX = event.clientX - rect.left; const mouseY = event.clientY - rect.top; const centerX = canvas.width / 2; const centerY = canvas.height / 2; const dx = mouseX - centerX; const dy = mouseY - centerY; if (Math.sqrt(dx * dx + dy * dy) <= centerX) { let angle = Math.atan2(dy, dx); if (angle < -Math.PI / 2) angle += 2 * Math.PI; for (const sector of sectors) { if (angle >= sector.startAngle && angle < sector.endAngle) { tooltipEl.innerHTML = `<strong>${sector.partyName}</strong><hr>Популярность: ${sector.popularity}%`; tooltipEl.style.display = 'block'; let x = event.clientX + 15; let y = event.clientY + 15; if (x + tooltipEl.offsetWidth + 10 > window.innerWidth) x = event.clientX - tooltipEl.offsetWidth - 15; if (y + tooltipEl.offsetHeight + 10 > window.innerHeight) y = event.clientY - tooltipEl.offsetHeight - 15; tooltipEl.style.left = `${x}px`; tooltipEl.style.top = `${y}px`; return; } } } tooltipEl.style.display = 'none'; }
function handlePieChartMouseLeave(tooltipEl) { if (tooltipEl) tooltipEl.style.display = 'none'; }
function drawPoliticalPieChart(canvas, parties) { if (!canvas || !parties || parties.length === 0) return; const ctx = canvas.getContext('2d'); const centerX = canvas.width / 2; const centerY = canvas.height / 2; const radius = Math.min(centerX, centerY) - 1; const filteredParties = parties.filter(p => p.popularity > 0); const totalPopularity = filteredParties.reduce((sum, party) => sum + party.popularity, 0); if (totalPopularity === 0) return; let currentAngle = -0.5 * Math.PI; ctx.clearRect(0, 0, canvas.width, canvas.height); const sectors = []; filteredParties.forEach(party => { const sliceAngle = (party.popularity / totalPopularity) * 2 * Math.PI; const endAngle = currentAngle + sliceAngle; ctx.beginPath(); ctx.moveTo(centerX, centerY); ctx.arc(centerX, centerY, radius, currentAngle, endAngle); ctx.closePath(); ctx.fillStyle = party.color || '#cccccc'; ctx.fill(); ctx.strokeStyle = '#3c3c3c'; ctx.lineWidth = 1; ctx.stroke(); sectors.push({ partyName: party.name, popularity: party.popularity, startAngle: currentAngle, endAngle }); currentAngle = endAngle; }); const tooltipEl = document.querySelector('.tooltip'); if(canvas._handleMouseMove) canvas.removeEventListener('mousemove', canvas._handleMouseMove); if(canvas._handleMouseLeave) canvas.removeEventListener('mouseleave', canvas._handleMouseLeave); canvas._handleMouseMove = (event) => handlePieChartMouseMove(event, canvas, sectors, tooltipEl); canvas._handleMouseLeave = () => handlePieChartMouseLeave(tooltipEl); canvas.addEventListener('mousemove', canvas._handleMouseMove); canvas.addEventListener('mouseleave', canvas._handleMouseLeave); }
function updatePartyList(listContainer, parties, rulingPartyId) { if (!listContainer || !parties || parties.length === 0) return; const sortedParties = [...parties].filter(p => p.popularity > 0 || p.id === rulingPartyId).sort((a, b) => b.popularity - a.popularity); listContainer.innerHTML = ''; sortedParties.forEach(party => { const listItem = document.createElement('li'); if (party.id === rulingPartyId) listItem.classList.add('highlighted'); const colorBox = document.createElement('div'); colorBox.className = 'party-color-box'; colorBox.style.backgroundColor = party.color || '#cccccc'; const partyNameSpan = document.createElement('span'); partyNameSpan.textContent = ` ${party.name} (${party.popularity}%)`; listItem.appendChild(colorBox); listItem.appendChild(partyNameSpan); let effects = `Популярность: ${party.popularity}%`; if (party.ideology_tags_rus && party.ideology_tags_rus.length > 0) { effects += `\nИдеологии: ${party.ideology_tags_rus.join(', ')}`; } addTooltipEvents(listItem, party.name, effects, party.short_description); listContainer.appendChild(listItem); }); }

// --- ГЛАВНАЯ ФУНКЦИЯ ВИДЖЕТА (ИСПРАВЛЕННАЯ) ---
export default function NationalInfoPaneWidget(props) {
  const { state, definitions } = props;

  // --- ИСПРАВЛЕНИЕ: Правильно извлекаем все необходимые данные из state ---
  const ruling_party_id = state.game_variables?.ruling_party_id?.value;
  const paneState = state.national_info_state;
  const completed_focuses = paneState?.completed_focuses || [];
  const active_national_spirit_ids = state.national_info_state?.active_national_spirit_ids || [];

  const mainPane = document.createElement('div');
  mainPane.className = 'national-info-pane';

  // 1. Баннер Фокусов
  const focusBanner = document.createElement('div');
  focusBanner.className = 'national-focus-banner';
  focusBanner.innerHTML = `<img src="history/turn_images/Autumn2003.png" alt="Дерево фокусов" class="focus-bg"><div class="focus-title-bar">Национальные Фокусы</div>`;
  addTooltipEvents(focusBanner, 'Дерево Национальных Фокусов', 'Нажмите, чтобы открыть дерево фокусов...', null);
  focusBanner.addEventListener('click', () => {
    const FocusTreeWidget = widgets['focus-tree'];
    if (FocusTreeWidget) {
      const focusTreeEl = FocusTreeWidget({
        focus_tree: definitions.national_focus_tree,
        completed_focuses: completed_focuses
      });
      openModal('Дерево Национальных Фокусов', focusTreeEl);
    } else {
      openModal('Ошибка', 'Виджет "Дерево фокусов" не найден в реестре.');
    }
  });

  // 2. Национальные Духи
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

  // 3. Политические Детали
  const detailsContainer = document.createElement('div');
  detailsContainer.className = 'political-details';
  const rulingParty = definitions.parties[ruling_party_id];
  detailsContainer.innerHTML = `<div class="ruling-party-info"><strong>${rulingParty ? rulingParty.name : '...'}</strong><br><small>Следующие выборы: скоро</small></div><div class="political-system-info-container"><div class="pol-sys-upper"><div class="pol-sys-icon-wrapper"><img src="history/parties_emblems/democracy.png" alt="Полит. Система" class="flag"></div><div class="pol-sys-text-wrapper">Российск.<br>Политическая<br>Система</div></div><button class="balance-btn">Баланс</button></div><div class="party-popularity"><div class="pie-chart"><canvas id="partyPieChartCanvas" width="110" height="110"></canvas></div><ul class="party-list" id="partyListContainer"></ul></div>`;

  // --- ИСПРАВЛЕНИЕ: Собираем виджет в правильном порядке и только один раз ---
  mainPane.appendChild(focusBanner);
  mainPane.appendChild(spiritsContainer);
  mainPane.appendChild(detailsContainer);

  // --- Запускаем интерактивные функции ---
  const canvas = mainPane.querySelector('#partyPieChartCanvas');
  const partyListUl = mainPane.querySelector('#partyListContainer');
  drawPoliticalPieChart(canvas, definitions.parties_array);
  updatePartyList(partyListUl, definitions.parties_array, ruling_party_id);
  const balanceButton = mainPane.querySelector('.balance-btn');
  if (balanceButton) { balanceButton.addEventListener('click', () => { openModal('Баланс Сил', 'Здесь будет содержимое окна баланса...'); }); }

  return mainPane;
}