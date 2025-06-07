// script.js

// Global tooltip element
const tooltipElement = document.querySelector('.tooltip');

// --- Tooltip Functions ---
function positionTooltip(event) {
    if (tooltipElement.style.display === 'block') {
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

function addTooltipEventsToElement(element, name, effectsSummary, fullDescription = null) {
    element.addEventListener('mouseenter', function(event) {
        let tooltipContent = "";
        if (name) tooltipContent += `<strong>${name}</strong>`;
        if (effectsSummary) tooltipContent += (name ? "<hr>" : "") + effectsSummary.replace(/\n/g, '<br>');
        if (fullDescription) tooltipContent += (name || effectsSummary ? "<hr>" : "") + "<small>" + fullDescription.replace(/\n/g, '<br>') + "</small>";

        if (tooltipContent) {
            tooltipElement.innerHTML = tooltipContent;
            tooltipElement.style.display = 'block';
            positionTooltip(event);
        } else {
            const staticTooltipText = this.dataset.tooltip;
            if (staticTooltipText) {
                tooltipElement.innerHTML = staticTooltipText.replace(/\n/g, '<br>');
                tooltipElement.style.display = 'block';
                positionTooltip(event);
            } else {
                tooltipElement.style.display = 'none';
            }
        }
    });
    element.addEventListener('mousemove', positionTooltip);
    element.addEventListener('mouseleave', function() { tooltipElement.style.display = 'none'; });
}

// --- Balance Modal Logic ---
const balanceModal = document.getElementById('balanceModal');
const balanceButton = document.getElementById('balanceButton');
const closeBalanceModalBtn = document.getElementById('closeBalanceModalBtn');
const balanceMarker = document.getElementById('balanceMarker');
const balanceValueDisplay = document.getElementById('balanceValueDisplay');

function updateBalanceScale(value) {
    value = Math.max(-50, Math.min(50, Number(value || 0))); // Handle NaN
    const percentage = (value + 50);
    if (balanceMarker) balanceMarker.style.left = percentage + '%';
    if (balanceValueDisplay) balanceValueDisplay.textContent = value;
    const balanceValueInput = document.getElementById('balanceValueInput');
    if(balanceValueInput) balanceValueInput.value = value;
}
if (balanceButton) balanceButton.onclick = () => { if(balanceModal) balanceModal.style.display = 'flex'; updateBalanceScale(parseInt(balanceValueDisplay?.textContent || '0')); };
if (closeBalanceModalBtn) closeBalanceModalBtn.onclick = () => { if(balanceModal) balanceModal.style.display = 'none'; };
window.onclick = (event) => { if (event.target == balanceModal && balanceModal) balanceModal.style.display = 'none'; };
updateBalanceScale(0);

// --- Game Data Loading and Management ---
const GAME_DATA = { leaders: {}, constitutional_principles: {}, development_areas: {}, corporations: {}, ideologies: {}, parties: {}, national_spirits: {} };
const ALL_DATA_FILES_TO_LOAD = [
    "history/leaders.json", // Assuming one file with "options": [leader_objects...]
    "history/constitutional_principles.json",
    "history/development_areas.json",
    // Below are examples, if you keep separate law categories, list them
    // "history/laws/economic.json",
    // "history/laws/military.json",
    // "history/laws/social.json",
    // "history/laws/conscription.json", // Was development_laws previously in your files
    "history/corporations.json",
    "history/ideologies.json",
    "history/parties.json",
    "history/national_spirits.json"
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

        if (filePath.endsWith('leaders.json') && data.options) { GAME_DATA.leaders = {}; data.options.forEach(l => GAME_DATA.leaders[l.id] = l); }
        else if (filePath.endsWith('constitutional_principles.json') && data.principles) { GAME_DATA.constitutional_principles = {}; data.principles.forEach(p => GAME_DATA.constitutional_principles[p.id] = p); }
        else if (filePath.endsWith('development_areas.json') && data.areas) { GAME_DATA.development_areas = {}; data.areas.forEach(a => GAME_DATA.development_areas[a.id] = a); }
        else if (filePath.endsWith('corporations.json') && data.options) { GAME_DATA.corporations = {}; data.options.forEach(c => GAME_DATA.corporations[c.id] = c); }
        else if (filePath.endsWith('ideologies.json')) { // Can be an array of options or a single ideology object
            if (data.options) { GAME_DATA.ideologies = {}; data.options.forEach(i => GAME_DATA.ideologies[i.id] = i); }
            else if (data.id) { GAME_DATA.ideologies = { [data.id]: data }; }
        }
        else if (filePath.endsWith('parties.json') && data.options) { GAME_DATA.parties_array = data.options; GAME_DATA.parties = {}; data.options.forEach(p => GAME_DATA.parties[p.id] = p); }
        else if (filePath.endsWith('national_spirits.json') && data.options) { GAME_DATA.national_spirits = {}; data.options.forEach(s => GAME_DATA.national_spirits[s.id] = s); }
        // Add any specific law category files if you still use them
        // else if (filePath.endsWith('economic.json') && data.options) { GAME_DATA.laws.economic = {}; data.options.forEach(law => GAME_DATA.laws.economic[law.id] = law); }
    });
    await Promise.all(loadPromises);
    console.log("Игровые данные загружены:", GAME_DATA);
    initializeUI();
}

// --- Side Panel Logic ---
const selectionSidePanel = document.getElementById('selectionSidePanel');
const sidePanelTitleEl = document.getElementById('sidePanelTitle');
const sidePanelOptionsContainer = document.getElementById('sidePanelOptionsContainer');
const closeSidePanelBtn_SP = document.getElementById('closeSidePanelBtn_SP'); // Unique ID

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
        panelTitle = "Назначить Советника"; optionsToShow = Object.values(GAME_DATA.leaders);
    } else if (principleId) {
        const principleData = GAME_DATA.constitutional_principles[principleId];
        panelTitle = principleData?.name || "Конституционный Принцип";
        optionsToShow = principleData?.options || [];
    } else if (developmentAreaId) {
        const areaData = GAME_DATA.development_areas[developmentAreaId];
        panelTitle = areaData?.name || "Область Развития";
        optionsToShow = areaData?.options || [];
    } else if (slotType.startsWith("corporation_slot_")) {
        panelTitle = "Выбор Корпорации"; optionsToShow = Object.values(GAME_DATA.corporations);
    }
    // Add more cases here for old law categories if you keep them

    sidePanelTitleEl.textContent = panelTitle;
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
            addTooltipEventsToElement(optionEl, optionData.name_display || optionData.name, optionData.effects_summary || optionData.tooltip_summary, optionData.description);
            sidePanelOptionsContainer.appendChild(optionEl);
        });
    }
    selectionSidePanel.style.display = 'flex';
}

function selectOptionInSidePanel(selectedOptionId, targetSlotType) {
    let chosenData = null;
    const principleId = targetSlotType.startsWith("constitutional_principle_") ? targetSlotType.replace("constitutional_principle_", "") : null;
    const developmentAreaId = targetSlotType.startsWith("development_area_") ? targetSlotType.replace("development_area_", "") : null;


    if (targetSlotType.startsWith("advisor_")) chosenData = GAME_DATA.leaders[selectedOptionId];
    else if (principleId) {
        GAME_DATA.constitutional_principles[principleId]?.options.forEach(opt => opt.is_current = (opt.id === selectedOptionId));
        chosenData = GAME_DATA.constitutional_principles[principleId]?.options.find(opt => opt.is_current);
    } else if (developmentAreaId) {
        GAME_DATA.development_areas[developmentAreaId]?.options.forEach(opt => opt.is_current = (opt.id === selectedOptionId));
        chosenData = GAME_DATA.development_areas[developmentAreaId]?.options.find(opt => opt.is_current);
    } else if (targetSlotType.startsWith("corporation_slot_")) chosenData = GAME_DATA.corporations[selectedOptionId];
    // Add other specific law categories if used


    if (!chosenData || !clickedMainSlotElement) { console.error("Data or slot missing", selectedOptionId, targetSlotType); return; }

    clickedMainSlotElement.dataset.currentId = chosenData.id;
    const mainSlotImg = clickedMainSlotElement.querySelector('img');
    const mainSlotLabel = clickedMainSlotElement.querySelector('.item-slot-label-small');

    if (mainSlotImg) {
        mainSlotImg.src = chosenData.icon_path || chosenData.portrait_path || 'https://via.placeholder.com/80/ccc/000?text=N/A';
        mainSlotImg.alt = chosenData.name?.substring(0, 3) || "ICO";
    }
    if (mainSlotLabel) mainSlotLabel.textContent = chosenData.name_display || chosenData.name;

    addTooltipEventsToElement(clickedMainSlotElement, chosenData.name_display || chosenData.name, chosenData.tooltip_summary || chosenData.effects_summary, null);
    clickedMainSlotElement.classList.add('selected');

    if(sidePanelOptionsContainer) {
      sidePanelOptionsContainer.querySelectorAll('.side-panel-option').forEach(optEl => {
          optEl.classList.remove('active');
          if (optEl.dataset.optionId === selectedOptionId) optEl.classList.add('active');
      });
    }
    // if(selectionSidePanel) selectionSidePanel.style.display = 'none'; // Optional close
}
if(closeSidePanelBtn_SP) closeSidePanelBtn_SP.onclick = () => { if(selectionSidePanel) selectionSidePanel.style.display = 'none'; };


// --- Party Politics UI ---
function drawPoliticalPieChart() {
    const canvas = document.getElementById('partyPieChartCanvas');
    const pieChartContainer = document.getElementById('politicalPieChart');
    if (!canvas || !GAME_DATA.parties_array || GAME_DATA.parties_array.length === 0) {
        if(pieChartContainer) pieChartContainer.innerHTML = "<p style='font-size:0.8em;text-align:center;color:#888;'>Нет данных</p>";
        return;
    }
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 1;
    const parties = GAME_DATA.parties_array.filter(p => p.popularity > 0);
    const totalPopularity = parties.reduce((sum, party) => sum + party.popularity, 0);
    if (totalPopularity === 0) {  if(pieChartContainer) pieChartContainer.innerHTML = "<p style='font-size:0.8em;text-align:center;color:#888;'>Нет популярности</p>"; return; }
    let currentAngle = -0.5 * Math.PI;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    parties.forEach(party => {
        const sliceAngle = (party.popularity / totalPopularity) * 2 * Math.PI;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = party.color || '#cccccc';
        ctx.fill();
        ctx.strokeStyle = '#3c3c3c';
        ctx.lineWidth = 0.5;
        ctx.stroke();
        currentAngle += sliceAngle;
    });
}

function updatePartyList() {
    const partyListContainer = document.getElementById('partyListContainer');
    if (!partyListContainer || !GAME_DATA.parties_array) return;
    const rulingPartyId = "united_russia"; // TODO: Determine this dynamically
    const sortedParties = [...GAME_DATA.parties_array]
        .filter(p => p.popularity > 0 || p.id === rulingPartyId)
        .sort((a, b) => b.popularity - a.popularity);
    partyListContainer.innerHTML = '';
    sortedParties.forEach(party => {
        const listItem = document.createElement('li');
        if (party.id === rulingPartyId) listItem.classList.add('highlighted');
        const colorBox = document.createElement('div');
        colorBox.className = 'party-color-box';
        colorBox.style.backgroundColor = party.color || '#cccccc';
        const partyNameSpan = document.createElement('span');
        partyNameSpan.textContent = ` ${party.name} (${party.popularity})`;
        listItem.appendChild(colorBox);
        listItem.appendChild(partyNameSpan);
        addTooltipEventsToElement(listItem, party.name, `Популярность: ${party.popularity}%` + (party.ideology_tags ? `\nИдеологии: ${party.ideology_tags.join(', ')}` : ''), null);
        partyListContainer.appendChild(listItem);
    });
}

// --- UI Initialization Function ---
function initializeUI() {
    // Leader
    const countryLeaderId = "putin_vladimir";
    const leaderData = GAME_DATA.leaders[countryLeaderId];
    const leaderPortraitEl = document.querySelector('.leader-pane .leader-portrait img');
    const leaderNameEl = document.querySelector('.leader-pane .leader-name');
    if (leaderData && leaderPortraitEl && leaderNameEl) {
        leaderPortraitEl.src = leaderData.portrait_path || 'https://via.placeholder.com/180x210/555/fff?text=Ldr';
        leaderNameEl.textContent = leaderData.name;
        addTooltipEventsToElement(leaderPortraitEl.parentElement, leaderData.name, leaderData.tooltip_summary, leaderData.description);
    }

    // Ideology
    const currentIdeologyId = "sovereign_democracy"; // Object.keys(GAME_DATA.ideologies)[0] || "default_ideology_id";
    const ideologyData = GAME_DATA.ideologies[currentIdeologyId];
    const ideologyIconContainer = document.querySelector('.ideology-info .ideology-icon');
    const ideologyIconEl = ideologyIconContainer?.querySelector('img');
    const ideologyNameEl = document.querySelector('.ideology-info .ideology-name');
    if (ideologyData && ideologyIconEl && ideologyNameEl && ideologyIconContainer) {
        ideologyIconEl.src = ideologyData.icon_path || 'https://via.placeholder.com/45/666/fff?text=Idlgy';
        ideologyNameEl.innerHTML = ideologyData.name_multiline || ideologyData.name;
        addTooltipEventsToElement(ideologyIconContainer, ideologyData.name, ideologyData.effects_summary, ideologyData.description);
        ideologyIconContainer.dataset.tooltip = ""; // Clear static tooltip to let JS handle it
    }

    // Party Emblem (Ruling Party)
    const rulingPartyId = "united_russia";
    const partyData = GAME_DATA.parties?.[rulingPartyId];
    const partyEmblemContainer = document.querySelector('.party-emblem');
    const partyEmblemEl = partyEmblemContainer?.querySelector('img');
     if (partyData && partyEmblemEl && partyEmblemContainer) {
        partyEmblemEl.src = partyData.icon_path || 'https://via.placeholder.com/45/666/fff?text=Pty';
        addTooltipEventsToElement(partyEmblemContainer, partyData.name, partyData.effects_summary, partyData.description);
        partyEmblemContainer.dataset.tooltip = "";
    }


    // National Spirits
    const nationalSpiritsContainer = document.querySelector('.national-spirits');
    if (nationalSpiritsContainer && GAME_DATA.national_spirits) {
        nationalSpiritsContainer.innerHTML = '';
        const activeSpiritIds = ["great_power_ambitions", "strong_army"]; // Example
        activeSpiritIds.forEach(spiritId => {
            const spiritData = GAME_DATA.national_spirits[spiritId];
            if (spiritData) {
                const spiritEl = document.createElement('div'); spiritEl.className = 'spirit-icon';
                const imgEl = document.createElement('img');
                imgEl.src = spiritData.icon_path || 'https://via.placeholder.com/40/777/000?text=Sp';
                imgEl.alt = spiritData.name?.substring(0,2) || "SP";
                spiritEl.appendChild(imgEl);
                addTooltipEventsToElement(spiritEl, spiritData.name, spiritData.effects_summary, spiritData.description);
                nationalSpiritsContainer.appendChild(spiritEl);
            }
        });
    }

    // Political Parties Chart and List
    drawPoliticalPieChart();
    updatePartyList();
    const rulingPartyInfoStrongEl = document.querySelector('.ruling-party-info strong'); // More specific selector
    if (rulingPartyInfoStrongEl && GAME_DATA.parties?.[rulingPartyId]) {
        rulingPartyInfoStrongEl.textContent = GAME_DATA.parties[rulingPartyId].name;
    }

    // Constitutional Principles
    const principlesContainer = document.getElementById('constitutional-principles-container');
    if (principlesContainer && GAME_DATA.constitutional_principles) {
        principlesContainer.innerHTML = '';
        Object.values(GAME_DATA.constitutional_principles)
            .sort((a, b) => (a.article_number || Infinity) - (b.article_number || Infinity)) // Sort by article number
            .forEach(principle => {
                const currentOption = principle.options?.find(opt => opt.is_current);
                if (currentOption) {
                    const slotEl = document.createElement('div');
                    slotEl.className = 'item-slot constitutional-principle';
                    slotEl.dataset.slotType = `constitutional_principle_${principle.id}`;
                    slotEl.dataset.currentId = currentOption.id;
                    const imgEl = document.createElement('img');
                    imgEl.src = principle.icon_path || 'https://via.placeholder.com/50x50/4a4a4a/fff?text=C';
                    slotEl.appendChild(imgEl);
                    const labelEl = document.createElement('span');
                    labelEl.className = 'item-slot-label-small';
                    labelEl.textContent = currentOption.name_display;
                    slotEl.appendChild(labelEl);
                    addTooltipEventsToElement(slotEl, currentOption.name_display, currentOption.effects_summary, null);
                    slotEl.addEventListener('click', function() { openSidePanelForCategory(this.dataset.slotType, this); });
                    principlesContainer.appendChild(slotEl);
                }
        });
    }

    // Development Areas
    const developmentContainer = document.getElementById('development-areas-container');
    if (developmentContainer && GAME_DATA.development_areas) {
        developmentContainer.innerHTML = '';
        Object.values(GAME_DATA.development_areas) // .sort() if needed
            .forEach(area => {
                const currentOption = area.options?.find(opt => opt.is_current);
                if (currentOption) {
                    const slotEl = document.createElement('div');
                    slotEl.className = 'item-slot development-area';
                    slotEl.dataset.slotType = `development_area_${area.id}`;
                    slotEl.dataset.currentId = currentOption.id;
                    const imgEl = document.createElement('img');
                    imgEl.src = area.icon_path || 'https://via.placeholder.com/50x50/4a4a4a/fff?text=D';
                    slotEl.appendChild(imgEl);
                    const labelEl = document.createElement('span');
                    labelEl.className = 'item-slot-label-small';
                    labelEl.textContent = currentOption.name_display;
                    slotEl.appendChild(labelEl);
                    addTooltipEventsToElement(slotEl, currentOption.name_display, currentOption.effects_summary, null);
                    slotEl.addEventListener('click', function() { openSidePanelForCategory(this.dataset.slotType, this); });
                    developmentContainer.appendChild(slotEl);
                }
        });
    }

    // Initialize pre-defined HTML slots (Advisors, Corporations)
    document.querySelectorAll('[data-slot-type]').forEach(slotEl => {
        const slotId = slotEl.id || ""; // Use ID if unique containers for dynamic sections
        if (slotId === 'constitutional-principles-container' || slotId === 'development-areas-container' ||
            slotEl.dataset.slotType === 'ideology_display' || slotEl.dataset.slotType === 'party_display' ||
            slotEl.classList.contains('constitutional-principle') || slotEl.classList.contains('development-area')) {
            return; // Already handled or display-only
        }

        const slotType = slotEl.dataset.slotType;
        const currentItemId = slotEl.dataset.currentId;
        let currentItemData = null;

        if (currentItemId) {
            if (slotType.startsWith("advisor_")) currentItemData = GAME_DATA.leaders[currentItemId];
            else if (slotType.startsWith("corporation_slot_")) currentItemData = GAME_DATA.corporations[currentItemId];
            // Add cases for individual law slots if they still exist and are not dynamically generated
        }

        const imgEl = slotEl.querySelector('img');
        const labelEl = slotEl.querySelector('.item-slot-label-small');

        if (currentItemData && imgEl) {
            imgEl.src = currentItemData.icon_path || currentItemData.portrait_path || 'https://via.placeholder.com/80/ccc/000?text=N/A';
            imgEl.alt = currentItemData.name?.substring(0, 3) || "ICO";
            if(labelEl && slotEl.classList.contains('item-slot')) labelEl.textContent = currentItemData.name_display || currentItemData.name; // Label for item-slots, not usually for advisors
            slotEl.classList.add('selected');
            addTooltipEventsToElement(slotEl, currentItemData.name_display || currentItemData.name, currentItemData.tooltip_summary || currentItemData.effects_summary, null);
        } else if (imgEl) {
            let emptyIconSrc = 'https://via.placeholder.com/50x50/333/666?text=+';
            if (slotEl.classList.contains('advisor-portrait-slot')) emptyIconSrc = 'https://via.placeholder.com/65x65/333/666?text=+';
            imgEl.src = emptyIconSrc;
            imgEl.alt = "+";
            if(labelEl) labelEl.textContent = "";
            slotEl.classList.remove('selected');
            addTooltipEventsToElement(slotEl, "Назначить / Выбрать", null, null);
        }
        if(!slotType.includes("_display")) {
           slotEl.addEventListener('click', function() { openSidePanelForCategory(this.dataset.slotType, this); });
        }
    });

    document.querySelectorAll('.national-focus-banner, .pie-chart').forEach(el => {
        if(el.dataset.tooltip) addTooltipEventsToElement(el, el.dataset.tooltip, null, null);
    });
}

// --- Start Application ---
document.addEventListener('DOMContentLoaded', initializeGameData);