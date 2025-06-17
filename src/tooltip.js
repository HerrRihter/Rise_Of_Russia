// src/tooltip.js

let tooltipElement = null; // Единственный экземпляр тултипа на всю страницу

// Функция для позиционирования тултипа рядом с курсором
function positionTooltip(event) {
    if (!tooltipElement || tooltipElement.style.display === 'none') return;

    let x = event.clientX + 15;
    let y = event.clientY + 15;
    const screenPadding = 10;

    if (x + tooltipElement.offsetWidth + screenPadding > window.innerWidth) {
        x = event.clientX - tooltipElement.offsetWidth - 15;
    }
    if (x < screenPadding) x = screenPadding;

    if (y + tooltipElement.offsetHeight + screenPadding > window.innerHeight) {
        y = event.clientY - tooltipElement.offsetHeight - 15;
    }
    if (y < screenPadding) y = screenPadding;

    tooltipElement.style.left = `${x}px`;
    tooltipElement.style.top = `${y}px`;
}

/**
 * Главная экспортируемая функция. Добавляет обработчики событий к элементу.
 * @param {HTMLElement} element - DOM-элемент, к которому привязываем подсказку.
 * @param {string} title - Заголовок подсказки.
 * @param {string} effects - Текст с эффектами (модификаторами).
 * @param {string} description - Длинное описание.
 */
export function addTooltipEvents(element, title, effects, description) {
    if (!tooltipElement || !element) return;

    element.addEventListener('mouseenter', (event) => {
        let content = '';
        if (title) content += `<strong>${title}</strong>`;
        if (effects) {
            if (content) content += '<hr>';
            content += effects.replace(/\n/g, '<br>');
        }
        if (description) {
            if (content) content += '<hr>';
            content += `<small>${description.replace(/\n/g, '<br>')}</small>`;
        }

        if (content) {
            tooltipElement.innerHTML = content;
            tooltipElement.style.display = 'block';
            positionTooltip(event);
        }
    });

    element.addEventListener('mousemove', positionTooltip);
    element.addEventListener('mouseleave', () => {
        tooltipElement.style.display = 'none';
    });
}

/**
 * Инициализирует систему тултипов, создавая DOM-элемент.
 * Вызывается один раз при старте приложения.
 */
export function initTooltip() {
    if (document.querySelector('.tooltip')) return; // Создаем только один раз

    tooltipElement = document.createElement('div');
    tooltipElement.className = 'tooltip';
    tooltipElement.style.display = 'none';
    document.body.appendChild(tooltipElement);
}