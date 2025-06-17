import './style.css';
import YAML from 'yaml';
import { renderDashboard } from './renderer.js';
import { initTooltip } from './tooltip.js';
import { initModal } from './modal.js';
import { initSidePanel } from './sidePanel.js';
import yamlText from './data.yml?raw';

async function main() {
  // 1. Инициализируем все вспомогательные UI-системы
  initTooltip();
  initModal();
  initSidePanel();

  const appContainer = document.getElementById('app');
  if (!appContainer) {
    console.error('Ключевой элемент #app не найден в HTML!');
    return;
  }

  try {
    // 2. Парсим наш единый источник данных
    const data = YAML.parse(yamlText);

    // 3. Собираем объект со справочниками.
    // МЫ БОЛЬШЕ НЕ ПРЕОБРАЗОВЫВАЕМ ДАННЫЕ! Мы просто берем готовые объекты из YAML.
    const definitions = {
      leaders: data.definitions?.leaders || {},
      ideologies: data.definitions?.ideologies || {},
      parties: data.definitions?.parties || {},
      parties_array: Object.values(data.definitions?.parties || {}), // Массив нужен только для диаграммы
      national_focus_tree: data.definitions?.national_focus_tree || {},
      national_spirits: data.definitions?.national_spirits || {},
      constitutional_principles: data.definitions?.constitutional_principles || {},
      development_areas: data.definitions?.development_areas || {},
      corporations: data.definitions?.corporations || {},
      national_focus_tree: data.definitions?.national_focus_tree || {},
    };

    // 4. Передаем в отрисовщик корневой объект данных и собранные справочники
    renderDashboard(appContainer, data, definitions);

  } catch (error) {
    console.error('Ошибка при инициализации приложения:', error);
    appContainer.innerHTML = `<h1 style="color:red; text-align: center;">Ошибка в data.yml: ${error.message}</h1><p style="color:white; text-align:center;">Проверьте отступы и синтаксис в файле.</p>`;
  }
}

// Запускаем приложение
main();