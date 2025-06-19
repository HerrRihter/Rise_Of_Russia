import './style.css';
import { addTooltipEvents } from '../../components/Tooltip.js';

export default function PoliticalActionsWidget(props) {
  const { state, definitions, anchorElement } = props;
  // anchorElement — DOM-элемент блока партий, к которому "пристыковывается" панель

  // Кнопка для открытия панели
  const actionButton = document.createElement('button');
  actionButton.className = 'open-actions-button';
  actionButton.textContent = 'Политические действия';
  actionButton.style.position = 'absolute';
  actionButton.style.top = '10px';
  actionButton.style.right = '10px';
  actionButton.style.zIndex = '20';

  // Панель политических действий
  const panel = document.createElement('div');
  panel.className = 'political-actions-panel';
  panel.style.display = 'none';

  // Кнопка закрытия панели
  const closeBtn = document.createElement('span');
  closeBtn.textContent = '×';
  closeBtn.className = 'close-panel-btn';
  closeBtn.onclick = () => { panel.style.display = 'none'; };
  panel.appendChild(closeBtn);

  // Заголовок панели
  const header = document.createElement('div');
  header.className = 'panel-header';
  header.textContent = 'Влияние на партии';
  panel.appendChild(header);

  // Список партий
  const partiesList = document.createElement('div');
  partiesList.className = 'parties-list';
  (definitions.parties_array || []).forEach(party => {
    const partyRow = document.createElement('div');
    partyRow.className = 'party-row';
    partyRow.innerHTML = `
      <span class="party-color-box" style="background-color: ${party.color || '#ccc'}"></span>
      <span class="party-name">${party.name}</span>
      <span class="party-popularity">${state.parties_popularity?.[party.id] ?? 0}%</span>
    `;
    // Кнопка ↑
    const upBtn = document.createElement('button');
    upBtn.className = 'party-action-btn up';
    upBtn.textContent = '↑';
    addTooltipEvents(upBtn, 'Продвигать партию', 'Увеличить популярность на 1% (−25 очков)', null);
    // Кнопка ↓
    const downBtn = document.createElement('button');
    downBtn.className = 'party-action-btn down';
    downBtn.textContent = '↓';
    addTooltipEvents(downBtn, 'Подавлять партию', 'Уменьшить популярность на 1% (−25 очков)', null);
    partyRow.appendChild(upBtn);
    partyRow.appendChild(downBtn);
    partiesList.appendChild(partyRow);
  });
  panel.appendChild(partiesList);

  // Открытие/закрытие панели
  actionButton.onclick = () => {
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    // Позиционируем панель справа от anchorElement, если он есть
    if (anchorElement) {
      const rect = anchorElement.getBoundingClientRect();
      panel.style.position = 'absolute';
      panel.style.top = `${rect.top + window.scrollY}px`;
      panel.style.left = `${rect.right + 20 + window.scrollX}px`;
      panel.style.zIndex = '100';
    }
  };

  // Возвращаем контейнер с кнопкой и панелью
  const container = document.createElement('div');
  container.style.position = 'relative';
  container.appendChild(actionButton);
  container.appendChild(panel);
  return container;
} 