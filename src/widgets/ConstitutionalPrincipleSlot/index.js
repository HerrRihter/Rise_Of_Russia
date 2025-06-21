import './style.css';
import { addTooltipEvents } from '../../components/Tooltip.js';
import { openSidePanel } from '../../sidePanel.js';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { firebaseApp } from '../../firebaseClient.js';

export default function ConstitutionalPrincipleSlotWidget(props) {
  const { definitions, state, type, userId } = props;
  const principleDef = definitions.constitutional_principles[type];

  const wrapper = document.createElement('div');
  wrapper.className = 'constitutional-principle-wrapper';

  const slot = document.createElement('div');
  slot.className = 'constitutional-principle-slot';

  // Получаем профиль пользователя и права
  const profile = state.profile || {};
  const canChangeLaws = profile.abilities?.can_change_laws === true;
  let userPP = profile.political_power ?? 0;
  const profileDocRef = userId ? doc(getFirestore(firebaseApp), 'profiles', userId) : null;
  const stateDocRef = doc(getFirestore(firebaseApp), 'state', 'main');

  let pendingOptionId = null;
  let saveBtn = null;

  function updateView(optionId, showSave = false) {
    const selectedOption = principleDef?.options?.find(opt => opt.id === optionId);
    
    // Очищаем слот
    slot.innerHTML = '';
    slot.classList.remove('empty');
    
    if (principleDef && selectedOption) {
      slot.innerHTML = `<img src="${principleDef.icon_path}" alt="${selectedOption.name_display}">`;
      addTooltipEvents(slot.querySelector('img'), selectedOption.name_display, null, selectedOption.description);
    } else {
      slot.classList.add('empty');
      addTooltipEvents(slot, principleDef?.name || 'Принцип', 'Нажмите, чтобы выбрать', null);
    }

    // Обновляем заголовок
    let titleDiv = wrapper.querySelector('.constitutional-principle-title');
    if (!titleDiv) {
      titleDiv = document.createElement('div');
      titleDiv.className = 'constitutional-principle-title';
      wrapper.appendChild(titleDiv);
    }
    titleDiv.textContent = principleDef ? principleDef.name : '';

    // Удаляем старую кнопку, если есть
    const oldSaveBtn = wrapper.querySelector('.constitutional-principle-save-btn');
    if (oldSaveBtn) {
      oldSaveBtn.remove();
    }

    // Кнопка "Сохранить за 1000 ПП"
    if (showSave && pendingOptionId && pendingOptionId !== getCurrentOptionId()) {
      saveBtn = document.createElement('button');
      saveBtn.className = 'constitutional-principle-save-btn';
      saveBtn.textContent = 'Сохранить за 1000 ПП';
      saveBtn.style.marginTop = '8px';
      saveBtn.disabled = !canChangeLaws || userPP < 1000 || !profileDocRef;
      let tooltip = '';
      if (!canChangeLaws) tooltip = 'Нет права на изменение законов';
      else if (userPP < 1000) tooltip = 'Недостаточно политических очков';
      else if (!profileDocRef) tooltip = 'Ошибка профиля пользователя';
      if (tooltip) addTooltipEvents(saveBtn, 'Недоступно', tooltip, null);
      saveBtn.onclick = async () => {
        if (!canChangeLaws) return alert('Нет права на изменение законов!');
        if (userPP < 1000) return alert('Недостаточно политических очков!');
        if (!profileDocRef) return alert('Ошибка профиля пользователя!');
        saveBtn.disabled = true;
        try {
          // Сохраняем принцип в state
          const newPrinciples = { ...(state.constitutional_principles_selected_options || {}) };
          newPrinciples[type] = { principle_id: type, selected_option_id: pendingOptionId };
          await updateDoc(stateDocRef, { constitutional_principles_selected_options: newPrinciples });
          // Списываем ПП
          const newPP = userPP - 1000;
          await updateDoc(profileDocRef, { political_power: newPP });
          // Локально обновляем state
          if (!state.constitutional_principles_selected_options) state.constitutional_principles_selected_options = {};
          state.constitutional_principles_selected_options[type] = { principle_id: type, selected_option_id: pendingOptionId };
          if (state.profile) state.profile.political_power = newPP;
          userPP = newPP;
          // Обновляем отображение ПП в верхней панели
          const ppValueEl = document.querySelector('.user-resources-bar .resource-value');
          if (ppValueEl) ppValueEl.textContent = newPP;
          pendingOptionId = null;
          updateView(getCurrentOptionId(), false);
        } catch (e) {
          alert('Ошибка сохранения: ' + e.message);
          saveBtn.disabled = false;
        }
      };
      wrapper.appendChild(saveBtn);
    }
  }

  function getCurrentOptionId() {
    const principlesSelected = state?.constitutional_principles_selected_options || {};
    return principlesSelected[type]?.selected_option_id;
  }

  slot.addEventListener('click', (event) => {
    if (!event.isTrusted) return;
    if (!principleDef || !principleDef.options) return;
    const title = `Выбор: ${principleDef.name}`;
    const options = Object.values(principleDef.options);
    const onSelect = (selectedId) => {
      if (!selectedId || selectedId === getCurrentOptionId()) {
        pendingOptionId = null;
        updateView(getCurrentOptionId(), false);
        return;
      }
      pendingOptionId = selectedId;
      updateView(selectedId, true);
    };
    openSidePanel(title, options, onSelect, 'icon-style');
  });

  wrapper.appendChild(slot);
  updateView(getCurrentOptionId(), false);
  return wrapper;
}