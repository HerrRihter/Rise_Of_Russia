import { openModal } from '../modal.js';
import { drawPoliticalPieChart, updatePartyList } from './politicalDetailsUtils.js';
import { addTooltipEvents } from './Tooltip.js';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { firebaseApp } from '../firebaseClient.js';
import { redistributePopularity } from '../utils/partyBalance.js';

// === Состояние открытия мини-панели партий (глобально для модуля) ===
let isMiniPartyPanelOpen = false;
let isMiniPartyPanelListenerAttached = false;

export function PoliticalDetails({ ruling_party_id, definitions, state, userId }) {
  const detailsContainer = document.createElement('div');
  detailsContainer.className = 'political-details';
  const rulingParty = definitions.parties[ruling_party_id];
  // Получаем массив партий с актуальной популярностью
  const partiesPopularity = { ...state?.parties_popularity };
  const partiesWithPopularity = definitions.parties_array.map(party => ({
    ...party,
    popularity: partiesPopularity[party.id] ?? 0
  }));
  detailsContainer.innerHTML = `<div class="ruling-party-info"><strong>${rulingParty ? rulingParty.name : '...'}<\/strong><br><small>Следующие выборы: скоро<\/small><\/div><div class="political-system-info-container"><div class="pol-sys-upper"><div class="pol-sys-icon-wrapper"><img src="history/parties_emblems/democracy.png" alt="Полит. Система" class="flag"><\/div><div class="pol-sys-text-wrapper">Российск.<br>Политическая<br>Система<\/div><\/div><button class="balance-btn">Баланс<\/button><\/div><div class="party-popularity"><div class="pie-chart"><canvas id="partyPieChartCanvas" width="160" height="160"><\/canvas><\/div><ul class="party-list" id="partyListContainer"><\/ul><\/div>`;

  // Firestore setup
  const db = getFirestore(firebaseApp);
  const stateDocRef = doc(db, 'state', 'main');
  const profile = state.profile || {};
  const canInfluence = profile.abilities?.can_influence_party === true;
  let userPP = profile.political_power ?? 0;
  const profileDocRef = userId ? doc(db, 'profiles', userId) : null;

  // DEBUG LOGS
  console.log('PoliticalDetails: profile', profile);
  console.log('PoliticalDetails: abilities', profile.abilities);
  console.log('PoliticalDetails: canInfluence', canInfluence);
  console.log('PoliticalDetails: userId', userId);

  // Интерактив
  const canvas = detailsContainer.querySelector('#partyPieChartCanvas');
  const partyListUl = detailsContainer.querySelector('#partyListContainer');
  drawPoliticalPieChart(canvas, partiesWithPopularity);
  updatePartyList(partyListUl, partiesWithPopularity, ruling_party_id);
  const balanceButton = detailsContainer.querySelector('.balance-btn');
  if (balanceButton) {
    balanceButton.addEventListener('click', () => {
      const modalContentContainer = document.createElement('div');

      const renderContent = () => {
        const balance = state.balance ?? 0;
        const profile = state.profile || {};
        const userPP = profile.political_power ?? 0;
        const canInfluence = profile.abilities?.can_influence_on_president === true;

        // Конвертируем баланс из [-50, 50] в проценты [0, 100]
        const solarPercentage = balance + 50;
        const lunarPercentage = 100 - solarPercentage;

        modalContentContainer.innerHTML = `
          <div class="balance-modal-content">
              <div class="balance-display">
                  <span class="balance-label-lunar">Лунар</span>
                  <strong class="balance-value">${balance}</strong>
                  <span class="balance-label-solar">Солар</span>
              </div>
              <div class="balance-bar-container">
                   <div class="balance-bar">
                      <div class="balance-bar-lunar" style="width: ${lunarPercentage}%;"><\/div>
                      <div class="balance-bar-solar" style="width: ${solarPercentage}%;"><\/div>
                  </div>
              </div>
              <div class="balance-actions">
                  <button class="balance-change-btn decrease-btn" title="Сместить к Лунар (-1)" ${!canInfluence || userPP < 100 || balance <= -50 ? 'disabled' : ''}>-</button>
                  <div class="balance-cost">
                      <img src="history/icons/political_power.png" alt="PP" />
                      <span>100</span>
                  </div>
                  <button class="balance-change-btn increase-btn" title="Сместить к Солар (+1)" ${!canInfluence || userPP < 100 || balance >= 50 ? 'disabled' : ''}>+</button>
              </div>
              ${!canInfluence ? '<p class="disclaimer">У вас нет права влиять на президента.</p>' : (userPP < 100 && balance > -50 && balance < 50 ? '<p class="disclaimer">Недостаточно полит. очков.</p>' : '')}
          </div>
        `;

        const handleBalanceChange = async (change) => {
          if (!canInfluence || userPP < 100 || !profileDocRef) return;
          
          const newBalance = Math.max(-50, Math.min(50, balance + change));
          if (newBalance === balance) return;
          
          const newPP = userPP - 100;

          // Блокируем кнопки на время операции
          modalContentContainer.querySelectorAll('.balance-change-btn').forEach(b => { b.disabled = true; });

          try {
            await updateDoc(stateDocRef, { balance: newBalance });
            await updateDoc(profileDocRef, { political_power: newPP });

            // Обновляем состояние локально для мгновенного отклика
            state.balance = newBalance;
            if (state.profile) state.profile.political_power = newPP;
            
            // Обновляем очки в главном интерфейсе
            const ppValueEl = document.querySelector('.user-resources-bar .resource-value');
            if (ppValueEl) ppValueEl.textContent = newPP;

            // Перерисовываем содержимое модального окна
            renderContent();
          } catch (e) {
            alert('Ошибка обновления: ' + e.message);
            // Перерисовываем в случае ошибки, чтобы вернуть кнопки в норм состояние
            renderContent();
          }
        };
        
        modalContentContainer.querySelector('.decrease-btn')?.addEventListener('click', () => handleBalanceChange(-1));
        modalContentContainer.querySelector('.increase-btn')?.addEventListener('click', () => handleBalanceChange(1));
      };

      // Первый рендер содержимого
      renderContent();
      // Открываем модальное окно с созданным контейнером
      openModal('Баланс Сил', modalContentContainer, 'balance-modal');
    });
  }

  // === Кнопка справа от списка партий ===
  const partyBlock = detailsContainer.querySelector('.party-popularity');
  if (partyBlock) {
    partyBlock.style.display = 'flex';
    partyBlock.style.alignItems = 'flex-start';
    const btn = document.createElement('button');
    btn.className = 'mini-party-actions-btn';
    btn.title = 'Показать действия с партиями';
    btn.style.width = '28px';
    btn.style.height = '28px';
    btn.style.background = '#222';
    btn.style.border = '1.5px solid #888';
    btn.style.borderRadius = '6px';
    btn.style.marginLeft = '8px';
    btn.style.display = 'flex';
    btn.style.alignItems = 'center';
    btn.style.justifyContent = 'center';
    btn.style.cursor = 'pointer';
    btn.innerHTML = '<img src="history/icons/political_power.png" alt="Действия" style="width:18px;height:18px;">';
    const panel = document.createElement('div');
    panel.className = 'mini-party-actions-panel';
    panel.style.display = 'none';
    panel.style.position = 'absolute';
    panel.style.minWidth = '220px';
    panel.style.background = '#232323';
    panel.style.border = '1.5px solid #888';
    panel.style.borderRadius = '8px';
    panel.style.boxShadow = '2px 2px 12px #000a';
    panel.style.padding = '10px 12px';
    panel.style.right = '-240px';
    panel.style.top = '0';
    panel.style.zIndex = '200';
    function renderPanel() {
      console.log('[mini-party-panel] renderPanel, isMiniPartyPanelOpen =', isMiniPartyPanelOpen);
      panel.innerHTML = '<div style="font-weight:bold;margin-bottom:8px;">Партии</div>';
      // === Кнопка-крестик ===
      const closeBtn = document.createElement('button');
      closeBtn.innerHTML = '&times;';
      closeBtn.title = 'Закрыть';
      closeBtn.style.position = 'absolute';
      closeBtn.style.top = '7px';
      closeBtn.style.right = '10px';
      closeBtn.style.width = '24px';
      closeBtn.style.height = '24px';
      closeBtn.style.background = 'transparent';
      closeBtn.style.color = '#fff';
      closeBtn.style.border = 'none';
      closeBtn.style.fontSize = '1.5em';
      closeBtn.style.cursor = 'pointer';
      closeBtn.style.zIndex = '210';
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        panel.style.display = 'none';
        isMiniPartyPanelOpen = false;
        console.log('[mini-party-panel] closeBtn: закрытие панели, isMiniPartyPanelOpen =', isMiniPartyPanelOpen);
      });
      panel.appendChild(closeBtn);
      // Сортировка по популярности (по убыванию)
      const sortedParties = [...partiesWithPopularity].sort((a, b) => b.popularity - a.popularity);
      sortedParties.forEach((p, idx) => {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.alignItems = 'center';
        row.style.marginBottom = '6px';
        row.style.gap = '7px';
        const colorBox = document.createElement('span');
        colorBox.style.display = 'inline-block';
        colorBox.style.width = '13px';
        colorBox.style.height = '13px';
        colorBox.style.background = p.color || '#ccc';
        colorBox.style.border = '1px solid #555';
        colorBox.style.borderRadius = '2px';
        const nameSpan = document.createElement('span');
        nameSpan.style.flex = '1';
        nameSpan.textContent = p.name;
        const popSpan = document.createElement('span');
        popSpan.style.color = '#ffe082';
        popSpan.style.fontSize = '0.95em';
        popSpan.textContent = `${p.popularity}%`;
        // Кнопка вверх
        const upBtn = document.createElement('button');
        upBtn.style.width = '22px';
        upBtn.style.height = '22px';
        upBtn.style.background = '#2a2';
        upBtn.style.border = '1px solid #393';
        upBtn.style.borderRadius = '4px';
        upBtn.style.marginLeft = '4px';
        upBtn.style.display = 'flex';
        upBtn.style.alignItems = 'center';
        upBtn.style.justifyContent = 'center';
        upBtn.style.cursor = 'pointer';
        upBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 12 12"><path d="M6 2 L10 8 H2 Z" fill="#fff"/></svg>';
        addTooltipEvents(upBtn, '', 'Повысить популярность', '');
        // Кнопка вниз
        const downBtn = document.createElement('button');
        downBtn.style.width = '22px';
        downBtn.style.height = '22px';
        downBtn.style.background = '#a22';
        downBtn.style.border = '1px solid #933';
        downBtn.style.borderRadius = '4px';
        downBtn.style.marginLeft = '2px';
        downBtn.style.display = 'flex';
        downBtn.style.alignItems = 'center';
        downBtn.style.justifyContent = 'center';
        downBtn.style.cursor = 'pointer';
        downBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 12 12"><path d="M6 10 L2 4 H10 Z" fill="#fff"/></svg>';
        addTooltipEvents(downBtn, '', 'Понизить популярность', '');
        const canClick = canInfluence && userPP >= 25 && profileDocRef;
        upBtn.disabled = !canClick;
        downBtn.disabled = !canClick;
        // Логика ↑
        upBtn.onclick = async () => {
          if (!canInfluence) return alert('Нет права на влияние на партии!');
          if (userPP < 25) return alert('Недостаточно политических очков!');
          if (!profileDocRef) return alert('Ошибка профиля пользователя!');
          if (p.popularity >= 100) return;
          // Используем новую функцию перераспределения
          const newPopularities = redistributePopularity(p.id, partiesPopularity, 1);
          const newPP = userPP - 75;
          upBtn.disabled = true;
          downBtn.disabled = true;
          try {
            await updateDoc(stateDocRef, { parties_popularity: newPopularities });
            await updateDoc(profileDocRef, { political_power: newPP });
            Object.assign(partiesPopularity, newPopularities);
            partiesWithPopularity.forEach(pp => { pp.popularity = newPopularities[pp.id] ?? 0; });
            userPP = newPP;
            if (state.profile) state.profile.political_power = newPP;
            // Мгновенно обновляем отображение политических очков в верхней панели:
            const ppValueEl = document.querySelector('.user-resources-bar .resource-value');
            if (ppValueEl) ppValueEl.textContent = newPP;
            console.log('[mini-party-panel] renderPanel after upBtn (популярность увеличена)');
            renderPanel();
            drawPoliticalPieChart(canvas, partiesWithPopularity);
            updatePartyList(partyListUl, partiesWithPopularity, ruling_party_id);
          } catch (e) {
            alert('Ошибка обновления: ' + e.message);
          }
          upBtn.disabled = false;
          downBtn.disabled = false;
        };
        // Логика ↓
        downBtn.onclick = async () => {
          if (!canInfluence) return alert('Нет права на влияние на партии!');
          if (userPP < 25) return alert('Недостаточно политических очков!');
          if (!profileDocRef) return alert('Ошибка профиля пользователя!');
          if (p.popularity <= 0) return;
          // Используем новую функцию перераспределения
          const newPopularities = redistributePopularity(p.id, partiesPopularity, -1);
          const newPP = userPP - 75;
          upBtn.disabled = true;
          downBtn.disabled = true;
          try {
            await updateDoc(stateDocRef, { parties_popularity: newPopularities });
            await updateDoc(profileDocRef, { political_power: newPP });
            Object.assign(partiesPopularity, newPopularities);
            partiesWithPopularity.forEach(pp => { pp.popularity = newPopularities[pp.id] ?? 0; });
            userPP = newPP;
            if (state.profile) state.profile.political_power = newPP;
            // Мгновенно обновляем отображение политических очков в верхней панели:
            const ppValueEl = document.querySelector('.user-resources-bar .resource-value');
            if (ppValueEl) ppValueEl.textContent = newPP;
            console.log('[mini-party-panel] renderPanel after downBtn (популярность уменьшена)');
            renderPanel();
            drawPoliticalPieChart(canvas, partiesWithPopularity);
            updatePartyList(partyListUl, partiesWithPopularity, ruling_party_id);
          } catch (e) {
            alert('Ошибка обновления: ' + e.message);
          }
          upBtn.disabled = false;
          downBtn.disabled = false;
        };
        row.appendChild(colorBox);
        row.appendChild(nameSpan);
        row.appendChild(popSpan);
        row.appendChild(upBtn);
        row.appendChild(downBtn);
        panel.appendChild(row);
      });
      // После рендера — восстановить состояние открытия панели
      panel.style.display = isMiniPartyPanelOpen ? 'block' : 'none';
      console.log('[mini-party-panel] panel.style.display =', panel.style.display);
    }
    renderPanel();
    btn.onclick = (e) => {
      e.stopPropagation();
      isMiniPartyPanelOpen = !(panel.style.display === 'block');
      panel.style.display = isMiniPartyPanelOpen ? 'block' : 'none';
      console.log('[mini-party-panel] btn.onclick, isMiniPartyPanelOpen =', isMiniPartyPanelOpen, ', panel.style.display =', panel.style.display);
    };
    // === Добавляем обработчик document только один раз ===
    if (!isMiniPartyPanelListenerAttached) {
      document.addEventListener('click', (e) => {
        // Ищем актуальные элементы в DOM
        const panel = document.querySelector('.mini-party-actions-panel');
        const btn = document.querySelector('.mini-party-actions-btn');
        if (panel && panel.style.display === 'block' && !panel.contains(e.target) && e.target !== btn) {
          panel.style.display = 'none';
          isMiniPartyPanelOpen = false;
          console.log('[mini-party-panel] document click: закрытие панели (универсально), isMiniPartyPanelOpen =', isMiniPartyPanelOpen);
          console.trace('[mini-party-panel] document click stack');
        }
      });
      isMiniPartyPanelListenerAttached = true;
    }
    partyBlock.appendChild(btn);
    partyBlock.style.position = 'relative';
    partyBlock.appendChild(panel);
  }

  return detailsContainer;
} 