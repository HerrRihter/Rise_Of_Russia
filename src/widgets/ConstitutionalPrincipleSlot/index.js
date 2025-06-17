import './style.css';
import { addTooltipEvents } from '../../tooltip.js';
import { openSidePanel } from '../../sidePanel.js';

export default function ConstitutionalPrincipleSlotWidget(props) {
  const { definitions, state, type } = props;
  const principleDef = definitions.constitutional_principles[type];
  const assigned_id = state.constitutional_principles_selected_options[type]?.selected_option_id;

  const slot = document.createElement('div');
  slot.className = 'constitutional-principle-slot';

  function updateView(optionId) {
    const selectedOption = principleDef?.options?.[optionId];
    if (principleDef && selectedOption) {
      slot.innerHTML = `<img src="${principleDef.icon_path}" alt="${principleDef.name}"><span class="item-slot-label-small">${selectedOption.name_display || selectedOption.name}</span>`;
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
    const options = Object.values(principleDef.options);
    const onSelect = (selectedId) => {
      console.log(`Для принципа '${type}' выбрана опция: ${selectedId}`);
      state.constitutional_principles_selected_options[type] = { principle_id: type, selected_option_id: selectedId };
      updateView(selectedId);
    };
    openSidePanel(title, options, onSelect, 'icon-style');
  });

  updateView(assigned_id);
  return slot;
}