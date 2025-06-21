import './style.css';
import { openDetailsModal } from '../../modal.js';
import { addTooltipEvents } from '../../components/Tooltip.js';

const NODE_WIDTH = 180;
const NODE_HEIGHT = 180;
const GRID_GAP_X = 240;
const GRID_GAP_Y = 240;
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

  // Вычисляем общую высоту и ширину дерева для правильного размера SVG
  let maxX = 0;
  let maxY = 0;
  for (const focusId in focus_tree) {
    const focusData = focus_tree[focusId];
    const nodeRight = focusData.x * GRID_GAP_X + PADDING + NODE_WIDTH;
    const nodeBottom = focusData.y * GRID_GAP_Y + PADDING + NODE_HEIGHT;
    if (nodeRight > maxX) {
      maxX = nodeRight;
    }
    if (nodeBottom > maxY) {
      maxY = nodeBottom;
    }
  }
  
  // Устанавливаем правильные размеры SVG для всех фокусов
  const svgWidth = Math.max(maxX + PADDING, 100 * window.innerWidth / 100);
  const svgHeight = Math.max(maxY + PADDING, 70 * window.innerHeight / 100);
  svg.setAttribute('width', `${svgWidth}px`);
  svg.setAttribute('height', `${svgHeight}px`);
  
  console.log(`📏 Размеры SVG установлены: ${svgWidth}px (ширина) x ${svgHeight}px (высота)`);

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
    
    // 1. Убираем описание из тултипа, оставляем только название
    addTooltipEvents(node, focusData.title, null, null);

    node.addEventListener('click', () => {
      // 2. Вместо замены контента, открываем новое, малое модальное окно
      const content = document.createElement('div');
      content.className = 'focus-details-content';
      content.innerHTML = `
        <div class="focus-details-header">
          <img src="${focusData.icon_path}" alt="${focusData.title}">
          <h2>${focusData.title}</h2>
        </div>
        <p>Длительность: ${focusData.duration} дней</p>
        <hr>
        <p>${focusData.description}</p>
      `;
      
      openDetailsModal(focusData.title, content);
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
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const startX = parentCenter.x;
        const startY = parentCenter.y + NODE_HEIGHT / 2; // Низ родительского узла
        const endX = childCenter.x;
        const endY = childCenter.y - NODE_HEIGHT / 2; // Верх дочернего узла
        
        // Y-координата для горизонтального сегмента
        const midY = startY + (endY - startY) / 2;

        const d = `M ${startX} ${startY} V ${midY} H ${endX} V ${endY}`;
        
        path.setAttribute('d', d);

        if (completed_focuses.includes(focusId) && completed_focuses.includes(prereqId)) {
          path.classList.add('completed');
        }
        svg.appendChild(path);
        linesCreated++;
        console.log(`✅ Ортогональная линия создана: "${focus_tree[prereqId]?.title}" -> "${focusData.title}"`);
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

  // Финальная реализация перетаскивания, решающая проблему с закрытием
  let isMouseDown = false;
  let isDragging = false;
  let startX, startY, scrollLeft, scrollTop;

  const onMouseDown = (e) => {
    // Реагируем только на левую кнопку
    if (e.button !== 0) return;
    // Игнорируем клики на полосах прокрутки
    if (e.clientX >= container.clientWidth || e.clientY >= container.clientHeight) {
        return;
    }
    
    isMouseDown = true;
    isDragging = false; // Сбрасываем флаг в начале
    container.classList.add('grabbing');
    
    startX = e.pageX - container.offsetLeft;
    startY = e.pageY - container.offsetTop;
    scrollLeft = container.scrollLeft;
    scrollTop = container.scrollTop;
    
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const onMouseMove = (e) => {
    if (!isMouseDown) return;
    e.preventDefault();
    isDragging = true; // Любое движение после нажатия считается перетаскиванием

    const x = e.pageX - container.offsetLeft;
    const y = e.pageY - container.offsetTop;
    const walkX = (x - startX) * 2;
    const walkY = (y - startY) * 2;
    container.scrollLeft = scrollLeft - walkX;
    container.scrollTop = scrollTop - walkY;
  };

  const onMouseUp = () => {
    isMouseDown = false;
    container.classList.remove('grabbing');

    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);

    // Если было перетаскивание, нужно "съесть" следующий клик
    if (isDragging) {
        const preventClick = (evt) => {
            evt.stopPropagation();
            window.removeEventListener('click', preventClick, true);
        };
        window.addEventListener('click', preventClick, true);
    }
  };

  container.addEventListener('mousedown', onMouseDown);

  container.insertBefore(svg, container.firstChild);
  return container;
}