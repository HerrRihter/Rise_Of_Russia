import './style.css';
import { addTooltipEvents } from '../../components/Tooltip.js';
import { openSidePanel } from '../../sidePanel.js';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { firebaseApp } from '../../firebaseClient.js';

export default function AdvisorSlotWidget(props) {
  const { definitions, state, type, slot_title, userId } = props;

  const slot = document.createElement('div');
  slot.className = 'advisor-portrait-slot';

  // Получаем профиль пользователя и права
  const profile = state.profile || {};
  const canEnact = profile.abilities?.can_enact_advisors === true;
  let userPP = profile.political_power ?? 0;
  const profileDocRef = userId ? doc(getFirestore(firebaseApp), 'profiles', userId) : null;
  const stateDocRef = doc(getFirestore(firebaseApp), 'state', 'main');

  let pendingAdvisorId = null;
  let saveBtn = null;

  function updateView(advisorId, showSave = false) {
    const advisor = advisorId ? definitions.leaders[advisorId] : null;
    // Очищаем слот
    slot.innerHTML = '';
    slot.classList.remove('empty');
    // Контейнер для портрета
    const portraitDiv = document.createElement('div');
    portraitDiv.className = 'advisor-portrait-img-container';
    if (advisor) {
      portraitDiv.innerHTML = `<img src="${advisor.portrait_path}" alt="${advisor.name}">`;
      addTooltipEvents(portraitDiv, advisor.name, advisor.tooltip_summary, advisor.description);
    } else {
      portraitDiv.classList.add('empty');
      addTooltipEvents(portraitDiv, slot_title || 'Слот пуст', 'Нажмите, чтобы назначить', null);
    }
    slot.appendChild(portraitDiv);
    // Подпись должности
    const titleDiv = document.createElement('div');
    titleDiv.className = 'advisor-slot-title';
    titleDiv.textContent = slot_title || '';
    slot.appendChild(titleDiv);
    if (!advisor) slot.classList.add('empty');

    // Кнопка "Сохранить за 250 ПП"
    if (showSave && pendingAdvisorId && pendingAdvisorId !== getCurrentAdvisorId()) {
      saveBtn = document.createElement('button');
      saveBtn.className = 'advisor-save-btn';
      saveBtn.textContent = 'Сохранить за 250 ПП';
      saveBtn.style.marginTop = '8px';
      saveBtn.disabled = !canEnact || userPP < 250 || !profileDocRef;
      let tooltip = '';
      if (!canEnact) tooltip = 'Нет права на смену советников';
      else if (userPP < 250) tooltip = 'Недостаточно политических очков';
      else if (!profileDocRef) tooltip = 'Ошибка профиля пользователя';
      if (tooltip) addTooltipEvents(saveBtn, 'Недоступно', tooltip, null);
      saveBtn.onclick = async () => {
        if (!canEnact) return alert('Нет права на смену советников!');
        if (userPP < 250) return alert('Недостаточно политических очков!');
        if (!profileDocRef) return alert('Ошибка профиля пользователя!');
        saveBtn.disabled = true;
        try {
          // Сохраняем советника в state
          const newAdvisors = { ...(state.advisors_selected || {}) };
          newAdvisors[type] = { slot_type: type, assigned_id: pendingAdvisorId };
          await updateDoc(stateDocRef, { advisors_selected: newAdvisors });
          // Списываем ПП
          const newPP = userPP - 250;
          await updateDoc(profileDocRef, { political_power: newPP });
          // Локально обновляем state
          if (!state.advisors_selected) state.advisors_selected = {};
          state.advisors_selected[type] = { slot_type: type, assigned_id: pendingAdvisorId };
          if (state.profile) state.profile.political_power = newPP;
          userPP = newPP;
          // Обновляем отображение ПП в верхней панели
          const ppValueEl = document.querySelector('.user-resources-bar .resource-value');
          if (ppValueEl) ppValueEl.textContent = newPP;
          pendingAdvisorId = null;
          updateView(getCurrentAdvisorId(), false);
        } catch (e) {
          alert('Ошибка сохранения: ' + e.message);
          saveBtn.disabled = false;
        }
      };
      slot.appendChild(saveBtn);
    }
  }

  function getCurrentAdvisorId() {
    const advisorsSelected = state?.advisors_selected || {};
    return advisorsSelected[type]?.assigned_id;
  }

  slot.addEventListener('click', (event) => {
    if (!event.isTrusted) return;
    const title = `Выбор: ${slot_title || 'Советник'}`;
    const options = Object.values(definitions.leaders);
    const onSelect = (selectedId) => {
      if (!selectedId || selectedId === getCurrentAdvisorId()) {
        pendingAdvisorId = null;
        updateView(getCurrentAdvisorId(), false);
        return;
      }
      pendingAdvisorId = selectedId;
      updateView(selectedId, true);
    };
    openSidePanel(title, options, onSelect, 'advisor-style');
  });

  updateView(getCurrentAdvisorId(), false);
  return slot;
}