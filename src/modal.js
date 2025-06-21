// src/modal.js

let modalElement = null;
let modalTitleEl = null;
let modalBodyEl = null;
let currentModalClass = ''; // Для отслеживания добавленного класса

/**
 * Открывает модальное окно и вставляет в него контент.
 * @param {string} title - Заголовок для окна.
 * @param {HTMLElement | string} content - HTML-элемент или строка с HTML для тела окна.
 * @param {string} [modalClass] - Опциональный CSS-класс для модального окна.
 */
export function openModal(title, content, modalClass = '') {
    if (!modalElement) return;

    // Сначала убираем старый кастомный класс, если он был
    if (currentModalClass) {
        modalElement.classList.remove(currentModalClass);
    }
    
    // Добавляем новый класс, если он предоставлен
    if (modalClass) {
        modalElement.classList.add(modalClass);
        currentModalClass = modalClass;
    } else {
        currentModalClass = '';
    }

    if (modalTitleEl) modalTitleEl.textContent = title;
    if (modalBodyEl) {
        modalBodyEl.innerHTML = ''; // Очищаем старое содержимое
        if (typeof content === 'string') {
            modalBodyEl.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            modalBodyEl.appendChild(content);
        }
    }
    modalElement.style.display = 'flex';
}

// Закрывает модальное окно
function closeModal() {
    if (modalElement) {
        modalElement.style.display = 'none';
        // Убираем кастомный класс при закрытии
        if (currentModalClass) {
            modalElement.classList.remove(currentModalClass);
            currentModalClass = '';
        }
    }
}

/**
 * Инициализирует систему модальных окон.
 * Находит элементы и вешает обработчики на кнопку закрытия и фон.
 */
export function initModal() {
    modalElement = document.getElementById('genericModal');
    if (!modalElement) return;

    modalTitleEl = modalElement.querySelector('.modal-title');
    modalBodyEl = modalElement.querySelector('.modal-body');
    const closeButton = modalElement.querySelector('.modal-close-button');

    if (closeButton) {
        closeButton.addEventListener('click', closeModal);
    }
    // Закрытие по клику на фон
    modalElement.addEventListener('click', (event) => {
        if (event.target === modalElement) {
            closeModal();
        }
    });
}

// --- Логика для второго, детального модального окна ---

let detailsModalElement = null;
let detailsModalTitleEl = null;
let detailsModalBodyEl = null;

export function openDetailsModal(title, content) {
    if (!detailsModalElement) return;

    if (detailsModalTitleEl) detailsModalTitleEl.textContent = title;
    if (detailsModalBodyEl) {
        detailsModalBodyEl.innerHTML = '';
        if (typeof content === 'string') {
            detailsModalBodyEl.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            detailsModalBodyEl.appendChild(content);
        }
    }
    detailsModalElement.style.display = 'flex';
}

function closeDetailsModal() {
    if (detailsModalElement) detailsModalElement.style.display = 'none';
}

export function initDetailsModal() {
    detailsModalElement = document.getElementById('detailsModal');
    if (!detailsModalElement) return;

    detailsModalTitleEl = detailsModalElement.querySelector('.modal-title');
    detailsModalBodyEl = detailsModalElement.querySelector('.modal-body');
    const closeButton = detailsModalElement.querySelector('.modal-close-button');

    if (closeButton) {
        closeButton.addEventListener('click', closeDetailsModal);
    }
    detailsModalElement.addEventListener('click', (event) => {
        if (event.target === detailsModalElement) {
            closeDetailsModal();
        }
    });
}