// src/sidePanel.js
import { addTooltipEvents } from './tooltip.js'; // <-- ИМПОРТИРУЕМ НАШ МОДУЛЬ ТУЛТИПОВ!

let panelEl, titleEl, contentEl, closeBtn;
let currentOnSelectCallback = null;

function closeSidePanel() {
  if (panelEl) panelEl.style.display = 'none';
  currentOnSelectCallback = null;
}

export function openSidePanel(title, options, onSelect, styleClass = 'icon-style') {
  if (!panelEl) return;

  panelEl.classList.remove('advisor-style', 'icon-style');
  panelEl.classList.add(styleClass);

  titleEl.textContent = title;
  contentEl.innerHTML = '';
  currentOnSelectCallback = onSelect;

  // --- Опция "Очистить слот" (без изменений) ---
  const emptyOption = document.createElement('div');
  emptyOption.className = 'side-panel-option';
  emptyOption.innerHTML = `<span class="side-panel-option-name" style="color: #ff8a8a;">-- Очистить слот --</span>`;
  emptyOption.addEventListener('click', () => {
    if (currentOnSelectCallback) currentOnSelectCallback(null);
    closeSidePanel();
  });
  contentEl.appendChild(emptyOption);

  // --- УЛУЧШЕННЫЙ ЦИКЛ СОЗДАНИЯ ОПЦИЙ ---
  options.forEach(option => {
    const optionEl = document.createElement('div');
    optionEl.className = 'side-panel-option';

    // Пытаемся найти иконку в portrait_path или icon_path
    const iconPath = option.portrait_path || option.icon_path || 'https://via.placeholder.com/50';
    // Пытаемся найти имя в name_display или name
    const displayName = option.name_display || option.name || 'Безымянная опция';

    optionEl.innerHTML = `
      <img src="${iconPath}" class="side-panel-option-icon">
      <span class="side-panel-option-name">${displayName}</span>
    `;

    // --- ДОБАВЛЯЕМ ТУЛТИП ДЛЯ КАЖДОЙ ОПЦИИ! ---
    // Используем те же данные, что и для основных слотов
    const tooltipSummary = option.effects_summary || option.tooltip_summary;
    addTooltipEvents(optionEl, displayName, tooltipSummary, option.description);
    // ---------------------------------------------

    optionEl.addEventListener('click', () => {
      if (currentOnSelectCallback) currentOnSelectCallback(option.id);
      closeSidePanel();
    });

    contentEl.appendChild(optionEl);
  });
  // --- КОНЕЦ УЛУЧШЕННОГО ЦИКЛА ---

  panelEl.style.display = 'flex';
}

export function initSidePanel() {
  panelEl = document.getElementById('selectionSidePanel');
  if (!panelEl) return;

  titleEl = document.getElementById('sidePanelTitle');
  contentEl = document.getElementById('sidePanelContent');
  closeBtn = document.getElementById('sidePanelCloseBtn');

  if (closeBtn) closeBtn.addEventListener('click', closeSidePanel);
}