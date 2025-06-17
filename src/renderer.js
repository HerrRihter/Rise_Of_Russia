import widgets from './widgets/index.js';
import { supabase } from './supabaseClient.js';

/**
 * Главная функция отрисовки всего приложения.
 * @param {HTMLElement} container - Основной контейнер приложения (<div id="app">).
 * @param {object} state - Объект с текущим состоянием игры.
 * @param {object} definitions - Объект со всеми справочниками.
 * @param {object | null} user - Объект пользователя из Supabase, или null если он не авторизован.
 */
export function renderDashboard(container, state, definitions, user) {
  // Полная очистка контейнера перед любой отрисовкой
  container.innerHTML = '';

  // --- 1. ВЕРХНИЙ БАР С ИНФОРМАЦИЕЙ О ПОЛЬЗОВАТЕЛЕ И КНОПКОЙ ВЫХОДА ---
  const topBar = document.createElement('div');
  topBar.style.cssText = 'display: flex; justify-content: space-between; padding: 10px; background-color: #1e1e1e; align-items: center;';

  if (user) {
    // Если пользователь есть, показываем его email и кнопку "Выйти"
    topBar.innerHTML = `<span style="color: #ccc;">Вы вошли как: ${user.email}</span>`;
    const logoutButton = document.createElement('button');
    logoutButton.textContent = 'Выйти';
    logoutButton.style.cssText = 'padding: 5px 10px; cursor: pointer;';
    logoutButton.onclick = () => {
        // Вызываем функцию выхода из Supabase
        supabase.auth.signOut();
    };
    topBar.appendChild(logoutButton);
  } else {
    // Если пользователя нет
    topBar.innerHTML = `<span>Вы не авторизованы</span>`;
  }
  container.appendChild(topBar);

  // --- 2. ОСНОВНОЙ КОНТЕНТ (УСЛОВНЫЙ РЕНДЕРИНГ) ---
  if (user) {
    // --- ПОЛЬЗОВАТЕЛЬ АВТОРИЗОВАН: РИСУЕМ ПОЛНОЦЕННЫЙ ИНТЕРФЕЙС ---

    // Отрисовываем заголовок
    const header = document.createElement('header');
    if (state?.dashboardTitle) { // Добавлена проверка на существование state
        header.innerHTML = `<h1>${state.dashboardTitle}</h1>`;
        container.appendChild(header);
    }

    // Проверяем и отрисовываем layout
    if (state?.layout && Array.isArray(state.layout)) {
      state.layout.forEach(layoutItem => {
        const widgetName = layoutItem.widget_ref?.substring(1);
        const WidgetComponent = widgets[widgetName];
        if (WidgetComponent) {
          const widgetEl = WidgetComponent({ ...layoutItem.props, definitions, state });
          container.appendChild(widgetEl);
        } else {
          const errorEl = document.createElement('div');
          errorEl.style.color = 'red';
          errorEl.textContent = `Ошибка: виджет с именем "${widgetName}" не найден в реестре.`;
          container.appendChild(errorEl);
        }
      });
    } else {
      container.innerHTML += `<div style="padding: 20px;">Ожидание данных для построения интерфейса...</div>`;
    }

  } else {
    // --- ПОЛЬЗОВАТЕЛЬ НЕ АВТОРИЗОВАН: РИСУЕМ ВИДЖЕТ ВХОДА ---
    const AuthWidget = widgets['auth'];
    if (AuthWidget) {
      container.appendChild(AuthWidget());
    } else {
      container.innerHTML += `<h1 style="color:red;">Ошибка: виджет аутентификации не найден.</h1>`;
    }
  }
}