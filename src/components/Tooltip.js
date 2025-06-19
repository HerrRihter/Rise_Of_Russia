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
  let x = e.clientX + 15;
  let y = e.clientY + 15;
  if (x + tooltip.offsetWidth + 10 > window.innerWidth) x = e.clientX - tooltip.offsetWidth - 15;
  if (y + tooltip.offsetHeight + 10 > window.innerHeight) y = e.clientY - tooltip.offsetHeight - 15;
  tooltip.style.left = `${x}px`;
  tooltip.style.top = `${y}px`;
} 