// script.js
let tooltipElement = null; 

function downloadJSON(data, filename) {
    const jsonDataStr = JSON.stringify(data, null, 4);
    const blob = new Blob([jsonDataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log(`Файл ${filename} готов для скачивания.`);
}

function handleSaveChanges() {
    console.log("Сохранение current_state.json...");
    const stateToSave = JSON.parse(JSON.stringify(GAME_DATA.currentState));
    
    if (balanceValueDisplay) {
      stateToSave.balance_value = parseInt(balanceValueDisplay.textContent || '0');
    }
    if (GAME_DATA.currentNationalFocus && GAME_DATA.currentNationalFocus.id) {
       stateToSave.active_national_focus_id = GAME_DATA.currentNationalFocus.id; 
    }

    downloadJSON(stateToSave, 'current_state_updated.json');
    alert("Файл 'current_state_updated.json' подготовлен к скачиванию.\nЗамените им существующий current_state.json в папке history.");
}

function positionTooltip(event) {
    if (tooltipElement && tooltipElement.style.display === 'block') {
        let x = event.clientX + 15;
        let y = event.clientY + 15;
        const screenPadding = 10;
        if (x + tooltipElement.offsetWidth + screenPadding > window.innerWidth) { x = event.clientX - tooltipElement.offsetWidth - 15; }
        if (x < screenPadding) x = screenPadding;
        if (y + tooltipElement.offsetHeight + screenPadding > window.innerHeight) { y = event.clientY - tooltipElement.offsetHeight - 15; }
        if (y < screenPadding) y = screenPadding;
        tooltipElement.style.left = x + 'px';
        tooltipElement.style.top = y + 'px';
    }
}

function addTooltipEventsToElement(element, name, effectsSummary, fullDescription = null, explicitSlotTitle = null) {
    if (!element || !tooltipElement) { 
        if(!tooltipElement && element) console.warn("tooltipElement is null in addTooltipEventsToElement for element:", element); // Убрал '!element' из условия console.warn
        return;
    }
    element.addEventListener('mouseenter', function(event) {
        let tooltipContent = "";
        const slotTitle = explicitSlotTitle || this.dataset.slotTitle;
        if (slotTitle) { tooltipContent += `<small style="color: #aaa; display: block; margin-bottom: 4px; font-style: italic;">${slotTitle}</small>`; }
        if (name) {
            if (tooltipContent && !tooltipContent.endsWith("</small>")) tooltipContent += "<hr style='margin-top:4px; margin-bottom:4px; border-color:#444;'>";
            else if (tooltipContent) tooltipContent += "<hr style='margin-top:4px; margin-bottom:4px; border-color:#444;'>";
            tooltipContent += `<strong>${name}</strong>`;
        }
        if (effectsSummary) {
            if (tooltipContent && !tooltipContent.endsWith("</strong>") && !(tooltipContent.endsWith("</small>") && !name) ) { tooltipContent += "<hr style='margin-top:4px; margin-bottom:4px; border-color:#444;'>"; }
            else if (!tooltipContent && effectsSummary) {} 
            else if (tooltipContent && !name && slotTitle){ tooltipContent += "<hr style='margin-top:4px; margin-bottom:4px; border-color:#444;'>"; }
            tooltipContent += String(effectsSummary).replace(/\n/g, '<br>');
        }
        if (fullDescription) {
            if (tooltipContent && !tooltipContent.endsWith("<br>") && !tooltipContent.endsWith("</strong>") && !tooltipContent.endsWith("</small>")) tooltipContent += "<hr style='margin-top:4px; margin-bottom:4px; border-color:#444;'>";
            else if (tooltipContent && (tooltipContent.endsWith("<br>") || tooltipContent.endsWith("</strong>") || tooltipContent.endsWith("</small>"))) { tooltipContent += "<hr style='margin-top:4px; margin-bottom:4px; border-color:#444;'>"; }
            tooltipContent += "<small>" + String(fullDescription).replace(/\n/g, '<br>') + "</small>";
        }
        if (!name && slotTitle && !effectsSummary && !fullDescription && element.dataset.slotType && 
            !element.dataset.slotType.startsWith("constitutional_principle_") && 
            !element.dataset.slotType.startsWith("development_area_") &&
            !element.dataset.slotType.includes("_display")) { 
            if (tooltipContent && !tooltipContent.endsWith("</small>")) { tooltipContent += "<hr style='margin-top:4px; margin-bottom:4px; border-color:#444;'>"; }
            tooltipContent += "<strong>Назначить / Выбрать</strong>";
        } else if (!name && !slotTitle && !effectsSummary && !fullDescription) {
            const staticTooltipText = this.dataset.tooltip;
            if (staticTooltipText) { tooltipContent = staticTooltipText.replace(/\n/g, '<br>'); }
        }
        if (tooltipContent && tooltipElement) {
            tooltipElement.innerHTML = tooltipContent;
            tooltipElement.style.display = 'block';
            positionTooltip(event);
        } else if (tooltipElement) {
            tooltipElement.style.display = 'none';
        }
    });
    element.addEventListener('mousemove', positionTooltip);
    element.addEventListener('mouseleave', function() { if (tooltipElement) tooltipElement.style.display = 'none'; });
}

const balanceModal = document.getElementById('balanceModal');
const balanceButton = document.getElementById('balanceButton');
const closeBalanceModalBtn_Balance = document.getElementById('closeBalanceModalBtn_Balance');
const balanceMarker = document.getElementById('balanceMarker');
const balanceValueDisplay = document.getElementById('balanceValueDisplay');

function updateBalanceScale(value) {
    value = Math.max(-50, Math.min(50, Number(value || 0)));
    const percentage = (value + 50);
    if (balanceMarker) balanceMarker.style.left = percentage + '%';
    if (balanceValueDisplay) balanceValueDisplay.textContent = value;
    const balanceValueInput = document.getElementById('balanceValueInput');
    if(balanceValueInput) balanceValueInput.value = value;
    if (GAME_DATA.currentState) { GAME_DATA.currentState.balance_value = value; }
}
if (balanceButton) balanceButton.onclick = () => { 
    if(balanceModal) balanceModal.style.display = 'flex'; 
    updateBalanceScale(GAME_DATA.currentState?.balance_value ?? 0); 
};
if (closeBalanceModalBtn_Balance) closeBalanceModalBtn_Balance.onclick = () => { if(balanceModal) balanceModal.style.display = 'none'; };

const GAME_DATA = { 
    leaders: {}, constitutional_principles: {}, development_areas: {}, corporations: {}, 
    ideologies: {}, parties: {}, national_spirits: {}, currentNationalFocus: null,
    currentState: { 
        display_leader_id: null, display_ideology_id: null,
        ruling_party_id: null, active_national_focus_id: null,
        active_national_spirit_ids: [],
        balance_value: 0,
        advisors_selected: {}, corporations_selected: {}, constitutional_principles_selected_options: {}, development_areas_state: {}
    } 
};
const ALL_DATA_FILES_TO_LOAD = [
    "history/leaders.json", "history/constitutional_principles.json", "history/development_areas.json",
    "history/corporations.json", "history/ideologies.json", "history/parties.json",
    "history/national_spirits.json", "history/national_focus_data.json", "history/current_state.json" 
];

async function loadJsonFile(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) { throw new Error(`HTTP error ${response.status} for ${filePath}`); }
        return await response.json();
    } catch (error) { console.error(`Ошибка загрузки ${filePath}:`, error); return null; }
}

async function initializeGameData() {
    const loadPromises = ALL_DATA_FILES_TO_LOAD.map(async (filePath) => {
        const data = await loadJsonFile(filePath);
        if (!data && !filePath.endsWith('current_state.json')) { console.warn(`Данные для ${filePath} не загружены.`); return; }
        
        if (filePath.endsWith('leaders.json') && data.options) { GAME_DATA.leaders = {}; data.options.forEach(l => { if(l.id) GAME_DATA.leaders[l.id] = l;}); }
        else if (filePath.endsWith('constitutional_principles.json') && data.principles) { GAME_DATA.constitutional_principles = {}; data.principles.forEach(p => {if(p.id)GAME_DATA.constitutional_principles[p.id] = p;}); }
        else if (filePath.endsWith('development_areas.json') && data.areas) { GAME_DATA.development_areas = {}; data.areas.forEach(a => {if(a.id)GAME_DATA.development_areas[a.id] = a;}); }
        else if (filePath.endsWith('corporations.json') && data.options) { GAME_DATA.corporations = {}; data.options.forEach(c => {if(c.id)GAME_DATA.corporations[c.id] = c;}); }
        else if (filePath.endsWith('ideologies.json') && data.options) { GAME_DATA.ideologies = {}; data.options.forEach(i => {if(i.id)GAME_DATA.ideologies[i.id] = i;}); }
        else if (filePath.endsWith('parties.json') && data.options) { GAME_DATA.parties_array = data.options; GAME_DATA.parties = {}; data.options.forEach(p => {if(p.id)GAME_DATA.parties[p.id] = p;}); }
        else if (filePath.endsWith('national_spirits.json') && data.options) { GAME_DATA.national_spirits = {}; data.options.forEach(s => {if(s.id)GAME_DATA.national_spirits[s.id] = s;}); }
        else if (filePath.endsWith('national_focus_data.json') && data.current_focus) { GAME_DATA.currentNationalFocus = data.current_focus; }
        else if (filePath.endsWith('current_state.json')) {
            if (data) {
                GAME_DATA.currentState.display_leader_id = data.display_leader_id || GAME_DATA.currentState.display_leader_id;
                GAME_DATA.currentState.display_ideology_id = data.display_ideology_id || GAME_DATA.currentState.display_ideology_id;
                GAME_DATA.currentState.ruling_party_id = data.ruling_party_id || GAME_DATA.currentState.ruling_party_id;
                GAME_DATA.currentState.active_national_focus_id = data.active_national_focus_id || GAME_DATA.currentState.active_national_focus_id;
                GAME_DATA.currentState.active_national_spirit_ids = data.active_national_spirit_ids || GAME_DATA.currentState.active_national_spirit_ids;
                GAME_DATA.currentState.balance_value = data.balance_value ?? GAME_DATA.currentState.balance_value;
                GAME_DATA.currentState.advisors_selected = { ...GAME_DATA.currentState.advisors_selected, ...data.advisors_selected };
                GAME_DATA.currentState.corporations_selected = { ...GAME_DATA.currentState.corporations_selected, ...data.corporations_selected };
                GAME_DATA.currentState.constitutional_principles_selected_options = { ...GAME_DATA.currentState.constitutional_principles_selected_options, ...data.constitutional_principles_selected_options };
                if (data.development_areas_state) {
                    for (const areaKey in data.development_areas_state) {
                        if (GAME_DATA.currentState.development_areas_state[areaKey]) {
                            GAME_DATA.currentState.development_areas_state[areaKey] = { ...GAME_DATA.currentState.development_areas_state[areaKey], ...data.development_areas_state[areaKey] };
                        } else {
                            GAME_DATA.currentState.development_areas_state[areaKey] = data.development_areas_state[areaKey];
                        }
                    }
                } else { 
                     Object.keys(GAME_DATA.development_areas).forEach(areaId => { // Этот блок выполнится если development_areas уже загружены
                        const areaDef = GAME_DATA.development_areas[areaId];
                        if(areaDef) { // Проверка, что areaDef существует
                           GAME_DATA.currentState.development_areas_state[areaId] = {
                               current_level_id: areaDef.current_level_id || areaDef.levels?.[0]?.id,
                               current_progress: areaDef.current_progress ?? 0
                           };
                        }
                    });
                }
                console.log("Файл состояния current_state.json загружен и объединен.");
            } else {
                 console.warn(`Файл current_state.json не найден. Инициализация состояния из определений...`);
                if (GAME_DATA.constitutional_principles) {
                    Object.keys(GAME_DATA.constitutional_principles).forEach(pId => {
                        const principle = GAME_DATA.constitutional_principles[pId];
                        // В файлах определений constitutional_principles.json теперь нет is_current. Берем первую опцию.
                        const defaultOption = principle.options?.[0];
                        if (defaultOption) GAME_DATA.currentState.constitutional_principles_selected_options[pId] = defaultOption.id;
                    });
                }
                 if (GAME_DATA.development_areas) {
                    Object.keys(GAME_DATA.development_areas).forEach(areaId => {
                        const areaDef = GAME_DATA.development_areas[areaId];
                        // В файлах определений development_areas.json теперь нет current_level_id/current_progress. Берем первый уровень и 0 прогресс.
                        if(areaDef) {
                            GAME_DATA.currentState.development_areas_state[areaId] = {
                                current_level_id: areaDef.levels?.[0]?.id, 
                                current_progress: 0 
                            };
                        }
                    });
                }
                 // Для advisors_selected и corporations_selected нужно взять ID из HTML слотов, ЕСЛИ бы мы не удаляли их оттуда.
                 // Так как мы их удалили, начальное состояние этих полей будет {}, и они заполнятся из current_state.json 
                 // или останутся пустыми (и тогда initializeUI отобразит плейсхолдеры)
            }
        }
    });
    await Promise.all(loadPromises);
    // Если current_state.json не был найден, и GAME_DATA.development_areas еще не были загружены при первой попытке инициализации из него
    if (!GAME_DATA.currentState.development_areas_state || Object.keys(GAME_DATA.currentState.development_areas_state).length === 0) {
        if (GAME_DATA.development_areas && Object.keys(GAME_DATA.development_areas).length > 0) {
             console.warn("Дополнительная инициализация development_areas_state из определений.");
            Object.keys(GAME_DATA.development_areas).forEach(areaId => {
                const areaDef = GAME_DATA.development_areas[areaId];
                 GAME_DATA.currentState.development_areas_state[areaId] = {
                    current_level_id: areaDef.levels?.[0]?.id, // Первый уровень по умолчанию
                    current_progress: 0 // 0 прогресс по умолчанию
                };
            });
        }
    }
     if (!GAME_DATA.currentState.constitutional_principles_selected_options || Object.keys(GAME_DATA.currentState.constitutional_principles_selected_options).length === 0) {
        if (GAME_DATA.constitutional_principles && Object.keys(GAME_DATA.constitutional_principles).length > 0) {
             console.warn("Дополнительная инициализация constitutional_principles_selected_options из определений.");
             Object.keys(GAME_DATA.constitutional_principles).forEach(pId => {
                const principle = GAME_DATA.constitutional_principles[pId];
                const defaultOption = principle.options?.[0];
                if (defaultOption) GAME_DATA.currentState.constitutional_principles_selected_options[pId] = defaultOption.id;
            });
        }
    }

    console.log("Структура GAME_DATA после загрузки и обработки состояния:", JSON.parse(JSON.stringify(GAME_DATA)));
    initializeUI();
}

const selectionSidePanel = document.getElementById('selectionSidePanel');
const sidePanelTitleEl = document.getElementById('sidePanelTitle');
const sidePanelOptionsContainer = document.getElementById('sidePanelOptionsContainer');
const closeSidePanelBtn_SP = document.getElementById('closeSidePanelBtn_SP');
let currentCategoryForSidePanel = null;
let clickedMainSlotElement = null;

function openSidePanelForCategory(slotType, clickedSlotEl) {
    currentCategoryForSidePanel = slotType;
    clickedMainSlotElement = clickedSlotEl;
    if(!sidePanelOptionsContainer || !sidePanelTitleEl || !selectionSidePanel) { console.error("Side panel elements not found!"); return; }
    sidePanelOptionsContainer.innerHTML = '';
    let optionsToShow = [];
    let panelTitle = "Выберите Опцию";
    const principleId = slotType.startsWith("constitutional_principle_") ? slotType.replace("constitutional_principle_", "") : null;
    const developmentAreaId = slotType.startsWith("development_area_") ? slotType.replace("development_area_", "") : null;
    let iconPreviewClass = 'generic-icon-preview';

    if (slotType.startsWith("advisor_")) {
        panelTitle = "Назначить Советника"; optionsToShow = Object.values(GAME_DATA.leaders || {}); iconPreviewClass = 'advisor-icon-preview';
    } else if (principleId && GAME_DATA.constitutional_principles[principleId]) {
        const principleData = GAME_DATA.constitutional_principles[principleId];
        panelTitle = principleData.name || "Конституционный Принцип"; optionsToShow = principleData.options || []; iconPreviewClass = 'principle-icon-preview';
    } else if (developmentAreaId && GAME_DATA.development_areas[developmentAreaId]) {
        const areaData = GAME_DATA.development_areas[developmentAreaId];
        panelTitle = areaData.name || "Область Развития"; optionsToShow = areaData.levels || []; iconPreviewClass = 'dev-area-icon-preview';
    } else if (slotType.startsWith("corporation_slot_")) {
        panelTitle = "Выбор Корпорации"; 
        optionsToShow = Object.values(GAME_DATA.corporations || {}).filter(c => typeof c === 'object' && c.id && c.name && c.icon_path); // Убедимся, что есть все нужные поля
        iconPreviewClass = 'corporation-icon-preview';
    }
    if(sidePanelTitleEl) sidePanelTitleEl.textContent = panelTitle;
    const activeOptionIdInMainSlot = clickedSlotEl.dataset.currentId;

    if (optionsToShow.length === 0) {sidePanelOptionsContainer.innerHTML = '<p style="text-align:center;color:#888;">Нет доступных опций.</p>';}
    else {
        optionsToShow.forEach(optionData => {
            const optionEl = document.createElement('div');
            optionEl.className = 'side-panel-option';
            if (optionData.id === activeOptionIdInMainSlot) optionEl.classList.add('active');
            optionEl.dataset.optionId = optionData.id;
            const iconEl = document.createElement('img');
            iconEl.className = 'side-panel-option-icon';
            iconEl.classList.add(iconPreviewClass);
            iconEl.src = optionData.icon_path || optionData.portrait_path || 'https://via.placeholder.com/40/ccc/000?text=N/A';
            iconEl.alt = optionData.name?.substring(0, 3) || "ICO";
            const nameEl = document.createElement('span');
            nameEl.className = 'side-panel-option-name';
            nameEl.textContent = optionData.name_display || optionData.name || "Безымянная Опция";
            optionEl.appendChild(iconEl); optionEl.appendChild(nameEl);
            optionEl.addEventListener('click', () => selectOptionInSidePanel(optionData.id, currentCategoryForSidePanel));
            addTooltipEventsToElement(optionEl, optionData.name_display || optionData.name, optionData.effects_summary || optionData.tooltip_summary, optionData.description);
            sidePanelOptionsContainer.appendChild(optionEl);
        });
    }
    if (selectionSidePanel) selectionSidePanel.style.display = 'flex';
}

function selectOptionInSidePanel(selectedOptionId, targetSlotType) {
    let chosenData = null;
    let parentCategoryData = null;
    const principleIdForState = targetSlotType.startsWith("constitutional_principle_") ? targetSlotType.replace("constitutional_principle_", "") : null;
    const developmentAreaIdForState = targetSlotType.startsWith("development_area_") ? targetSlotType.replace("development_area_", "") : null;

    if (targetSlotType.startsWith("advisor_")) {
        chosenData = GAME_DATA.leaders[selectedOptionId];
        if (GAME_DATA.currentState.advisors_selected) GAME_DATA.currentState.advisors_selected[targetSlotType] = selectedOptionId;
    } else if (principleIdForState) {
        parentCategoryData = GAME_DATA.constitutional_principles[principleIdForState];
        chosenData = parentCategoryData?.options?.find(opt => opt.id === selectedOptionId);
        if (GAME_DATA.currentState.constitutional_principles_selected_options) GAME_DATA.currentState.constitutional_principles_selected_options[principleIdForState] = selectedOptionId;
    } else if (developmentAreaIdForState) {
        parentCategoryData = GAME_DATA.development_areas[developmentAreaIdForState];
        chosenData = parentCategoryData?.levels?.find(lvl => lvl.id === selectedOptionId);
        if (GAME_DATA.currentState.development_areas_state && GAME_DATA.currentState.development_areas_state[developmentAreaIdForState]) {
            GAME_DATA.currentState.development_areas_state[developmentAreaIdForState].current_level_id = selectedOptionId;
            // if (chosenData) GAME_DATA.currentState.development_areas_state[developmentAreaIdForState].current_progress = 0; 
        }
    } else if (targetSlotType.startsWith("corporation_slot_")) {
        chosenData = GAME_DATA.corporations[selectedOptionId];
        if (GAME_DATA.currentState.corporations_selected) GAME_DATA.currentState.corporations_selected[targetSlotType] = selectedOptionId;
    }

    if (!chosenData || !clickedMainSlotElement) { console.error("Не найдены данные или слот для выбора", chosenData, clickedMainSlotElement); return; }
    clickedMainSlotElement.dataset.currentId = chosenData.id;
    const mainSlotImg = clickedMainSlotElement.querySelector('img');
    const mainSlotLabel = clickedMainSlotElement.querySelector('.item-slot-label-small');
    const categoryTitleForTooltip = clickedMainSlotElement.dataset.slotTitle || parentCategoryData?.name;
    let imgSrc = chosenData.icon_path || chosenData.portrait_path;
    
    if (principleIdForState && parentCategoryData?.icon_path && clickedMainSlotElement.classList.contains('constitutional-principle')) {
         imgSrc = parentCategoryData.icon_path;
    }
    // Для development_area иконка уровня уже в chosenData.icon_path и будет использована.

    if (mainSlotImg) {
      mainSlotImg.src = imgSrc || 'https://via.placeholder.com/132x132/3a3a3a/666?text=?'; // Общий плейсхолдер
      mainSlotImg.alt = chosenData.name?.substring(0, 3) || "ICO";
    }

    let labelTextContent = chosenData.name_display || chosenData.name || "";
    let tooltipNameForSlot = chosenData.name_display || chosenData.name || "";
    let tooltipEffectsForSlot = chosenData.tooltip_summary || chosenData.effects_summary || "";
    let tooltipDescriptionForSlot = chosenData.description || "";

    if (developmentAreaIdForState && parentCategoryData && GAME_DATA.currentState.development_areas_state?.[developmentAreaIdForState]) {
        const areaState = GAME_DATA.currentState.development_areas_state[developmentAreaIdForState];
        const currentProgress = areaState.current_progress;
        const progressPerLevel = GAME_DATA.development_areas[developmentAreaIdForState]?.progress_per_level || 100;
        labelTextContent = `${chosenData.name_display || "Уровень"}<br><span class="progress-text">${currentProgress}/${progressPerLevel}</span>`;
        tooltipEffectsForSlot = `Прогресс: ${currentProgress}/${progressPerLevel}`;
        if (chosenData.effects_summary) tooltipEffectsForSlot += (tooltipEffectsForSlot ? "\n" : "") + chosenData.effects_summary;
        const wrapper = clickedMainSlotElement.closest('.development-area-wrapper');
        if (wrapper) {
            const barTextEl = wrapper.querySelector('.dev-progress-bar-text');
            const barFillEl = wrapper.querySelector('.dev-progress-bar-fill');
            if (barTextEl) barTextEl.textContent = `${currentProgress}/${progressPerLevel}`;
            if (barFillEl) { const percentage = (currentProgress / progressPerLevel) * 100; barFillEl.style.width = `${Math.min(100, Math.max(0, percentage))}%`;}
        }
    }
    
    if (mainSlotLabel) mainSlotLabel.innerHTML = labelTextContent;
    addTooltipEventsToElement(clickedMainSlotElement, tooltipNameForSlot, tooltipEffectsForSlot, tooltipDescriptionForSlot, categoryTitleForTooltip);
    clickedMainSlotElement.classList.add('selected');
    if(sidePanelOptionsContainer) { sidePanelOptionsContainer.querySelectorAll('.side-panel-option').forEach(optEl => { optEl.classList.remove('active'); if (optEl.dataset.optionId === selectedOptionId) optEl.classList.add('active'); });}
}
if(closeSidePanelBtn_SP) closeSidePanelBtn_SP.onclick = () => { if(selectionSidePanel) selectionSidePanel.style.display = 'none'; };

function drawPoliticalPieChart() {
    const canvas = document.getElementById('partyPieChartCanvas');
    const pieChartContainer = document.getElementById('politicalPieChart');
    if (!canvas) { if(pieChartContainer) pieChartContainer.innerHTML = "<p style='font-size:0.8em;text-align:center;color:#888;'>Canvas не найден</p>"; console.error("Canvas не найден!"); return; }
    if (!GAME_DATA.parties_array || GAME_DATA.parties_array.length === 0) { if(pieChartContainer && !pieChartContainer.querySelector('p')) pieChartContainer.innerHTML = "<p style='font-size:0.8em;text-align:center;color:#888;'>Нет данных о партиях</p>"; return; }
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2; const centerY = canvas.height / 2; const radius = Math.min(centerX, centerY) - 1;
    const parties = GAME_DATA.parties_array.filter(p => p.popularity > 0);
    const totalPopularity = parties.reduce((sum, party) => sum + party.popularity, 0);
    if (totalPopularity === 0) { if(pieChartContainer && !pieChartContainer.querySelector('p')) pieChartContainer.innerHTML = "<p style='font-size:0.8em;text-align:center;color:#888;'>Нет популярности</p>"; return; }
    const existingMessage = pieChartContainer.querySelector('p');
    if (existingMessage) pieChartContainer.removeChild(existingMessage);
    if (!pieChartContainer.contains(canvas) && canvas) pieChartContainer.appendChild(canvas);
    let currentAngle = -0.5 * Math.PI; ctx.clearRect(0, 0, canvas.width, canvas.height); const sectors = [];
    parties.forEach(party => {
        const sliceAngle = (party.popularity / totalPopularity) * 2 * Math.PI; const endAngle = currentAngle + sliceAngle;
        ctx.beginPath(); ctx.moveTo(centerX, centerY); ctx.arc(centerX, centerY, radius, currentAngle, endAngle); ctx.closePath();
        ctx.fillStyle = party.color || '#cccccc'; ctx.fill();
        ctx.strokeStyle = '#3c3c3c'; ctx.lineWidth = 1; ctx.stroke();
        sectors.push({ partyName: party.name, popularity: party.popularity, startAngle: currentAngle, endAngle: endAngle });
        currentAngle = endAngle;
    });
    if(canvas._handleMouseMove) canvas.removeEventListener('mousemove', canvas._handleMouseMove); 
    const boundHandleMouseMove = (event) => handlePieChartMouseMove(event, canvas, sectors, centerX, centerY, radius);
    canvas._handleMouseMove = boundHandleMouseMove;
    canvas.addEventListener('mousemove', boundHandleMouseMove);
    canvas.removeEventListener('mouseleave', handlePieChartMouseLeave);
    canvas.addEventListener('mouseleave', handlePieChartMouseLeave);
}
function handlePieChartMouseMove(event, canvas, sectors, centerX, centerY, radius) {
    if(!tooltipElement) return; const rect = canvas.getBoundingClientRect(); const mouseX = event.clientX - rect.left; const mouseY = event.clientY - rect.top;
    const dx = mouseX - centerX; const dy = mouseY - centerY; const distance = Math.sqrt(dx * dx + dy * dy); let foundSector = false;
    if (distance <= radius) {
        let angle = Math.atan2(dy, dx); if (angle < -Math.PI / 2) angle += 2 * Math.PI; 
        for (const sector of sectors) {
            let inSector = false;
            if (sector.startAngle <= sector.endAngle) { if (angle >= sector.startAngle && angle < sector.endAngle) inSector = true; } 
            else { if (angle >= sector.startAngle || angle < sector.endAngle) inSector = true; }
            if (inSector) {
                tooltipElement.innerHTML = `<strong>${sector.partyName}</strong><hr>${sector.popularity}%`;
                tooltipElement.style.display = 'block'; positionTooltip(event); foundSector = true; return;
            }
        }
    }
    if (!foundSector) tooltipElement.style.display = 'none';
}
function handlePieChartMouseLeave() { if (tooltipElement) tooltipElement.style.display = 'none'; }
function updatePartyList() {
    const partyListContainer = document.getElementById('partyListContainer');
    if (!partyListContainer) { console.error("Контейнер списка партий не найден!"); return; }
    if (!GAME_DATA.parties_array || GAME_DATA.parties_array.length === 0) { partyListContainer.innerHTML = "<li>Нет данных о партиях</li>"; return; }
    const rulingPartyIdFromState = GAME_DATA.currentState?.ruling_party_id || "united_russia"; // Из состояния или дефолт
    const sortedParties = [...GAME_DATA.parties_array].filter(p => p.popularity > 0 || p.id === rulingPartyIdFromState).sort((a, b) => b.popularity - a.popularity);
    partyListContainer.innerHTML = '';
    sortedParties.forEach(party => {
        const listItem = document.createElement('li'); if (party.id === rulingPartyIdFromState) listItem.classList.add('highlighted');
        const colorBox = document.createElement('div'); colorBox.className = 'party-color-box'; colorBox.style.backgroundColor = party.color || '#cccccc';
        const partyNameSpan = document.createElement('span'); partyNameSpan.textContent = ` ${party.name} (${party.popularity}%)`;
        listItem.appendChild(colorBox); listItem.appendChild(partyNameSpan);
        let effectsForTooltip = `Популярность: ${party.popularity}%`; if (party.ideology_tags_rus?.length) effectsForTooltip += `\nИдеологии: ${party.ideology_tags_rus.join(', ')}`;
        addTooltipEventsToElement(listItem, party.name, effectsForTooltip, party.short_description);
        partyListContainer.appendChild(listItem);
    });
}

function initializeUI() {
    const cs = GAME_DATA.currentState || {};

    const leaderPortraitEl = document.querySelector('.leader-pane .leader-portrait img');
    const leaderNameEl = document.querySelector('.leader-pane .leader-name');
    const leaderIdToDisplay = cs.display_leader_id || "putin_vladimir"; 
    const leaderData = GAME_DATA.leaders?.[leaderIdToDisplay];
    if (leaderData && leaderPortraitEl && leaderNameEl) {
        leaderPortraitEl.src = leaderData.portrait_path || 'https://via.placeholder.com/156x210/555/fff?text=Ldr';
        leaderNameEl.textContent = leaderData.name || "Неизвестный Лидер";
        addTooltipEventsToElement(leaderPortraitEl.parentElement, leaderData.name, leaderData.tooltip_summary, leaderData.description);
    } else {
        if (leaderNameEl) leaderNameEl.textContent = "Лидер не выбран";
        if (leaderPortraitEl) leaderPortraitEl.src = 'https://via.placeholder.com/156x210/3a3a3a/666?text=?';
    }

    const ideologyIdToDisplay = cs.display_ideology_id || "sovereign_democracy";
    const ideologyData = GAME_DATA.ideologies?.[ideologyIdToDisplay];
    const ideologyIconContainer = document.querySelector('.ideology-info .ideology-icon'); 
    const ideologyIconEl = ideologyIconContainer?.querySelector('img');
    const ideologyNameEl = document.querySelector('.ideology-info .ideology-name');
    if (ideologyData && ideologyIconEl && ideologyNameEl && ideologyIconContainer) {
        ideologyIconEl.src = ideologyData.icon_path || 'https://via.placeholder.com/65x65/555/fff?text=IDL';
        ideologyNameEl.innerHTML = ideologyData.name_multiline || ideologyData.name || "Идеология";
        addTooltipEventsToElement(ideologyIconContainer, ideologyData.name, ideologyData.effects_summary, ideologyData.description);
    } else {
        if(ideologyNameEl) ideologyNameEl.innerHTML = "Идеология<br>не задана";
        if(ideologyIconEl) ideologyIconEl.src = 'https://via.placeholder.com/65x65/3a3a3a/666?text=?';
    }
    
    const rulingPartyInfoStrongEl = document.querySelector('.ruling-party-info strong');
    const rulingPartyId = cs.ruling_party_id || "united_russia";
    const partyDataForEmblem = GAME_DATA.parties?.[rulingPartyId];
    if(rulingPartyInfoStrongEl && partyDataForEmblem) rulingPartyInfoStrongEl.textContent = partyDataForEmblem.name;
    else if (rulingPartyInfoStrongEl) rulingPartyInfoStrongEl.textContent = "Партия не определена";
    
    const partyEmblemContainer = document.querySelector('.party-emblem'); 
    const partyEmblemEl = partyEmblemContainer?.querySelector('img');
    if (partyDataForEmblem && partyEmblemEl && partyEmblemContainer) {
        partyEmblemEl.src = partyDataForEmblem.icon_path || 'https://via.placeholder.com/65x65/555/fff?text=Pty';
        let partyEffectsSummary = `Популярность: ${partyDataForEmblem.popularity}%\n`; if (partyDataForEmblem.ideology_tags_rus) partyEffectsSummary += `Идеологии: ${partyDataForEmblem.ideology_tags_rus.join(', ')}`;
        addTooltipEventsToElement(partyEmblemContainer, partyDataForEmblem.name, partyEffectsSummary, partyDataForEmblem.short_description);
    } else {
         if(partyEmblemEl) partyEmblemEl.src = 'https://via.placeholder.com/65x65/3a3a3a/666?text=?';
    }

    const mainFocusBannerImageEl = document.getElementById('mainFocusBannerImage');
    const mainFocusTitleEl = document.getElementById('mainFocusTitle'); 
    const activeFocusId = cs.active_national_focus_id || GAME_DATA.currentNationalFocus?.id; 
    const focusDataToDisplay = (GAME_DATA.currentNationalFocus?.id === activeFocusId) ? GAME_DATA.currentNationalFocus : null; 
    if (focusDataToDisplay && mainFocusBannerImageEl && mainFocusTitleEl) {
        mainFocusBannerImageEl.src = focusDataToDisplay.banner_image_path || 'https://via.placeholder.com/700x100/555/fff?text=Focus';
        mainFocusBannerImageEl.alt = focusDataToDisplay.title || "Национальный Фокус";
        mainFocusTitleEl.textContent = focusDataToDisplay.title || "Фокус не выбран";
    } else {
        if(mainFocusTitleEl) mainFocusTitleEl.textContent = "Фокус не загружен";
        if(mainFocusBannerImageEl) mainFocusBannerImageEl.src = 'https://via.placeholder.com/700x100/3a3a3a/666?text=?';
    }
    
    const nationalSpiritsContainer = document.querySelector('.national-spirits');
    if (nationalSpiritsContainer && GAME_DATA.national_spirits && cs.active_national_spirit_ids) {
        nationalSpiritsContainer.innerHTML = '';
        const activeSpiritIds = cs.active_national_spirit_ids;
        const totalDevelopmentImpulses = { education: 0, healthcare: 0, welfare: 0, agriculture: 0, industry: 0, internal_security: 0, military_might: 0, social_development: 0 };
        activeSpiritIds.forEach(spiritId => {
            const spiritData = GAME_DATA.national_spirits[spiritId];
            if (spiritData && !spiritData.is_aggregator) {
                const spiritEl = document.createElement('div'); spiritEl.className = 'spirit-icon';
                const imgEl = document.createElement('img'); imgEl.src = spiritData.icon_path || 'https://via.placeholder.com/90x90/777/000?text=NS';
                imgEl.alt = spiritData.name?.substring(0,2) || "NS"; spiritEl.appendChild(imgEl);
                addTooltipEventsToElement(spiritEl, spiritData.name, spiritData.effects_summary, spiritData.description);
                nationalSpiritsContainer.appendChild(spiritEl);
                if (spiritData.development_impulses) {
                    for (const areaKey in spiritData.development_impulses) {
                        if (totalDevelopmentImpulses.hasOwnProperty(areaKey)) totalDevelopmentImpulses[areaKey] += spiritData.development_impulses[areaKey];
                    }
                }
            } else if(!spiritData && spiritId !== "development_pace_aggregator") console.warn(`Нац. дух с ID '${spiritId}' не найден.`);
        });
        const aggregatorSpiritData = GAME_DATA.national_spirits["development_pace_aggregator"];
        if (aggregatorSpiritData && GAME_DATA.development_areas && Object.keys(GAME_DATA.development_areas).length > 0) { 
            let effectsForAggregator = "Суммарные импульсы к развитию:";
            Object.keys(totalDevelopmentImpulses).forEach(areaKey => {
                const areaData = GAME_DATA.development_areas[areaKey]; 
                const areaName = areaData?.name || areaKey.charAt(0).toUpperCase() + areaKey.slice(1).replace(/_/g, ' ');
                const impulseValue = totalDevelopmentImpulses[areaKey];
                effectsForAggregator += `\n  ${areaName}: ${impulseValue >= 0 ? '+' : ''}${impulseValue}`;
            });
            const spiritEl = document.createElement('div'); spiritEl.className = 'spirit-icon';
            const imgEl = document.createElement('img'); imgEl.src = aggregatorSpiritData.icon_path || 'https://via.placeholder.com/90x90/777/000?text=TP';
            imgEl.alt = aggregatorSpiritData.name?.substring(0,2) || "TP"; spiritEl.appendChild(imgEl);
            addTooltipEventsToElement(spiritEl, aggregatorSpiritData.name, effectsForAggregator, aggregatorSpiritData.description);
            nationalSpiritsContainer.appendChild(spiritEl);
        }
    }
    
    drawPoliticalPieChart(); 
    updatePartyList();
    
    if (balanceValueDisplay && cs?.balance_value !== undefined) { updateBalanceScale(cs.balance_value); }
    
    document.querySelectorAll('#government-advisors-container .advisor-portrait-slot').forEach(slotEl => {
        const slotType = slotEl.dataset.slotType;
        const selectedAdvisorId = cs?.advisors_selected?.[slotType];
        const advisorData = selectedAdvisorId ? GAME_DATA.leaders[selectedAdvisorId] : null;
        const imgEl = slotEl.querySelector('img');
        if (advisorData && imgEl) {
            imgEl.src = advisorData.portrait_path || 'https://via.placeholder.com/156x234/333/666?text=LdrP';
            imgEl.alt = advisorData.name?.substring(0,3) || "Adv";
            slotEl.dataset.currentId = selectedAdvisorId; 
            slotEl.classList.add('selected');
            addTooltipEventsToElement(slotEl, advisorData.name_display || advisorData.name, advisorData.tooltip_summary, advisorData.description, slotEl.dataset.slotTitle);
        } else {
            if(imgEl) { imgEl.src = 'https://via.placeholder.com/156x234/3a3a3a/666?text=?'; imgEl.alt="?"; }
            slotEl.classList.remove('selected'); slotEl.removeAttribute('data-current-id');
            addTooltipEventsToElement(slotEl, null, "Слот пуст", "Выберите советника для этой должности.", slotEl.dataset.slotTitle || "Советник");
        }
        if(!slotEl.getAttribute('listenerAttached')) {
           slotEl.addEventListener('click', function() { openSidePanelForCategory(this.dataset.slotType, this); });
           slotEl.setAttribute('listenerAttached', 'true');
        }
    });

    document.querySelectorAll('#corporations-container .corporation-slot').forEach(slotEl => {
        const slotType = slotEl.dataset.slotType;
        const selectedCorpId = cs?.corporations_selected?.[slotType];
        const corpData = selectedCorpId ? GAME_DATA.corporations[selectedCorpId] : null;
        const imgEl = slotEl.querySelector('img');
        const labelEl = slotEl.querySelector('.item-slot-label-small');
        if (corpData && imgEl) {
            imgEl.src = corpData.icon_path || 'https://via.placeholder.com/132x132/333/666?text=CorpI';
            imgEl.alt = corpData.name?.substring(0,3) || "Corp";
            if(labelEl) labelEl.textContent = corpData.name_display || corpData.name;
            slotEl.dataset.currentId = selectedCorpId;
            slotEl.classList.add('selected');
            addTooltipEventsToElement(slotEl, corpData.name_display || corpData.name, corpData.effects_summary || corpData.tooltip_summary, corpData.description, slotEl.dataset.slotTitle);
        } else {
            if(imgEl) { imgEl.src = 'https://via.placeholder.com/132x132/3a3a3a/666?text=?'; imgEl.alt="?"; }
            if(labelEl) labelEl.textContent = "";
            slotEl.classList.remove('selected'); slotEl.removeAttribute('data-current-id');
            addTooltipEventsToElement(slotEl, null, "Слот пуст", "Выберите корпорацию.", slotEl.dataset.slotTitle || "Корпорация");
        }
         if(!slotEl.getAttribute('listenerAttached')) {
           slotEl.addEventListener('click', function() { openSidePanelForCategory(this.dataset.slotType, this); });
           slotEl.setAttribute('listenerAttached', 'true');
        }
    });

    const principlesContainer = document.getElementById('constitutional-principles-container');
    if (principlesContainer && GAME_DATA.constitutional_principles && cs?.constitutional_principles_selected_options) {
        principlesContainer.innerHTML = ''; 
        Object.entries(GAME_DATA.constitutional_principles).sort(([,a], [,b]) => (a.article_number || Infinity) - (b.article_number || Infinity))
            .forEach(([principleId, principleDef]) => {
                const selectedOptionId = cs.constitutional_principles_selected_options[principleId] || principleDef.options?.[0]?.id;
                const currentOptionData = principleDef.options?.find(opt => opt.id === selectedOptionId);
                
                if (currentOptionData) {
                    const slotEl = document.createElement('div'); 
                    slotEl.className = 'item-slot constitutional-principle';
                    slotEl.dataset.slotType = `constitutional_principle_${principleId}`; 
                    slotEl.dataset.currentId = selectedOptionId; 
                    const imgEl = document.createElement('img');
                    imgEl.src = principleDef.icon_path || 'https://via.placeholder.com/156x156/4a4a4a/fff?text=Prin'; 
                    slotEl.appendChild(imgEl);
                    const labelEl = document.createElement('span');
                    labelEl.className = 'item-slot-label-small';
                    labelEl.textContent = currentOptionData.name_display || currentOptionData.name; 
                    slotEl.appendChild(labelEl);
                    addTooltipEventsToElement(slotEl, currentOptionData.name_display || currentOptionData.name, null, currentOptionData.description, principleDef.name);
                    slotEl.addEventListener('click', function() { openSidePanelForCategory(this.dataset.slotType, this); });
                    principlesContainer.appendChild(slotEl);
                    if(selectedOptionId) slotEl.classList.add('selected');
                } else { console.warn(`Для принципа '${principleId}' не найдена опция с ID: ${selectedOptionId} или нет опций в определении.`); }
        });
    } else {
         if(principlesContainer) principlesContainer.innerHTML = "<p>Ошибка загрузки принципов или их состояния.</p>";
    }

    const developmentContainer = document.getElementById('development-areas-container');
    if (developmentContainer && GAME_DATA.development_areas && cs?.development_areas_state) {
        developmentContainer.innerHTML = '';
        Object.entries(GAME_DATA.development_areas).sort(([,a], [,b]) => (a.order || Infinity) - (b.order || Infinity))
            .forEach(([areaId, areaDef]) => {
                const areaState = cs.development_areas_state[areaId] || {};
                const currentLevelId = areaState.current_level_id || areaDef.levels?.[0]?.id;
                const currentProgress = areaState.current_progress ?? 0; 
                const progressPerLevel = areaDef.progress_per_level || 100;
                const currentLevelData = areaDef.levels?.find(lvl => lvl.id === currentLevelId);

                if (currentLevelData) {
                    const areaWrapperEl = document.createElement('div'); areaWrapperEl.className = 'development-area-wrapper';
                    const slotEl = document.createElement('div'); slotEl.className = 'item-slot development-area';
                    slotEl.dataset.slotType = `development_area_${areaId}`; slotEl.dataset.currentId = currentLevelId; 
                    const imgEl = document.createElement('img');
                    imgEl.src = currentLevelData.icon_path || 'https://via.placeholder.com/132x198/4a4a4a/fff?text=DevLvl';
                    imgEl.alt = currentLevelData.name_display?.substring(0,3) || areaDef.name?.substring(0,3) || "Dev";
                    slotEl.appendChild(imgEl);
                    const labelEl = document.createElement('span'); labelEl.className = 'item-slot-label-small';
                    labelEl.innerHTML = `${currentLevelData.name_display || "Уровень"}<br><span class="progress-text">${currentProgress}/${progressPerLevel}</span>`;
                    slotEl.appendChild(labelEl);
                    let tooltipEffectsSummary = `Прогресс: ${currentProgress}/${progressPerLevel}`;
                    if(currentLevelData.effects_summary) tooltipEffectsSummary += `\n${currentLevelData.effects_summary}`;
                    // В тултипе для областей развития не нужно дублировать описание уровня, оно уже есть в названии и эффектах.
                    // Если есть specific description у уровня, оно пойдет в fullDescription.
                    addTooltipEventsToElement(slotEl, currentLevelData.name_display || "Уровень", tooltipEffectsSummary, currentLevelData.description, areaDef.name);
                    slotEl.addEventListener('click', function() { openSidePanelForCategory(this.dataset.slotType, this); });
                    areaWrapperEl.appendChild(slotEl);
                    if(currentLevelId) slotEl.classList.add('selected');
                    const progressBarContainer = document.createElement('div'); progressBarContainer.className = 'dev-progress-bar-container';
                    const progressBarFill = document.createElement('div'); progressBarFill.className = 'dev-progress-bar-fill';
                    const progressPercentageVal = (currentProgress / progressPerLevel) * 100;
                    progressBarFill.style.width = `${Math.min(100, Math.max(0, progressPercentageVal))}%`;
                    progressBarContainer.appendChild(progressBarFill);
                    const progressTextOverlay = document.createElement('span'); progressTextOverlay.className = 'dev-progress-bar-text';
                    progressTextOverlay.textContent = `${currentProgress}/${progressPerLevel}`;
                    progressBarContainer.appendChild(progressTextOverlay);
                    areaWrapperEl.appendChild(progressBarContainer);
                    developmentContainer.appendChild(areaWrapperEl);
                } else { console.warn(`Для области '${areaId}' не найден уровень с ID: '${currentLevelId}'.`);}
        });
    } else {
        if(developmentContainer) developmentContainer.innerHTML = "<p>Ошибка загрузки областей развития или их состояния.</p>";
    }

    document.querySelectorAll('.national-focus-banner, .pie-chart').forEach(el => {
        if(el.dataset.tooltip && !el.getAttribute('listenerAttached')) {
             addTooltipEventsToElement(el, el.dataset.tooltip, null, null);
             el.setAttribute('listenerAttached', 'true');
        }
    });
}

const nationalFocusModal = document.getElementById('nationalFocusModal');
const closeFocusModalBtn_NF = document.getElementById('closeFocusModalBtn');
const nationalFocusBannerClickable = document.getElementById('nationalFocusBannerClickable');
const focusModalTitle = document.getElementById('focusModalTitle');
const focusModalImage = document.getElementById('focusModalImage');
const focusModalDescription = document.getElementById('focusModalDescription');
const focusModalProjectsContainer = document.getElementById('focusModalProjectsContainer'); 

if (nationalFocusBannerClickable) {
    nationalFocusBannerClickable.addEventListener('click', () => {
        const activeFocusIdFromState = GAME_DATA.currentState?.active_national_focus_id;
        const focusData = (GAME_DATA.currentNationalFocus?.id === activeFocusIdFromState) ? GAME_DATA.currentNationalFocus : null;
        
        if (nationalFocusModal && focusModalTitle && focusModalImage && focusModalDescription && focusModalProjectsContainer && focusData) {
            focusModalTitle.textContent = focusData.title || "Национальный Фокус";
            focusModalImage.src = focusData.modal_full_image_path || "https://via.placeholder.com/700x400/222/fff?text=FocusArt";
            focusModalImage.alt = focusData.title || "Национальный фокус";
            focusModalDescription.textContent = focusData.description || "Описание не предоставлено.";
            focusModalProjectsContainer.innerHTML = ''; 
            if (focusData.projects && focusData.projects.length > 0) {
                focusData.projects.forEach(project => { 
                    const projectItemEl = document.createElement('div'); projectItemEl.className = 'focus-project-item';
                    const iconWrapperEl = document.createElement('div'); iconWrapperEl.className = 'focus-project-icon';
                    const iconEl = document.createElement('img'); iconEl.src = project.icon_path || 'https://via.placeholder.com/90/777/fff?text=P'; 
                    iconEl.alt = project.name?.substring(0,3) || "Proj"; iconWrapperEl.appendChild(iconEl);
                    const progressBarContainerEl = document.createElement('div'); progressBarContainerEl.className = 'focus-project-progress-bar-container';
                    const progressBarFillEl = document.createElement('div'); progressBarFillEl.className = 'focus-project-progress-bar-fill';
                    const progressPercentage = (project.current_progress / project.max_progress) * 100;
                    progressBarFillEl.style.width = `${Math.min(100, Math.max(0, progressPercentage))}%`;
                    const progressTextEl = document.createElement('span'); progressTextEl.className = 'focus-project-progress-bar-text';
                    progressTextEl.textContent = `${project.current_progress}/${project.max_progress}`;
                    progressBarContainerEl.appendChild(progressBarFillEl); progressBarContainerEl.appendChild(progressTextEl); 
                    projectItemEl.appendChild(iconWrapperEl); projectItemEl.appendChild(progressBarContainerEl);
                    addTooltipEventsToElement(projectItemEl, project.name, project.tooltip_summary, project.tooltip_description);
                    focusModalProjectsContainer.appendChild(projectItemEl);
                });
            } else { focusModalProjectsContainer.innerHTML = '<p style="text-align:center;color:#888;width:100%; margin: 10px 0;">Нет активных проектов.</p>';}
            nationalFocusModal.style.display = 'flex';
        } else {  console.error("Элементы модального окна нац. фокуса или данные фокуса не найдены для ID:", activeFocusIdFromState); }
    });
}
if (closeFocusModalBtn_NF) closeFocusModalBtn_NF.onclick = () => { if (nationalFocusModal) nationalFocusModal.style.display = 'none'; }

window.addEventListener('click', function(event) {
    if (event.target == nationalFocusModal && nationalFocusModal) nationalFocusModal.style.display = 'none';
    if (event.target == balanceModal && balanceModal) balanceModal.style.display = 'none';
    if (selectionSidePanel && selectionSidePanel.style.display === 'flex' && 
        !selectionSidePanel.contains(event.target) && 
        clickedMainSlotElement && !clickedMainSlotElement.contains(event.target) &&
        event.target !== clickedMainSlotElement && !isDescendant(clickedMainSlotElement, event.target) &&
        event.target !== balanceButton && !balanceButton.contains(event.target) && /* Исключаем кнопку Баланс */
        event.target !== nationalFocusBannerClickable && !nationalFocusBannerClickable.contains(event.target) /* Исключаем баннер фокуса */
        ) {
        let isClickOnTriggerForSidePanel = false;
        document.querySelectorAll('.advisor-portrait-slot, .corporation-slot, .constitutional-principle, .development-area').forEach(trigger => {
             if (trigger.contains(event.target) || trigger === event.target) {
                isClickOnTriggerForSidePanel = true;
            }
        });
        if (!isClickOnTriggerForSidePanel) {
            selectionSidePanel.style.display = 'none';
        }
    }
});

function isDescendant(parent, child) { 
    let node = child.parentNode; 
    while (node != null) { 
        if (node == parent) return true; 
        node = node.parentNode; 
    } 
    return false; 
}

document.addEventListener('DOMContentLoaded', () => {
    tooltipElement = document.querySelector('.tooltip'); 
    if (!tooltipElement) console.error("Элемент .tooltip не найден в DOM!");
    initializeGameData();
    const saveButton = document.getElementById('saveChangesButton');
    if (saveButton) saveButton.addEventListener('click', handleSaveChanges);
    else console.error("Кнопка сохранения не найдена!");
});