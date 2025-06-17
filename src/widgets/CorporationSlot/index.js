import './style.css';
import { addTooltipEvents } from '../../tooltip.js';
import { openSidePanel } from '../../sidePanel.js';

export default function CorporationSlotWidget(props) {
  const { definitions, state, type, slot_title } = props;
  const assigned_id = state.corporations_selected[type]?.assigned_id;

  const slot = document.createElement('div');
  slot.className = 'corporation-slot';

  function updateView(corpId) {
    const corporation = corpId ? definitions.corporations[corpId] : null;
    if (corporation) {
      slot.innerHTML = `<img src="${corporation.icon_path}" alt="${corporation.name}"><span class="item-slot-label-small">${corporation.name_display || corporation.name}</span>`;
      slot.classList.remove('empty');
      addTooltipEvents(slot, corporation.name, corporation.effects_summary, corporation.description);
    } else {
      slot.innerHTML = '';
      slot.classList.add('empty');
      addTooltipEvents(slot, slot_title || 'Слот корпорации', 'Слот пуст. Нажмите, чтобы выбрать.', null);
    }
  }

  slot.addEventListener('click', () => {
    const title = `Выбор корпорации`;
    const options = Object.values(definitions.corporations);
    const onSelect = (selectedId) => {
      console.log(`Для слота корпорации '${type}' выбран ID: ${selectedId}`);
      state.corporations_selected[type] = { slot_type: type, assigned_id: selectedId };
      updateView(selectedId);
    };
    openSidePanel(title, options, onSelect, 'icon-style');
  });

  updateView(assigned_id);
  return slot;
}