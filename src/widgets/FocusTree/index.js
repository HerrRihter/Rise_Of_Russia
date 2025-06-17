import './style.css';
import { openModal } from '../../modal.js';

// Размеры для расчетов
const NODE_WIDTH = 80;
const NODE_HEIGHT = 80;
const GRID_GAP_X = 120; // Расстояние между колонками (центр-центр)
const GRID_GAP_Y = 120; // Расстояние между строками (центр-центр)
const PADDING = 20;    // Отступ от края контейнера

export default function FocusTreeWidget(props) {
  const { focus_tree, completed_focuses } = props;

  const container = document.createElement('div');
  container.className = 'focus-tree-container';

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.classList.add('focus-tree-svg');

  // Карта для хранения координат центров всех узлов
  const nodeCenters = {};

  // --- 1. Создаем и позиционируем все узлы (иконки) ---
  for (const focusId in focus_tree) {
    const focusData = focus_tree[focusId];

    // Рассчитываем позицию левого верхнего угла узла
    const left = focusData.x * GRID_GAP_X + PADDING;
    const top = focusData.y * GRID_GAP_Y + PADDING;

    // Сохраняем координаты ЦЕНТРА узла для отрисовки линий
    nodeCenters[focusId] = {
      x: left + NODE_WIDTH / 2,
      y: top + NODE_HEIGHT / 2,
    };

    const node = document.createElement('div');
    node.className = 'focus-node';
    node.style.left = `${left}px`;
    node.style.top = `${top}px`;

    if (completed_focuses.includes(focusId)) {
      node.classList.add('completed');
    }

    node.innerHTML = `<img src="${focusData.icon_path}" alt="${focusData.title}">`;

    node.addEventListener('click', () => {
      const content = `<p>Длительность: ${focusData.duration} дней</p><hr><p>${focusData.description}</p>`;
      openModal(focusData.title, content);
    });

    container.appendChild(node);
  }

  // --- 2. Рисуем линии между узлами (ИСПРАВЛЕННАЯ ЛОГИКА) ---
  for (const focusId in focus_tree) {
    const focusData = focus_tree[focusId];
    // Если у фокуса нет зависимостей, пропускаем его
    if (!focusData.prerequisites || focusData.prerequisites.length === 0) continue;

    const childCenter = nodeCenters[focusId]; // Координаты центра дочернего узла

    focusData.prerequisites.forEach(prereqId => {
      const parentCenter = nodeCenters[prereqId]; // Координаты центра родительского узла

      // Рисуем линию, только если оба узла существуют
      if (childCenter && parentCenter) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');

        // Устанавливаем атрибуты, используя наши сохраненные координаты центров
        line.setAttribute('x1', parentCenter.x);
        line.setAttribute('y1', parentCenter.y);
        line.setAttribute('x2', childCenter.x);
        line.setAttribute('y2', childCenter.y);

        // Если оба фокуса выполнены, делаем линию "завершенной"
        if (completed_focuses.includes(focusId) && completed_focuses.includes(prereqId)) {
          line.classList.add('completed');
        }

        svg.appendChild(line);
      }
    });
  }

  // Вставляем SVG-контейнер с линиями под иконками
  container.insertBefore(svg, container.firstChild);

  return container;
}