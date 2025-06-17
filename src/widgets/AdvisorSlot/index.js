import './style.css';
import { addTooltipEvents } from '../../tooltip.js';
import { openSidePanel } from '../../sidePanel.js';

export default function AdvisorSlotWidget(props) {
  const { definitions, assigned_id, slot_title } = props;
  const slot = document.createElement('div');
  slot.className = 'advisor-portrait-slot';

  function updateView(advisorId) {
    const advisor = advisorId ? definitions.leaders[advisorId] : null;
    if (advisor) {
      slot.innerHTML = `<img src="${advisor.portrait_path}" alt="${advisor.name}">`;
      slot.classList.remove('empty');
      const tooltipTitle = `${slot_title || 'Должность'}\n<strong style="color: #ffd700;">${advisor.name}</strong>`;
      addTooltipEvents(slot, tooltipTitle, advisor.tooltip_summary, advisor.description);
    } else {
      slot.innerHTML = '';
      slot.classList.add('empty');
      addTooltipEvents(slot, slot_title || 'Слот пуст', 'Нажмите, чтобы назначить', null);
    }
  }

  slot.addEventListener('click', () => {
    const title = `Выбор: ${slot_title || 'Советник'}`;
    const options = Object.values(definitions.leaders);
    const onSelect = (selectedId) => {
      console.log(`Для слота '${slot_title}' выбран ID: ${selectedId}`);
      props.assigned_id = selectedId;
      updateView(selectedId);
    };
    openSidePanel(title, options, onSelect, 'advisor-style');
  });

  updateView(assigned_id);
  return slot;
}