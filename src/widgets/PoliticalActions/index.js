import './style.css';
import { openModal } from '../../modal.js';
import { supabase } from '../../supabaseClient.js';

// --- НОВАЯ ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ для обработки клика ---
// Мы вынесли логику в отдельную функцию, чтобы не дублировать код
async function handlePopularityChange(party, changeValue, buttonElement) {
  const actionText = changeValue > 0 ? "повысить" : "понизить";
  if (!confirm(`Вы уверены, что хотите потратить 25 очков, чтобы ${actionText} популярность партии "${party.name}"?`)) {
    return;
  }

  buttonElement.disabled = true;
  buttonElement.textContent = '...';

  try {
    const { data, error } = await supabase.functions.invoke('perform-political-action', {
      // Тип действия остается тот же, мы просто меняем значение
      body: { actionType: 'INFLUENCE_PARTY', params: { partyId: party.id, change: changeValue } }
    });
    if (error) throw new Error(error.message);
    if (data.error) throw new Error(data.error);

    alert('Успех! Изменения скоро отобразятся.');
  } catch (e) {
    alert(`Ошибка: ${e.message}`);
  } finally {
    buttonElement.disabled = false;
    buttonElement.textContent = `${changeValue > 0 ? '+' : ''}${changeValue}%`;
  }
}

// --- Вспомогательные функции для создания контента модального окна ---

// Создает блок для взаимодействия с одной партией
function createPartyActionElement(party, state) {
  const element = document.createElement('div');
  element.className = 'party-action-item';

  // Левая часть: информация о партии
  const infoContainer = document.createElement('div');
  infoContainer.className = 'party-info-container';
  infoContainer.innerHTML = `
    <div class="party-header">
      <div class="party-color-box" style="background-color: ${party.color || '#ccc'};"></div>
      <span class="party-name">${party.name}</span>
    </div>
    <div class="party-popularity">Популярность: ${party.popularity}%</div>
  `;

  element.appendChild(infoContainer);

  // Правая часть: кнопки действий
  if (state.profile?.abilities?.can_influence_parties) {
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'action-buttons-container';

    const increaseButton = document.createElement('button');
    increaseButton.className = 'action-button increase';
    increaseButton.textContent = '+1%';
    increaseButton.title = 'Повысить популярность (Стоимость: 25 ПП)';
    increaseButton.onclick = () => handlePopularityChange(party, 1, increaseButton);

    const decreaseButton = document.createElement('button');
    decreaseButton.className = 'action-button decrease';
    decreaseButton.textContent = '-1%';
    decreaseButton.title = 'Понизить популярность (Стоимость: 25 ПП)';
    decreaseButton.onclick = () => handlePopularityChange(party, -1, decreaseButton);

    buttonsContainer.appendChild(increaseButton);
    buttonsContainer.appendChild(decreaseButton);
    element.appendChild(buttonsContainer);
  }

  return element;
}


// Создает основной контент для модального окна
function createPoliticalActionsContent(state, definitions) {
  const content = document.createElement('div');
  content.className = 'political-actions-content';

  const partiesHeader = document.createElement('h5');
  partiesHeader.textContent = 'Влияние на партии';
  content.appendChild(partiesHeader);

  // Создаем элементы для каждой партии
  definitions.parties_array
    .sort((a, b) => b.popularity - a.popularity)
    .forEach(party => {
      const partyElement = createPartyActionElement(party, state);
      content.appendChild(partyElement);
    });

  // В будущем сюда можно добавить раздел для смены министров
  // const ministersHeader = document.createElement('h5');
  // ...

  return content;
}


// --- Основная функция виджета ---
export default function PoliticalActionsWidget(props) {
  const { state, definitions } = props;

  const widget = document.createElement('div');
  widget.className = 'political-actions-widget';

  const button = document.createElement('button');
  button.className = 'open-actions-button';
  button.textContent = 'Политические Действия';

  // Кнопка будет неактивна, если у пользователя вообще нет никаких политических способностей
  const hasAbilities = state.profile?.abilities && Object.keys(state.profile.abilities).length > 0;
  if (!hasAbilities) {
    button.disabled = true;
    button.title = 'У вас нет доступных политических действий.';
  }

  button.onclick = () => {
    const modalContent = createPoliticalActionsContent(state, definitions);
    openModal('Центр Политических Действий', modalContent);
  };

  widget.appendChild(button);
  return widget;
}