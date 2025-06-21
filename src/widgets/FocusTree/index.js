import './style.css';
import { openModal } from '../../modal.js';

const NODE_WIDTH = 80;
const NODE_HEIGHT = 80;
const GRID_GAP_X = 120;
const GRID_GAP_Y = 120;
const PADDING = 20;

export default function FocusTreeWidget(props) {
  const { focus_tree, completed_focuses } = props;
  const container = document.createElement('div');
  container.className = 'focus-tree-container';
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.classList.add('focus-tree-svg');
  const nodeCenters = {};
  
  console.log('--- ПРОВЕРКА ДАННЫХ ВНУТРИ FOCUSTREE ---');
  console.log('Выполненные фокусы (массив):', completed_focuses);
  console.log('Всего фокусов в дереве:', Object.keys(focus_tree).length);

  // Вычисляем общую высоту дерева для правильного размера SVG
  let maxY = 0;
  for (const focusId in focus_tree) {
    const focusData = focus_tree[focusId];
    const nodeBottom = focusData.y * GRID_GAP_Y + PADDING + NODE_HEIGHT;
    if (nodeBottom > maxY) {
      maxY = nodeBottom;
    }
  }
  
  // Устанавливаем правильную высоту SVG для всех фокусов
  const svgHeight = Math.max(maxY + PADDING, 70 * window.innerHeight / 100); // минимум 70vh
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', `${svgHeight}px`);
  
  console.log(`📏 Высота SVG установлена: ${svgHeight}px (максимальная Y: ${maxY}px)`);

  // Создаем все узлы и вычисляем их центры
  for (const focusId in focus_tree) {
    const isCompleted = completed_focuses.includes(focusId);
    console.log(`Проверяем фокус: ID='${focusId}'. Найден в выполненных? ${isCompleted ? 'ДА' : 'НЕТ'}`);
    const focusData = focus_tree[focusId];
    const left = focusData.x * GRID_GAP_X + PADDING;
    const top = focusData.y * GRID_GAP_Y + PADDING;
    nodeCenters[focusId] = { x: left + NODE_WIDTH / 2, y: top + NODE_HEIGHT / 2 };
    
    console.log(`📍 Координаты фокуса "${focusData.title}": (${left}, ${top}) -> центр: (${nodeCenters[focusId].x}, ${nodeCenters[focusId].y})`);
    
    const node = document.createElement('div');
    node.className = 'focus-node';
    node.style.left = `${left}px`;
    node.style.top = `${top}px`;
    if (completed_focuses.includes(focusId)) {
      node.classList.add('completed');
    }
    node.innerHTML = `<img src="${focusData.icon_path}" alt="${focusData.title}">`;
    node.addEventListener('click', () => {
      const content = document.createElement('div');
      const backButton = document.createElement('button');
      backButton.textContent = '← Назад к дереву';
      backButton.style.marginBottom = '15px';
      backButton.onclick = () => { openModal('Дерево Национальных Фокусов', FocusTreeWidget(props)); };
      const descriptionDiv = document.createElement('div');
      descriptionDiv.innerHTML = `<p>Длительность: ${focusData.duration} дней</p><hr><p>${focusData.description}</p>`;
      content.appendChild(backButton);
      content.appendChild(descriptionDiv);
      openModal(focusData.title, content);
    });
    container.appendChild(node);
  }

  // Строим линии между всеми фокусами
  console.log('🔗 Строим соединительные линии...');
  let linesCreated = 0;
  
  for (const focusId in focus_tree) {
    const focusData = focus_tree[focusId];
    if (!focusData.prerequisites || focusData.prerequisites.length === 0) {
      console.log(`⚠️ Фокус "${focusData.title}" не имеет prerequisites`);
      continue;
    }
    
    const childCenter = nodeCenters[focusId];
    focusData.prerequisites.forEach(prereqId => {
      const parentCenter = nodeCenters[prereqId];
      if (childCenter && parentCenter) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', parentCenter.x);
        line.setAttribute('y1', parentCenter.y);
        line.setAttribute('x2', childCenter.x);
        line.setAttribute('y2', childCenter.y);
        if (completed_focuses.includes(focusId) && completed_focuses.includes(prereqId)) {
          line.classList.add('completed');
        }
        svg.appendChild(line);
        linesCreated++;
        console.log(`✅ Линия создана: "${focus_tree[prereqId]?.title}" -> "${focusData.title}"`);
      } else {
        console.error(`❌ Не удалось создать линию для "${focusData.title}":`, {
          childCenter: !!childCenter,
          parentCenter: !!parentCenter,
          prereqId
        });
      }
    });
  }
  
  console.log(`🎯 Всего создано линий: ${linesCreated}`);

  container.insertBefore(svg, container.firstChild);
  return container;
}