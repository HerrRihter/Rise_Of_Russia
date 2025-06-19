import './style.css';
import { signIn, signUp, onAuthStateChanged } from '../../auth.js';

export default function AuthWidget() {
  let isLoginView = true; // Переключатель между входом и регистрацией

  const container = document.createElement('div');
  container.className = 'auth-container';

  function render() {
    container.innerHTML = `
      <h2>${isLoginView ? 'Вход в систему' : 'Регистрация'}</h2>
      <form class="auth-form" id="authForm">
          <input type="email" id="email" placeholder="Email" required />
          <input type="password" id="password" placeholder="Пароль" required />
          <button type="submit">${isLoginView ? 'Войти' : 'Зарегистрироваться'}</button>
      </form>
      <div class="auth-toggle" id="toggleAuth">
          ${isLoginView ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
      </div>
      <div id="authMessage" class="auth-message" style="display: none;"></div>
    `;

    const messageEl = container.querySelector('#authMessage');

    container.querySelector('#toggleAuth').addEventListener('click', () => {
      isLoginView = !isLoginView;
      render(); // Перерисовываем виджет
    });

    container.querySelector('#authForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = e.target.email.value;
      const password = e.target.password.value;
      messageEl.style.display = 'none';

      try {
        if (isLoginView) {
          await signIn(email, password);
          messageEl.textContent = 'Успешный вход!';
          messageEl.className = 'auth-message success';
        } else {
          await signUp(email, password);
          messageEl.textContent = 'Успешная регистрация! Теперь вы можете войти.';
          messageEl.className = 'auth-message success';
        }
      } catch (error) {
        messageEl.textContent = `Ошибка: ${error.message}`;
        messageEl.className = 'auth-message error';
      }
      messageEl.style.display = 'block';
    });
  }

  render(); // Первая отрисовка
  return container;
}