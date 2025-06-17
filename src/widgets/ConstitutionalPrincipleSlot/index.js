import './style.css';
import { addTooltipEvents } from '../../tooltip.js';
import { openSidePanel } from '../../sidePanel.js';

export default function ConstitutionalPrincipleSlotWidget(props) {
  const { definitions, type, assigned_id } = props;
  const slot = document.createElement('div');
  slot.className = 'constitutional-principle-slot';

  const principleDef = definitions.constitutional_principles[type];

  function updateView(optionId) {
    // ИСПРАВЛЕНИЕ: Находим опцию напрямую по ключу в объекте, а не через .find()
    const selectedOption = principleDef?.options?.[optionId];

    if (principleDef && selectedOption) {
      slot.innerHTML = `
        <img src="${principleDef.icon_path}" alt="${principleDef.name}">
        <span class="item-slot-label-small">${selectedOption.name_display || selectedOption.name}</span>
      `;
      slot.classList.remove('empty');
      addTooltipEvents(slot, selectedOption.name, null, selectedOption.description);
    } else {
      slot.innerHTML = '';
      slot.classList.add('empty');
      const title = principleDef ? principleDef.name : 'Принцип не найден';
      addTooltipEvents(slot, title, 'Опция не выбрана. Нажмите для выбора.', null);
    }
  }

  slot.addEventListener('click', () => {
    if (!principleDef || !principleDef.options) return;

    const title = `Выбор: ${principleDef.name}`;
    // ИСПРАВЛЕНИЕ: Превращаем объект опций в массив для отображения в панели
    const options = Object.values(principleDef.options);

    const onSelect = (selectedId) => {
      props.assigned_id = selectedId;
      updateView(selectedId);
    };
    openSidePanel(title, options, onSelect, 'icon-style');
  });

  updateView(assigned_id);
  return slot;
}