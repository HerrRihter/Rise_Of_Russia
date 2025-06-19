// Универсальный Tooltip-компонент и функция для навешивания тултипов

export function ensureTooltipExists() {
  let tooltip = document.querySelector('.tooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    document.body.appendChild(tooltip);
  }
  return tooltip;
}

export function addTooltipEvents(element, title, effects, description) {
  if (!element) return;
  element.addEventListener('mouseenter', showTooltip);
  element.addEventListener('mouseleave', hideTooltip);
  element.addEventListener('mousemove', moveTooltip);
  element._tooltipData = { title, effects, description };
}

function showTooltip(e) {
  let tooltip = ensureTooltipExists();
  const { title, effects, description } = this._tooltipData || {};
  tooltip.innerHTML = '';
  if (title) tooltip.innerHTML += `<strong>${title}</strong><br>`;
  if (effects) tooltip.innerHTML += `<span>${effects.replace(/\n/g, '<br>')}</span><br>`;
  if (description) tooltip.innerHTML += `<small>${description}</small>`;
  tooltip.style.display = 'block';
  moveTooltip.call(this, e);
}

function hideTooltip() {
  const tooltip = document.querySelector('.tooltip');
  if (tooltip) tooltip.style.display = 'none';
}

function moveTooltip(e) {
  const tooltip = document.querySelector('.tooltip');
  if (!tooltip) return;
  const padding = 12;
  let x = e.clientX + padding;
  let y = e.clientY - tooltip.offsetHeight - padding;

  // Если тултип уходит за верх — показываем снизу
  let showBelow = false;
  if (y < 0) {
    y = e.clientY + padding;
    showBelow = true;
  }
  // Если тултип уходит за правую границу — сдвигаем влево
  if (x + tooltip.offsetWidth > window.innerWidth) {
    x = window.innerWidth - tooltip.offsetWidth - padding;
  }
  // Если тултип уходит за левую границу — прижимаем к левому краю
  if (x < 0) x = padding;
  // Если тултип уходит за нижнюю границу — прижимаем к низу окна
  if (showBelow && y + tooltip.offsetHeight > window.innerHeight) {
    y = window.innerHeight - tooltip.offsetHeight - padding;
  }
  // Если даже сверху не помещается — прижимаем к низу
  if (!showBelow && y < 0) {
    y = window.innerHeight - tooltip.offsetHeight - padding;
  }

  tooltip.style.left = `${x}px`;
  tooltip.style.top = `${y}px`;
} 