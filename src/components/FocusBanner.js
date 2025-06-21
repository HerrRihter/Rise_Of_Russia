import { addTooltipEvents } from './Tooltip.js';
import { openModal } from '../modal.js';
import widgets from '../widgets/index.js';

export function FocusBanner({ completed_focuses, definitions, turnImage }) {
  const focusBanner = document.createElement('div');
  focusBanner.className = 'national-focus-banner';

  const imageUrl = turnImage || 'history/turn_images/Autumn2003.png'; // Фоллбэк на старое изображение

  focusBanner.innerHTML = `<img src="${imageUrl}" alt="Дерево фокусов" class="focus-bg"><div class="focus-title-bar">Национальные Фокусы</div>`;
  addTooltipEvents(focusBanner, 'Дерево Национальных Фокусов', 'Нажмите, чтобы открыть дерево фокусов...', null);
  focusBanner.addEventListener('click', () => {
    const FocusTreeWidget = widgets['focus-tree'];
    if (FocusTreeWidget) {
      const focusTreeEl = FocusTreeWidget({
        focus_tree: definitions.national_focus_tree,
        completed_focuses: completed_focuses
      });
      openModal('Дерево Национальных Фокусов', focusTreeEl);
    } else {
      openModal('Ошибка', 'Виджет "Дерево фокусов" не найден в реестре.');
    }
  });
  return focusBanner;
} 