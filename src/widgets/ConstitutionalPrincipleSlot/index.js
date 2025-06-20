import './style.css';
import { addTooltipEvents } from '../../components/Tooltip.js';
import { openSidePanel } from '../../sidePanel.js';

export default function ConstitutionalPrincipleSlotWidget(props) {
  const { definitions, state, type } = props;
  const principleDef = definitions.constitutional_principles[type];
  const principlesSelected = state?.constitutional_principles_selected_options || {};
  const assigned_id = principlesSelected[type]?.selected_option_id;

  const wrapper = document.createElement('div');
  wrapper.className = 'constitutional-principle-wrapper';

  const slot = document.createElement('div');
  slot.className = 'constitutional-principle-slot';

  function updateView(optionId) {
    const selectedOption = principleDef?.options?.[optionId];
    slot.innerHTML = '';
    if (principleDef && selectedOption) {
      slot.innerHTML = `<img src="${principleDef.icon_path}" alt="${selectedOption.name_display}">`;
      slot.classList.remove('empty');
      addTooltipEvents(slot.querySelector('img'), selectedOption.name_display, null, selectedOption.description);
    } else {
      slot.innerHTML = '';
      slot.classList.add('empty');
    }
    let titleDiv = wrapper.querySelector('.constitutional-principle-title');
    if (!titleDiv) {
      titleDiv = document.createElement('div');
      titleDiv.className = 'constitutional-principle-title';
      wrapper.appendChild(titleDiv);
    }
    titleDiv.textContent = principleDef ? principleDef.name : '';
  }

  slot.addEventListener('click', (event) => {
    if (!event.isTrusted) return;
    if (!principleDef || !principleDef.options) return;
    const title = `Выбор: ${principleDef.name}`;
    const options = Object.values(principleDef.options);
    const onSelect = (selectedId) => {
      if (!state.constitutional_principles_selected_options) state.constitutional_principles_selected_options = {};
      state.constitutional_principles_selected_options[type] = { principle_id: type, selected_option_id: selectedId };
      updateView(selectedId);
    };
    openSidePanel(title, options, onSelect, 'icon-style');
  });

  wrapper.appendChild(slot);
  updateView(assigned_id);
  return wrapper;
}