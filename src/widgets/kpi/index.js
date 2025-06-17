// src/widgets/Kpi/index.js
import './style.css'; // Каждый виджет импортирует свои собственные стили

/**
 * Фабричная функция для создания виджета KPI.
 * @param {object} props - Свойства, пришедшие из data.yml (label, value).
 * @returns {HTMLElement} Готовый DOM-элемент виджета.
 */
export default function KpiWidget(props) {
  const el = document.createElement('div');
  el.className = 'widget kpi-widget'; // Даем классы для стилизации

  const label = document.createElement('div');
  label.className = 'kpi-label';
  label.textContent = props.label;

  const value = document.createElement('div');
  value.className = 'kpi-value';
  value.textContent = props.value.toLocaleString('ru-RU');

  el.appendChild(label);
  el.appendChild(value);

  return el;
}