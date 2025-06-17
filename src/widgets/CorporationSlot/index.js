import './style.css';
import { addTooltipEvents } from '../../tooltip.js';
import { openSidePanel } from '../../sidePanel.js';

export default function CorporationSlotWidget(props) {
  // Мы ожидаем получить assigned_id и definitions
  const { definitions, assigned_id } = props;

  const slot = document.createElement('div');
  slot.className = 'corporation-slot';

  // Функция для обновления вида слота. Будет вызываться при создании и после выбора.
  function updateView(corpId) {
    // Находим данные корпорации в справочнике по ID
    const corporation = corpId ? definitions.corporations[corpId] : null;

    if (corporation) {
      // Если корпорация найдена, рисуем ее
      slot.innerHTML = `
        <img src="${corporation.icon_path}" alt="${corporation.name}">
        <span class="item-slot-label-small">${corporation.name_display || corporation.name}</span>
      `;
      slot.classList.remove('empty');
      // И добавляем для нее информативный тултип
      addTooltipEvents(slot, corporation.name, corporation.effects_summary, corporation.description);
    } else {
      // Если корпорация не назначена (corpId is null), рисуем пустой слот
      slot.innerHTML = ''; // Убираем старую картинку и текст
      slot.classList.add('empty');
      addTooltipEvents(slot, 'Слот корпорации', 'Слот пуст. Нажмите, чтобы выбрать корпорацию.', null);
    }
  }

  // Добавляем обработчик клика, который будет вызывать боковую панель
  slot.addEventListener('click', () => {
    const title = 'Выбор корпорации';
    // В качестве опций передаем весь список корпораций из справочника
    const options = Object.values(definitions.corporations);

    // Это функция, которая выполнится после выбора в панели
    const onSelect = (selectedId) => {
      console.log(`Для слота корпорации выбран ID: ${selectedId}`);
      props.assigned_id = selectedId; // Обновляем состояние "в памяти"
      updateView(selectedId); // Перерисовываем слот с новым выбором
    };

    // Вызываем панель, указывая стиль для квадратных иконок
    openSidePanel(title, options, onSelect, 'icon-style');
  });

  // Первоначальная отрисовка слота при загрузке страницы
  updateView(assigned_id);

  return slot;
}