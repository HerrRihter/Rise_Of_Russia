// script.js

// --- Global tooltip element ---
const tooltipElement = document.querySelector('.tooltip');

// --- Tooltip Functions ---
function positionTooltip(event) {
    if (tooltipElement && tooltipElement.style.display === 'block') {
        let x = event.clientX + 15;
        let y = event.clientY + 15;
        const screenPadding = 10;

        if (x + tooltipElement.offsetWidth + screenPadding > window.innerWidth) {
            x = event.clientX - tooltipElement.offsetWidth - 15;
        }
        if (x < screenPadding) x = screenPadding;

        if (y + tooltipElement.offsetHeight + screenPadding > window.innerHeight) {
            y = event.clientY - tooltipElement.offsetHeight - 15;
        }
        if (y < screenPadding) y = screenPadding;

        tooltipElement.style.left = x + 'px';
        tooltipElement.style.top = y + 'px';
    }
}

function addTooltipEventsToElement(element, name, effectsSummary, fullDescription = null, explicitSlotTitle = null) {
    if (!element) return;

    element.addEventListener('mouseenter', function(event) {
        let tooltipContent = "";
        const slotTitle = explicitSlotTitle || this.dataset.slotTitle;

        if (slotTitle) {
            tooltipContent += `<small style="color: #aaa; display: block; margin-bottom: 4px; font-style: italic;">${slotTitle}</small>`;
        }

        if (name) {
            if (tooltipContent && !tooltipContent.endsWith("</small>")) tooltipContent += "<hr style='margin-top:4px; margin-bottom:4px; border-color:#444;'>";
            else if (tooltipContent) tooltipContent += "<hr style='margin-top:4px; margin-bottom:4px; border-color:#444;'>";
            tooltipContent += `<strong>${name}</strong>`;
        }
        
        if (effectsSummary) {
            if (tooltipContent && !tooltipContent.endsWith("</strong>") && !(tooltipContent.endsWith("</small>") && !name) ) {
                 tooltipContent += "<hr style='margin-top:4px; margin-bottom:4px; border-color:#444;'>";
            } else if (!tooltipContent && effectsSummary) {
                // No hr
            } else if (tooltipContent && !name && slotTitle){
                 tooltipContent += "<hr style='margin-top:4px; margin-bottom:4px; border-color:#444;'>";
            }
            tooltipContent += effectsSummary.replace(/\n/g, '<br>');
        }

        if (fullDescription) {
            if (tooltipContent && !tooltipContent.endsWith("<br>") && !tooltipContent.endsWith("</strong>") && !tooltipContent.endsWith("</small>")) tooltipContent += "<hr style='margin-top:4px; margin-bottom:4px; border-color:#444;'>";
             else if (tooltipContent && (tooltipContent.endsWith("<br>") || tooltipContent.endsWith("</strong>") || tooltipContent.endsWith("</small>"))) {
                 tooltipContent += "<hr style='margin-top:4px; margin-bottom:4px; border-color:#444;'>";
             }
            tooltipContent += "<small>" + fullDescription.replace(/\n/g, '<br>') + "</small>";
        }
        
        if (!name && slotTitle && !effectsSummary && !fullDescription && element.dataset.slotType && 
            !element.dataset.slotType.startsWith("constitutional_principle_") && 
            !element.dataset.slotType.startsWith("development_area_") &&
            !element.dataset.slotType.includes("_display")) { 
            if (tooltipContent && !tooltipContent.endsWith("</small>")) {
                 tooltipContent += "<hr style='margin-top:4px; margin-bottom:4px; border-color:#444;'>";
            }
            tooltipContent += "<strong>Назначить / Выбрать</strong>";
        } else if (!name && !slotTitle && !effectsSummary && !fullDescription) {
            const staticTooltipText = this.dataset.tooltip;
            if (staticTooltipText) {
                tooltipContent = staticTooltipText.replace(/\n/g, '<br>');
            }
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
    element.addEventListener('mouseleave', function() {
        if (tooltipElement) tooltipElement.style.display = 'none';
    });
}

// --- Balance Modal Logic ---
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
}
if (balanceButton) balanceButton.onclick = () => { if(balanceModal) balanceModal.style.display = 'flex'; updateBalanceScale(parseInt(balanceValueDisplay?.textContent || '0')); };
if (closeBalanceModalBtn_Balance) closeBalanceModalBtn_Balance.onclick = () => { if(balanceModal) balanceModal.style.display = 'none'; };

// --- Game Data Loading and Management ---
const GAME_DATA = { 
    leaders: {}, 
    constitutional_principles: {}, 
    development_areas: {}, 
    corporations: {}, 
    ideologies: {}, 
    parties: {}, 
    national_spirits: {},
    currentNationalFocus: null 
};
const ALL_DATA_FILES_TO_LOAD = [
    "history/leaders.json",
    "history/constitutional_principles.json",
    "history/development_areas.json",
    "history/corporations.json",
    "history/ideologies.json",
    "history/parties.json",
    "history/national_spirits.json",
    "history/national_focus_data.json"
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
        if (!data) return;

        if (filePath.endsWith('leaders.json') && data.options) { GAME_DATA.leaders = {}; data.options.forEach(l => { if(l.id) GAME_DATA.leaders[l.id] = l;}); }
        else if (filePath.endsWith('constitutional_principles.json') && data.principles) { GAME_DATA.constitutional_principles = {}; data.principles.forEach(p => {if(p.id)GAME_DATA.constitutional_principles[p.id] = p;}); }
        else if (filePath.endsWith('development_areas.json') && data.areas) { GAME_DATA.development_areas = {}; data.areas.forEach(a => {if(a.id)GAME_DATA.development_areas[a.id] = a;}); }
        else if (filePath.endsWith('corporations.json') && data.options) { GAME_DATA.corporations = {}; data.options.forEach(c => {if(c.id)GAME_DATA.corporations[c.id] = c;}); }
        else if (filePath.endsWith('ideologies.json')) {
            if (data.options) { GAME_DATA.ideologies = {}; data.options.forEach(i => {if(i.id)GAME_DATA.ideologies[i.id] = i;}); }
            else if (data.id) { GAME_DATA.ideologies = { [data.id]: data }; }
        }
        else if (filePath.endsWith('parties.json') && data.options) { GAME_DATA.parties_array = data.options; GAME_DATA.parties = {}; data.options.forEach(p => {if(p.id)GAME_DATA.parties[p.id] = p;}); }
        else if (filePath.endsWith('national_spirits.json') && data.options) { GAME_DATA.national_spirits = {}; data.options.forEach(s => {if(s.id)GAME_DATA.national_spirits[s.id] = s;}); }
        else if (filePath.endsWith('national_focus_data.json') && data.current_focus) { 
            GAME_DATA.currentNationalFocus = data.current_focus;
        }
    });
    await Promise.all(loadPromises);
    console.log("Игровые данные загружены:", GAME_DATA);
    initializeUI();
}

// --- Side Panel Logic ---
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

    if (slotType.startsWith("advisor_")) {
        panelTitle = "Назначить Советника"; optionsToShow = Object.values(GAME_DATA.leaders || {});
    } else if (principleId && GAME_DATA.constitutional_principles[principleId]) {
        const principleData = GAME_DATA.constitutional_principles[principleId];
        panelTitle = principleData.name || "Конституционный Принцип";
        optionsToShow = principleData.options || [];
    } else if (developmentAreaId && GAME_DATA.development_areas[developmentAreaId]) {
        const areaData = GAME_DATA.development_areas[developmentAreaId];
        panelTitle = areaData.name || "Область Развития";
        optionsToShow = areaData.levels || [];
    } else if (slotType.startsWith("corporation_slot_")) {
        const corpCategoryData = GAME_DATA.corporations;
        panelTitle = corpCategoryData?.title_overall || "Выбор Корпорации";
        optionsToShow = Object.values(corpCategoryData || {}).filter(c => typeof c === 'object' && c.id);
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
            iconEl.src = optionData.icon_path || optionData.portrait_path || 'https://via.placeholder.com/40/ccc/000?text=N/A';
            iconEl.alt = optionData.name?.substring(0, 3) || "ICO";

            const nameEl = document.createElement('span');
            nameEl.className = 'side-panel-option-name';
            nameEl.textContent = optionData.name_display || optionData.name || "Безымянная Опция";

            optionEl.appendChild(iconEl);
            optionEl.appendChild(nameEl);

            optionEl.addEventListener('click', () => selectOptionInSidePanel(optionData.id, currentCategoryForSidePanel));
            addTooltipEventsToElement(optionEl, optionData.name_display || optionData.name, optionData.effects_summary, optionData.description);
            sidePanelOptionsContainer.appendChild(optionEl);
        });
    }
    if (selectionSidePanel) selectionSidePanel.style.display = 'flex';
}

function selectOptionInSidePanel(selectedOptionId, targetSlotType) {
    let chosenData = null;
    let parentCategoryData = null;

    const principleId = targetSlotType.startsWith("constitutional_principle_") ? targetSlotType.replace("constitutional_principle_", "") : null;
    const developmentAreaId = targetSlotType.startsWith("development_area_") ? targetSlotType.replace("development_area_", "") : null;

    if (targetSlotType.startsWith("advisor_") && GAME_DATA.leaders) {
        chosenData = GAME_DATA.leaders[selectedOptionId];
    } else if (principleId && GAME_DATA.constitutional_principles[principleId]) {
        parentCategoryData = GAME_DATA.constitutional_principles[principleId];
        parentCategoryData.options?.forEach(opt => opt.is_current = (opt.id === selectedOptionId));
        chosenData = parentCategoryData.options?.find(opt => opt.is_current);
    } else if (developmentAreaId && GAME_DATA.development_areas[developmentAreaId]) {
        parentCategoryData = GAME_DATA.development_areas[developmentAreaId];
        parentCategoryData.current_level_id = selectedOptionId;
        chosenData = parentCategoryData.levels?.find(lvl => lvl.id === selectedOptionId);
    } else if (targetSlotType.startsWith("corporation_slot_") && GAME_DATA.corporations) {
        chosenData = GAME_DATA.corporations[selectedOptionId];
    }

    if (!chosenData || !clickedMainSlotElement) { console.error("Data or slot missing for selection", selectedOptionId, targetSlotType); return; }

    clickedMainSlotElement.dataset.currentId = chosenData.id;
    const mainSlotImg = clickedMainSlotElement.querySelector('img');
    const mainSlotLabel = clickedMainSlotElement.querySelector('.item-slot-label-small');
    const categoryTitleForTooltip = parentCategoryData?.name || clickedMainSlotElement.dataset.slotTitle;

    if (mainSlotImg) {
        mainSlotImg.src = parentCategoryData?.icon_path || chosenData.icon_path || chosenData.portrait_path || 'https://via.placeholder.com/80/ccc/000?text=N/A';
        mainSlotImg.alt = parentCategoryData?.name?.substring(0, 3) || chosenData.name?.substring(0, 3) || "ICO";
    }

    let labelTextContent = chosenData.name_display || chosenData.name;
    let tooltipNameForSlot = chosenData.name_display || chosenData.name;
    let tooltipEffectsForSlot = null;
    let tooltipDescriptionForSlot = chosenData.description;

    if (developmentAreaId && parentCategoryData && typeof parentCategoryData.current_progress !== 'undefined') {
        labelTextContent = `${chosenData.name_display}<br><span class="progress-text">${parentCategoryData.current_progress}/${parentCategoryData.progress_per_level}</span>`;
        tooltipEffectsForSlot = `Прогресс: ${parentCategoryData.current_progress}/${parentCategoryData.progress_per_level}`;
    } else if (principleId && parentCategoryData) {
        tooltipEffectsForSlot = null; 
        tooltipDescriptionForSlot = chosenData.description;
    } else {
        tooltipEffectsForSlot = chosenData.tooltip_summary || chosenData.effects_summary;
        tooltipDescriptionForSlot = chosenData.description; 
    }

    if (mainSlotLabel) mainSlotLabel.innerHTML = labelTextContent;

    addTooltipEventsToElement(clickedMainSlotElement, tooltipNameForSlot, tooltipEffectsForSlot, tooltipDescriptionForSlot, categoryTitleForTooltip);
    clickedMainSlotElement.classList.add('selected');

    if(sidePanelOptionsContainer) {
      sidePanelOptionsContainer.querySelectorAll('.side-panel-option').forEach(optEl => {
          optEl.classList.remove('active');
          if (optEl.dataset.optionId === selectedOptionId) optEl.classList.add('active');
      });
    }
}
if(closeSidePanelBtn_SP) closeSidePanelBtn_SP.onclick = () => { if(selectionSidePanel) selectionSidePanel.style.display = 'none'; };

// --- Party Politics UI ---
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
            if (sector.startAngle <= sector.endAngle) { 
                if (angle >= sector.startAngle && angle < sector.endAngle) inSector = true;
            } else { 
                if (angle >= sector.startAngle || angle < sector.endAngle) inSector = true;
            }
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
    const rulingPartyId = "united_russia"; const sortedParties = [...GAME_DATA.parties_array].filter(p => p.popularity > 0 || p.id === rulingPartyId).sort((a, b) => b.popularity - a.popularity);
    partyListContainer.innerHTML = '';
    sortedParties.forEach(party => {
        const listItem = document.createElement('li'); if (party.id === rulingPartyId) listItem.classList.add('highlighted');
        const colorBox = document.createElement('div'); colorBox.className = 'party-color-box'; colorBox.style.backgroundColor = party.color || '#cccccc';
        const partyNameSpan = document.createElement('span'); partyNameSpan.textContent = ` ${party.name} (${party.popularity}%)`;
        listItem.appendChild(colorBox); listItem.appendChild(partyNameSpan);
        let effectsForTooltip = `Популярность: ${party.popularity}%`; if (party.ideology_tags_rus?.length) effectsForTooltip += `\nИдеологии: ${party.ideology_tags_rus.join(', ')}`;
        addTooltipEventsToElement(listItem, party.name, effectsForTooltip, party.short_description);
        partyListContainer.appendChild(listItem);
    });
}

// --- UI Initialization Function ---
function initializeUI() {
    // Leader
    const countryLeaderId = "putin_vladimir"; const leaderData = GAME_DATA.leaders?.[countryLeaderId];
    const leaderPortraitEl = document.querySelector('.leader-pane .leader-portrait img'); const leaderNameEl = document.querySelector('.leader-pane .leader-name');
    if (leaderData && leaderPortraitEl && leaderNameEl) {
        leaderPortraitEl.src = leaderData.portrait_path || 'https://via.placeholder.com/180x210/555/fff?text=Ldr';
        leaderNameEl.textContent = leaderData.name || "Неизвестный Лидер";
        addTooltipEventsToElement(leaderPortraitEl.parentElement, leaderData.name, leaderData.tooltip_summary, leaderData.description);
    }

    // Ideology
    const currentIdeologyId = "sovereign_democracy"; const ideologyData = GAME_DATA.ideologies?.[currentIdeologyId];
    const ideologyIconContainer = document.querySelector('.ideology-info .ideology-icon'); const ideologyIconEl = ideologyIconContainer?.querySelector('img');
    const ideologyNameEl = document.querySelector('.ideology-info .ideology-name');
    if (ideologyData && ideologyIconEl && ideologyNameEl && ideologyIconContainer) {
        ideologyIconEl.src = ideologyData.icon_path || 'https://via.placeholder.com/45/666/fff?text=Idlgy';
        ideologyNameEl.innerHTML = ideologyData.name_multiline || ideologyData.name || "Неизв. Идеология";
        addTooltipEventsToElement(ideologyIconContainer, ideologyData.name, ideologyData.effects_summary, ideologyData.description);
        if(ideologyIconContainer.dataset.tooltip) ideologyIconContainer.removeAttribute('data-tooltip');
    }

    // Party Emblem
    const rulingPartyId = "united_russia"; const partyData = GAME_DATA.parties?.[rulingPartyId];
    const partyEmblemContainer = document.querySelector('.party-emblem'); const partyEmblemEl = partyEmblemContainer?.querySelector('img');
    if (partyData && partyEmblemEl && partyEmblemContainer) {
        partyEmblemEl.src = partyData.icon_path || 'https://via.placeholder.com/45/666/fff?text=Pty';
        let partyEffectsSummary = `Популярность: ${partyData.popularity}%\n`; if (partyData.ideology_tags_rus) partyEffectsSummary += `Идеологии: ${partyData.ideology_tags_rus.join(', ')}`;
        addTooltipEventsToElement(partyEmblemContainer, partyData.name, partyEffectsSummary, partyData.short_description);
        if(partyEmblemContainer.dataset.tooltip) partyEmblemContainer.removeAttribute('data-tooltip');
    }
    
    // National Focus Banner (Main Page)
    const mainFocusBannerImageEl = document.getElementById('mainFocusBannerImage');
    const mainFocusTitleEl = document.getElementById('mainFocusTitle'); 
    if (GAME_DATA.currentNationalFocus && mainFocusBannerImageEl && mainFocusTitleEl) {
        mainFocusBannerImageEl.src = GAME_DATA.currentNationalFocus.banner_image_path || 'https://via.placeholder.com/700x100/555/fff?text=Focus+Banner';
        mainFocusBannerImageEl.alt = GAME_DATA.currentNationalFocus.title || "Национальный Фокус";
        mainFocusTitleEl.textContent = GAME_DATA.currentNationalFocus.title || "Название Фокуса";
    }


    // National Spirits
    const nationalSpiritsContainer = document.querySelector('.national-spirits');
    if (nationalSpiritsContainer && GAME_DATA.national_spirits) {
        nationalSpiritsContainer.innerHTML = '';
        const activeSpiritIds = ["fortress_state", "near_abroad_policy","national_projects_infrastructure","reindustrialization_opk_tech_sovereignty","divided_society","systemic_corruption","oil_gas_rent_stabilization_fund","sovereign_economy","social_initiatives_family_support","russian_dream_culture_identity","soft_power_russia_abroad"];
        const totalDevelopmentImpulses = { education: 0, healthcare: 0, welfare: 0, agriculture: 0, industry: 0, internal_security: 0, military_might: 0, social_development: 0 };

        activeSpiritIds.forEach(spiritId => {
            const spiritData = GAME_DATA.national_spirits[spiritId];
            if (spiritData && !spiritData.is_aggregator) {
                const spiritEl = document.createElement('div'); spiritEl.className = 'spirit-icon';
                const imgEl = document.createElement('img'); imgEl.src = spiritData.icon_path || 'https://via.placeholder.com/56x56/777/000?text=NS';
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
        if (aggregatorSpiritData && GAME_DATA.development_areas) { 
            let effectsForAggregator = "Суммарные импульсы к развитию:";
            Object.keys(totalDevelopmentImpulses).forEach(areaKey => {
                const areaData = GAME_DATA.development_areas[areaKey];
                const areaName = areaData?.name || areaKey.charAt(0).toUpperCase() + areaKey.slice(1).replace(/_/g, ' ');
                const impulseValue = totalDevelopmentImpulses[areaKey];
                effectsForAggregator += `\n  ${areaName}: ${impulseValue >= 0 ? '+' : ''}${impulseValue}`;
            });
            const spiritEl = document.createElement('div'); spiritEl.className = 'spirit-icon';
            const imgEl = document.createElement('img'); imgEl.src = aggregatorSpiritData.icon_path || 'https://via.placeholder.com/56x56/777/000?text=TP';
            imgEl.alt = aggregatorSpiritData.name?.substring(0,2) || "TP"; spiritEl.appendChild(imgEl);
            addTooltipEventsToElement(spiritEl, aggregatorSpiritData.name, effectsForAggregator, aggregatorSpiritData.description);
            nationalSpiritsContainer.appendChild(spiritEl);
        }
    }

    // Political Parties
    drawPoliticalPieChart(); updatePartyList();
    const rulingPartyInfoStrongEl = document.querySelector('.ruling-party-info strong');
    if (rulingPartyInfoStrongEl && GAME_DATA.parties?.[rulingPartyId]) rulingPartyInfoStrongEl.textContent = GAME_DATA.parties[rulingPartyId].name;

    // Constitutional Principles
    const principlesContainer = document.getElementById('constitutional-principles-container');
    if (principlesContainer && GAME_DATA.constitutional_principles) {
        principlesContainer.innerHTML = '';
        Object.values(GAME_DATA.constitutional_principles).sort((a, b) => (a.article_number || Infinity) - (b.article_number || Infinity))
            .forEach(principle => {
                const currentOption = principle.options?.find(opt => opt.is_current) || (principle.options?.[0]);
                if (currentOption) {
                    const slotEl = document.createElement('div'); slotEl.className = 'item-slot constitutional-principle';
                    slotEl.dataset.slotType = `constitutional_principle_${principle.id}`; slotEl.dataset.currentId = currentOption.id;
                    const imgEl = document.createElement('img'); imgEl.src = principle.icon_path || 'https://via.placeholder.com/50x50/4a4a4a/fff?text=C'; slotEl.appendChild(imgEl);
                    const labelEl = document.createElement('span'); labelEl.className = 'item-slot-label-small'; labelEl.textContent = currentOption.name_display; slotEl.appendChild(labelEl);
                    addTooltipEventsToElement(slotEl, currentOption.name_display, null, currentOption.description, principle.name);
                    slotEl.addEventListener('click', function() { openSidePanelForCategory(this.dataset.slotType, this); });
                    principlesContainer.appendChild(slotEl);
                } else { console.warn(`Для принципа '${principle.id}' нет активной/единственной опции.`); }
        });
    }

    // Development Areas
    const developmentContainer = document.getElementById('development-areas-container');
    if (developmentContainer && GAME_DATA.development_areas) {
        developmentContainer.innerHTML = '';
        Object.values(GAME_DATA.development_areas).sort((a,b) => (a.order || Infinity) - (b.order || Infinity))
            .forEach(area => { 
                const currentLevelData = area.levels?.find(lvl => lvl.id === area.current_level_id); 

                if (currentLevelData) {
                    const areaWrapperEl = document.createElement('div');
                    areaWrapperEl.className = 'development-area-wrapper';

                    const slotEl = document.createElement('div');
                    slotEl.className = 'item-slot development-area';
                    slotEl.dataset.slotType = `development_area_${area.id}`;
                    slotEl.dataset.currentId = area.current_level_id; 

                    const imgEl = document.createElement('img');
                    imgEl.src = currentLevelData.icon_path || 'https://via.placeholder.com/50x50/4a4a4a/fff?text=LvlErr';
                    imgEl.alt = currentLevelData.name_display?.substring(0,3) || area.name?.substring(0,3) || "Dev";
                    slotEl.appendChild(imgEl);

                    const labelEl = document.createElement('span');
                    labelEl.className = 'item-slot-label-small';
                    labelEl.innerHTML = `${currentLevelData.name_display}<br><span class="progress-text">${area.current_progress}/${area.progress_per_level}</span>`;
                    slotEl.appendChild(labelEl);

                    const effectsForTooltip = `Прогресс: ${area.current_progress}/${area.progress_per_level}`;
                    addTooltipEventsToElement(slotEl, currentLevelData.name_display, effectsForTooltip, currentLevelData.description, area.name);
                    
                    slotEl.addEventListener('click', function() {
                         openSidePanelForCategory(this.dataset.slotType, this);
                    });
                    areaWrapperEl.appendChild(slotEl);

                    const progressBarContainer = document.createElement('div');
                    progressBarContainer.className = 'dev-progress-bar-container';
                    const progressBarFill = document.createElement('div');
                    progressBarFill.className = 'dev-progress-bar-fill';
                    const progressPercentage = (area.current_progress / area.progress_per_level) * 100;
                    progressBarFill.style.width = `${Math.min(100, Math.max(0, progressPercentage))}%`;
                    progressBarContainer.appendChild(progressBarFill);
                    const progressTextOverlay = document.createElement('span');
                    progressTextOverlay.className = 'dev-progress-bar-text';
                    progressTextOverlay.textContent = `${area.current_progress}/${area.progress_per_level}`;
                    progressBarContainer.appendChild(progressTextOverlay);
                    areaWrapperEl.appendChild(progressBarContainer);

                    developmentContainer.appendChild(areaWrapperEl);
                } else {
                     console.warn(`Для области развития '${area.id}' не найден активный уровень по ID: '${area.current_level_id}'. Проверьте массив 'levels' и ID в JSON.`);
                }
        });
    }

    // Pre-defined HTML slots (Advisors, Corporations)
    document.querySelectorAll('[data-slot-type]').forEach(slotEl => {
        const slotIdAttr = slotEl.id || "";
        if (slotIdAttr === 'constitutional-principles-container' || slotIdAttr === 'development-areas-container' ||
            slotEl.dataset.slotType === 'ideology_display' || slotEl.dataset.slotType === 'party_display' ||
            slotEl.classList.contains('constitutional-principle') || slotEl.classList.contains('development-area')) {
            return;
        }
        const slotType = slotEl.dataset.slotType; const currentItemId = slotEl.dataset.currentId; let currentItemData = null;
        const slotTitleFromHTML = slotEl.dataset.slotTitle || null;
        if (currentItemId && currentItemId.length > 0) {
            if (slotType.startsWith("advisor_")) currentItemData = GAME_DATA.leaders?.[currentItemId];
            else if (slotType.startsWith("corporation_slot_")) currentItemData = GAME_DATA.corporations?.[currentItemId];
        }
        const imgEl = slotEl.querySelector('img'); const labelEl = slotEl.querySelector('.item-slot-label-small');
        if (currentItemData && imgEl) {
            imgEl.src = currentItemData.icon_path || currentItemData.portrait_path || 'https://via.placeholder.com/80/ccc/000?text=N/A';
            imgEl.alt = currentItemData.name?.substring(0, 3) || "ICO";
            if(labelEl && slotEl.classList.contains('item-slot') && !slotEl.classList.contains('advisor-portrait-slot')) labelEl.textContent = currentItemData.name_display || currentItemData.name;
            slotEl.classList.add('selected');
            addTooltipEventsToElement(slotEl, currentItemData.name_display || currentItemData.name, currentItemData.tooltip_summary || currentItemData.effects_summary, currentItemData.description, slotTitleFromHTML);
        } else if (imgEl) {
            let emptyIconSrc = 'https://via.placeholder.com/50x50/333/666?text=+';
            if (slotEl.classList.contains('advisor-portrait-slot')) emptyIconSrc = 'https://via.placeholder.com/65x65/333/666?text=+';
            imgEl.src = emptyIconSrc; imgEl.alt = "+"; if(labelEl) labelEl.textContent = "";
            slotEl.classList.remove('selected');
            addTooltipEventsToElement(slotEl, null, null, null, slotTitleFromHTML);
        }
        if(!slotType.includes("_display") && !slotEl.getAttribute('listenerAttached')) {
           slotEl.addEventListener('click', function() { openSidePanelForCategory(this.dataset.slotType, this); });
           slotEl.setAttribute('listenerAttached', 'true');
        }
    });

    // Static tooltips that don't open panels
    document.querySelectorAll('.national-focus-banner, .pie-chart').forEach(el => {
        if(el.dataset.tooltip && !el.getAttribute('listenerAttached')) {
             addTooltipEventsToElement(el, el.dataset.tooltip, null, null);
             el.setAttribute('listenerAttached', 'true');
        }
    });
}

// --- National Focus Modal Logic ---
const nationalFocusModal = document.getElementById('nationalFocusModal');
const closeFocusModalBtn_NF = document.getElementById('closeFocusModalBtn');
const nationalFocusBannerClickable = document.getElementById('nationalFocusBannerClickable');
const focusModalTitle = document.getElementById('focusModalTitle');
const focusModalImage = document.getElementById('focusModalImage');
const focusModalDescription = document.getElementById('focusModalDescription');
const focusModalProjectsContainer = document.getElementById('focusModalProjectsContainer'); 

if (nationalFocusBannerClickable) {
    nationalFocusBannerClickable.style.cursor = 'pointer';
    nationalFocusBannerClickable.addEventListener('click', () => {
        const focusData = GAME_DATA.currentNationalFocus; 

        if (nationalFocusModal && focusModalTitle && focusModalImage && focusModalDescription && focusModalProjectsContainer && focusData) {
            focusModalTitle.textContent = focusData.title || "Национальный Фокус";
            focusModalImage.src = focusData.modal_full_image_path || "https://via.placeholder.com/700x400/222/fff?text=Full+Focus+Art";
            focusModalImage.alt = focusData.title || "Национальный фокус";
            focusModalDescription.textContent = focusData.description || "Описание не предоставлено.";

            focusModalProjectsContainer.innerHTML = ''; 
            if (focusData.projects && focusData.projects.length > 0) {
                focusData.projects.forEach(project => {
                    const projectItemEl = document.createElement('div');
                    projectItemEl.className = 'focus-project-item';

                    const iconWrapperEl = document.createElement('div');
                    iconWrapperEl.className = 'focus-project-icon';
                    const iconEl = document.createElement('img');
                    iconEl.src = project.icon_path || 'https://via.placeholder.com/90/777/fff?text=P'; // Иконка по умолчанию 90x90
                    iconEl.alt = project.name?.substring(0,3) || "Proj";
                    iconWrapperEl.appendChild(iconEl);

                    const progressBarContainerEl = document.createElement('div');
                    progressBarContainerEl.className = 'focus-project-progress-bar-container';
                    
                    const progressBarFillEl = document.createElement('div');
                    progressBarFillEl.className = 'focus-project-progress-bar-fill';
                    const progressPercentage = (project.current_progress / project.max_progress) * 100;
                    progressBarFillEl.style.width = `${Math.min(100, Math.max(0, progressPercentage))}%`;
                    
                    // ДОБАВЛЕНО: Текст на прогресс-баре
                    const progressTextEl = document.createElement('span');
                    progressTextEl.className = 'focus-project-progress-bar-text';
                    progressTextEl.textContent = `${project.current_progress}/${project.max_progress}`;

                    progressBarContainerEl.appendChild(progressBarFillEl);
                    progressBarContainerEl.appendChild(progressTextEl); // Добавляем текст ВНУТРЬ контейнера прогресс-бара

                    projectItemEl.appendChild(iconWrapperEl);
                    projectItemEl.appendChild(progressBarContainerEl);

                    addTooltipEventsToElement(
                        projectItemEl, 
                        project.name,
                        project.tooltip_summary,
                        project.tooltip_description
                    );
                    focusModalProjectsContainer.appendChild(projectItemEl);
                });
            } else {
                focusModalProjectsContainer.innerHTML = '<p style="text-align:center;color:#888;width:100%; margin: 10px 0;">Нет активных проектов для этого фокуса.</p>';
            }
            nationalFocusModal.style.display = 'flex';
        } else { 
            console.error("Элементы модального окна нац. фокуса не найдены или данные фокуса (GAME_DATA.currentNationalFocus) отсутствуют!"); 
            if(!focusData) console.error("GAME_DATA.currentNationalFocus is null or undefined.");
        }
    });
}
if (closeFocusModalBtn_NF) {
    closeFocusModalBtn_NF.onclick = function() {
        if (nationalFocusModal) nationalFocusModal.style.display = 'none';
    }
}
window.addEventListener('click', function(event) {
    if (event.target == nationalFocusModal && nationalFocusModal) {
        nationalFocusModal.style.display = 'none';
    }
    if (event.target == balanceModal && balanceModal) {
        balanceModal.style.display = 'none';
    }
    if (selectionSidePanel && selectionSidePanel.style.display === 'flex' && 
        !selectionSidePanel.contains(event.target) && 
        clickedMainSlotElement && !clickedMainSlotElement.contains(event.target) &&
        event.target !== clickedMainSlotElement && !isDescendant(clickedMainSlotElement, event.target)) {
        let isClickOnTrigger = false;
        document.querySelectorAll('[data-slot-type]').forEach(trigger => {
            if (trigger.contains(event.target) || trigger === event.target) {
                isClickOnTrigger = true;
            }
        });
        if (!isClickOnTrigger) {
            selectionSidePanel.style.display = 'none';
        }
    }
});
function isDescendant(parent, child) {
    let node = child.parentNode;
    while (node != null) {
        if (node == parent) {
            return true;
        }
        node = node.parentNode;
    }
    return false;
}

// --- Start Application ---
document.addEventListener('DOMContentLoaded', initializeGameData);