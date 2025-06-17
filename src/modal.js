// src/modal.js

let modalElement = null;
let modalTitleEl = null;
let modalBodyEl = null;

/**
 * Открывает модальное окно и вставляет в него контент.
 * @param {string} title - Заголовок для окна.
 * @param {HTMLElement | string} content - HTML-элемент или строка с HTML для тела окна.
 */
export function openModal(title, content) {
    if (!modalElement) return;

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
    if (modalElement) modalElement.style.display = 'none';
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