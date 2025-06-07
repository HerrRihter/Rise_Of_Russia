// script.js

// Global tooltip element
const tooltipElement = document.querySelector('.tooltip');

// --- Tooltip Functions ---
function positionTooltip(event) {
    if (tooltipElement.style.display === 'block') {
    if (tooltipElement && tooltipElement.style.display === 'block') {
        let x = event.clientX + 15;
        let y = event.clientY + 15;
        const screenPadding = 10;
@@ -25,32 +25,55 @@ function positionTooltip(event) {
    }
}

function addTooltipEventsToElement(element, name, effectsSummary, fullDescription = null) {
function addTooltipEventsToElement(element, name, effectsSummary, fullDescription = null, explicitSlotTitle = null) {
    if (!element) return; // Защита от null элемента
    element.addEventListener('mouseenter', function(event) {
        let tooltipContent = "";
        if (name) tooltipContent += `<strong>${name}</strong>`;
        if (effectsSummary) tooltipContent += (name ? "<hr>" : "") + effectsSummary.replace(/\n/g, '<br>');
        if (fullDescription) tooltipContent += (name || effectsSummary ? "<hr>" : "") + "<small>" + fullDescription.replace(/\n/g, '<br>') + "</small>";
        const slotTitle = explicitSlotTitle || this.dataset.slotTitle; // Приоритет у явно переданного

        if (tooltipContent) {
            tooltipElement.innerHTML = tooltipContent;
            tooltipElement.style.display = 'block';
            positionTooltip(event);
        } else {
        if (slotTitle) {
            tooltipContent += `<small style="color: #aaa; display: block; margin-bottom: 4px; font-style: italic;">${slotTitle}</small>`;
        }
        if (name) { // Имя персонажа или название опции
            tooltipContent += (tooltipContent ? "<hr>" : "") + `<strong>${name}</strong>`;
        }
        if (effectsSummary) {
            tooltipContent += (tooltipContent && (name || slotTitle) ? "<hr>" : "") + effectsSummary.replace(/\n/g, '<br>');
        }
        if (fullDescription) {
            tooltipContent += (tooltipContent && (name || slotTitle || effectsSummary) ? "<hr>" : "") + "<small>" + fullDescription.replace(/\n/g, '<br>') + "</small>";
        }
        // Для пустых слотов, у которых есть только slotTitle
        if (!name && slotTitle && !effectsSummary && !fullDescription) {
             tooltipContent += (tooltipContent.includes('<small>') ? "<hr>" : "") + "<strong>Назначить / Выбрать</strong>";
        } else if (!name && !slotTitle && !effectsSummary && !fullDescription) {
            // Фолбэк на статический data-tooltip, если больше ничего нет
            const staticTooltipText = this.dataset.tooltip;
            if (staticTooltipText) {
                tooltipElement.innerHTML = staticTooltipText.replace(/\n/g, '<br>');
                tooltipElement.style.display = 'block';
                positionTooltip(event);
            } else {
                tooltipElement.style.display = 'none';
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
    element.addEventListener('mouseleave', function() { tooltipElement.style.display = 'none'; });
    element.addEventListener('mouseleave', function() {
        if (tooltipElement) tooltipElement.style.display = 'none';
    });
}

// --- Balance Modal Logic ---
const balanceModal = document.getElementById('balanceModal');
const balanceButton = document.getElementById('balanceButton');
@@ -81,11 +104,6 @@ const ALL_DATA_FILES_TO_LOAD = [
    "history/ideologies.json",
    "history/parties.json",
    "history/national_spirits.json"
    // Если у вас были старые отдельные файлы законов, и вы их еще используете, добавьте их сюда.
    // "history/laws/economic.json",
    // "history/laws/military.json",
    // "history/laws/social.json",
    // "history/laws/conscription.json",
];

async function loadJsonFile(filePath) {
@@ -101,16 +119,16 @@ async function initializeGameData() {
        const data = await loadJsonFile(filePath);
        if (!data) return;

        if (filePath.endsWith('leaders.json') && data.options) { GAME_DATA.leaders = {}; data.options.forEach(l => GAME_DATA.leaders[l.id] = l); }
        if (filePath.endsWith('leaders.json') && data.options) { GAME_DATA.leaders = {}; data.options.forEach(l => { if(l.id) GAME_DATA.leaders[l.id] = l;}); }
        else if (filePath.endsWith('constitutional_principles.json') && data.principles) { GAME_DATA.constitutional_principles = {}; data.principles.forEach(p => {if(p.id)GAME_DATA.constitutional_principles[p.id] = p;}); }
        else if (filePath.endsWith('development_areas.json') && data.areas) { GAME_DATA.development_areas = {}; data.areas.forEach(a => {if(a.id)GAME_DATA.development_areas[a.id] = a;}); }
        else if (filePath.endsWith('corporations.json') && data.options) { GAME_DATA.corporations = {}; data.options.forEach(c => GAME_DATA.corporations[c.id] = c); }
        else if (filePath.endsWith('corporations.json') && data.options) { GAME_DATA.corporations = {}; data.options.forEach(c => {if(c.id)GAME_DATA.corporations[c.id] = c;}); }
        else if (filePath.endsWith('ideologies.json')) {
            if (data.options) { GAME_DATA.ideologies = {}; data.options.forEach(i => GAME_DATA.ideologies[i.id] = i); }
            else if (data.id) { GAME_DATA.ideologies = { [data.id]: data }; } // For single ideology file like sovereign_democracy.json
            if (data.options) { GAME_DATA.ideologies = {}; data.options.forEach(i => {if(i.id)GAME_DATA.ideologies[i.id] = i;}); }
            else if (data.id) { GAME_DATA.ideologies = { [data.id]: data }; }
        }
        else if (filePath.endsWith('parties.json') && data.options) { GAME_DATA.parties_array = data.options; GAME_DATA.parties = {}; data.options.forEach(p => GAME_DATA.parties[p.id] = p); }
        else if (filePath.endsWith('national_spirits.json') && data.options) { GAME_DATA.national_spirits = {}; data.options.forEach(s => GAME_DATA.national_spirits[s.id] = s); }
        else if (filePath.endsWith('parties.json') && data.options) { GAME_DATA.parties_array = data.options; GAME_DATA.parties = {}; data.options.forEach(p => {if(p.id)GAME_DATA.parties[p.id] = p;}); }
        else if (filePath.endsWith('national_spirits.json') && data.options) { GAME_DATA.national_spirits = {}; data.options.forEach(s => {if(s.id)GAME_DATA.national_spirits[s.id] = s;}); }
    });
    await Promise.all(loadPromises);
    console.log("Игровые данные загружены:", GAME_DATA);
@@ -139,14 +157,14 @@ function openSidePanelForCategory(slotType, clickedSlotEl) {

    if (slotType.startsWith("advisor_")) {
        panelTitle = "Назначить Советника"; optionsToShow = Object.values(GAME_DATA.leaders || {});
    } else if (principleId) {
    } else if (principleId && GAME_DATA.constitutional_principles[principleId]) {
        const principleData = GAME_DATA.constitutional_principles[principleId];
        panelTitle = principleData?.name || "Конституционный Принцип";
        optionsToShow = principleData?.options || [];
    } else if (developmentAreaId) {
        panelTitle = principleData.name || "Конституционный Принцип";
        optionsToShow = principleData.options || [];
    } else if (developmentAreaId && GAME_DATA.development_areas[developmentAreaId]) {
        const areaData = GAME_DATA.development_areas[developmentAreaId];
        panelTitle = areaData?.name || "Область Развития";
        optionsToShow = areaData?.options || [];
        panelTitle = areaData.name || "Область Развития";
        optionsToShow = areaData.options || [];
    } else if (slotType.startsWith("corporation_slot_")) {
        panelTitle = "Выбор Корпорации"; optionsToShow = Object.values(GAME_DATA.corporations || {});
    }
@@ -175,7 +193,7 @@ function openSidePanelForCategory(slotType, clickedSlotEl) {
            optionEl.appendChild(nameEl);

            optionEl.addEventListener('click', () => selectOptionInSidePanel(optionData.id, currentCategoryForSidePanel));
            addTooltipEventsToElement(optionEl, optionData.name_display || optionData.name, optionData.effects_summary || optionData.tooltip_summary, optionData.description);
            addTooltipEventsToElement(optionEl, optionData.name_display || optionData.name, optionData.effects_summary || optionData.tooltip_summary, optionData.description, panelTitle); // Передаем panelTitle как slotTitle для опций
            sidePanelOptionsContainer.appendChild(optionEl);
        });
    }
@@ -187,28 +205,29 @@ function selectOptionInSidePanel(selectedOptionId, targetSlotType) {
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
    if (targetSlotType.startsWith("advisor_") && GAME_DATA.leaders) chosenData = GAME_DATA.leaders[selectedOptionId];
    else if (principleId && GAME_DATA.constitutional_principles[principleId]) {
        GAME_DATA.constitutional_principles[principleId].options?.forEach(opt => opt.is_current = (opt.id === selectedOptionId));
        chosenData = GAME_DATA.constitutional_principles[principleId].options?.find(opt => opt.is_current);
    } else if (developmentAreaId && GAME_DATA.development_areas[developmentAreaId]) {
        GAME_DATA.development_areas[developmentAreaId].options?.forEach(opt => opt.is_current = (opt.id === selectedOptionId));
        chosenData = GAME_DATA.development_areas[developmentAreaId].options?.find(opt => opt.is_current);
    } else if (targetSlotType.startsWith("corporation_slot_") && GAME_DATA.corporations) chosenData = GAME_DATA.corporations[selectedOptionId];

    if (!chosenData || !clickedMainSlotElement) { console.error("Data or slot missing for selection", selectedOptionId, targetSlotType); return; }

    clickedMainSlotElement.dataset.currentId = chosenData.id;
    const mainSlotImg = clickedMainSlotElement.querySelector('img');
    const mainSlotLabel = clickedMainSlotElement.querySelector('.item-slot-label-small');
    const slotTitleFromHTML = clickedMainSlotElement.dataset.slotTitle; // Для советников

    if (mainSlotImg) {
        mainSlotImg.src = chosenData.icon_path || chosenData.portrait_path || 'https://via.placeholder.com/80/ccc/000?text=N/A';
        mainSlotImg.alt = chosenData.name?.substring(0, 3) || "ICO";
    }
    if (mainSlotLabel) mainSlotLabel.textContent = chosenData.name_display || chosenData.name;

    addTooltipEventsToElement(clickedMainSlotElement, chosenData.name_display || chosenData.name, chosenData.tooltip_summary || chosenData.effects_summary, null);
    addTooltipEventsToElement(clickedMainSlotElement, chosenData.name_display || chosenData.name, chosenData.tooltip_summary || chosenData.effects_summary, null, slotTitleFromHTML);
    clickedMainSlotElement.classList.add('selected');

    if(sidePanelOptionsContainer) {
@@ -217,162 +236,21 @@ function selectOptionInSidePanel(selectedOptionId, targetSlotType) {
          if (optEl.dataset.optionId === selectedOptionId) optEl.classList.add('active');
      });
    }
    // if(selectionSidePanel) selectionSidePanel.style.display = 'none';
}
if(closeSidePanelBtn_SP) closeSidePanelBtn_SP.onclick = () => { if(selectionSidePanel) selectionSidePanel.style.display = 'none'; };


// --- Party Politics UI ---
function drawPoliticalPieChart() {
    const canvas = document.getElementById('partyPieChartCanvas');
    const pieChartContainer = document.getElementById('politicalPieChart'); // Сам div диаграммы
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
    if (totalPopularity === 0) {
        if(pieChartContainer) pieChartContainer.innerHTML = "<p style='font-size:0.8em;text-align:center;color:#888;'>Нет популярности</p>";
        return;
    }
    let currentAngle = -0.5 * Math.PI; // Начать сверху
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Очистить перед перерисовкой
    // Сохраняем информацию о секторах для тултипов
    const sectors = [];
    parties.forEach(party => {
        const sliceAngle = (party.popularity / totalPopularity) * 2 * Math.PI;
        const endAngle = currentAngle + sliceAngle;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = party.color || '#cccccc';
        ctx.fill();
        ctx.strokeStyle = '#3c3c3c';
        ctx.lineWidth = 0.5;
        ctx.stroke();
        sectors.push({
            partyName: party.name,
            popularity: party.popularity,
            startAngle: currentAngle,
            endAngle: endAngle,
            color: party.color || '#cccccc' // Для возможной подсветки сектора при наведении (не реализовано)
        });
        currentAngle = endAngle;
    });
    // Добавляем обработчик событий наведения на canvas
    canvas.removeEventListener('mousemove', handlePieChartMouseMove); // Удаляем старый, если есть
    canvas.addEventListener('mousemove', function(event) {
        handlePieChartMouseMove(event, canvas, sectors, centerX, centerY, radius);
    });
    canvas.removeEventListener('mouseleave', handlePieChartMouseLeave);
    canvas.addEventListener('mouseleave', handlePieChartMouseLeave);
}
// --- Party Politics UI ---
function drawPoliticalPieChart() {
    const canvas = document.getElementById('partyPieChartCanvas');
    const pieChartContainer = document.getElementById('politicalPieChart'); // Сам div диаграммы
    if (!canvas) {
        if(pieChartContainer) pieChartContainer.innerHTML = "<p style='font-size:0.8em;text-align:center;color:#888;'>Canvas не найден</p>";
        console.error("Элемент canvas для диаграммы партий не найден!");
        return;
    }
    if (!GAME_DATA.parties_array || GAME_DATA.parties_array.length === 0) {
        if(pieChartContainer) pieChartContainer.innerHTML = "<p style='font-size:0.8em;text-align:center;color:#888;'>Нет данных о партиях для диаграммы</p>";
        // console.log("Нет данных GAME_DATA.parties_array для диаграммы");
        return;
    }

    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 1; // -1 для небольшого отступа, чтобы граница была видна

    const parties = GAME_DATA.parties_array.filter(p => p.popularity > 0);
    const totalPopularity = parties.reduce((sum, party) => sum + party.popularity, 0);

    if (totalPopularity === 0) {
        if(pieChartContainer) pieChartContainer.innerHTML = "<p style='font-size:0.8em;text-align:center;color:#888;'>Нет популярности для отображения</p>";
        // console.log("Общая популярность партий равна 0 для диаграммы");
        return;
    }
    if(pieChartContainer && pieChartContainer.querySelector('p')) pieChartContainer.innerHTML = ''; // Очищаем сообщение об ошибке, если было
    if(!pieChartContainer.contains(canvas)) pieChartContainer.appendChild(canvas); // Убедимся что canvas внутри, если был заменен на p

    let currentAngle = -0.5 * Math.PI; // Начать сверху (-90 градусов)
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Очистить canvas перед перерисовкой

    const sectors = []; // Сохраняем информацию о секторах для тултипов

    parties.forEach(party => {
        const sliceAngle = (party.popularity / totalPopularity) * 2 * Math.PI;
        const endAngle = currentAngle + sliceAngle;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = party.color || '#cccccc'; // Цвет партии или серый по умолчанию
        ctx.fill();

        // Дополнительно: добавить тонкую границу между секторами
        ctx.strokeStyle = '#3c3c3c'; // Цвет фона основного экрана, чтобы казалось, что есть промежуток
        ctx.lineWidth = 1; // Толщина линии (можно 0.5 или 1)
        ctx.stroke();

        sectors.push({
            partyName: party.name,
            popularity: party.popularity,
            startAngle: currentAngle,
            endAngle: endAngle
        });
        currentAngle = endAngle;
    });

    // Добавляем обработчик событий наведения на canvas
    canvas.removeEventListener('mousemove', handlePieChartMouseMove); // Удаляем старый, если есть
    canvas.addEventListener('mousemove', function(event) {
        handlePieChartMouseMove(event, canvas, sectors, centerX, centerY, radius);
    });
    canvas.removeEventListener('mouseleave', handlePieChartMouseLeave);
    canvas.addEventListener('mouseleave', handlePieChartMouseLeave);
}

function handlePieChartMouseMove(event, canvas, sectors, centerX, centerY, radius) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const dx = mouseX - centerX;
    const dy = mouseY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    let foundSector = false;
    if (distance <= radius) {
        let angle = Math.atan2(dy, dx);
        // Нормализуем угол к диапазону, используемому при рисовании arc (от -PI/2 до 3PI/2)
        if (angle < -Math.PI / 2) {
            angle += 2 * Math.PI;
        }

        for (const sector of sectors) {
            // Важно: startAngle и endAngle могут пересекать точку -PI/2 (вертикаль вверх)
            // Нужно аккуратно сравнивать
            let inSector = false;
            if (sector.startAngle < sector.endAngle) { // Простой случай, сектор не пересекает -PI/2
                if (angle >= sector.startAngle && angle < sector.endAngle) {
                    inSector = true;
                }
            } else { // Сектор пересекает -PI/2 (например, от 1.4PI до 0.1PI)
                if (angle >= sector.startAngle || angle < sector.endAngle) {
                    inSector = true;
                }
            }

            if (inSector) {
                tooltipElement.innerHTML = `<strong>${sector.partyName}</strong><hr>${sector.popularity}%`;
                tooltipElement.style.display = 'block';
                positionTooltip(event);
                foundSector = true;
                return;
            }
        }
    }
    if (!foundSector && tooltipElement) {
        tooltipElement.style.display = 'none'; // Скрыть, если не над сектором
    }
}

function handlePieChartMouseLeave() {
    if (tooltipElement) {
        tooltipElement.style.display = 'none';
    }
}

function updatePartyList() {
    const partyListContainer = document.getElementById('partyListContainer');
    if (!partyListContainer) {
        console.error("Контейнер списка партий не найден!");
        return;
    }
    if (!GAME_DATA.parties_array || GAME_DATA.parties_array.length === 0) {
        partyListContainer.innerHTML = "<li>Нет данных о партиях</li>";
        // console.log("Нет данных GAME_DATA.parties_array для списка");
        return;
    }

    const rulingPartyId = "united_russia"; // TODO: Сделать динамическим, если нужно
    const sortedParties = [...GAME_DATA.parties_array]
        .filter(p => p.popularity > 0 || p.id === rulingPartyId) // Показываем партии с >0 или правящую
        .sort((a, b) => b.popularity - a.popularity);

    partyListContainer.innerHTML = ''; // Очищаем список перед заполнением

    sortedParties.forEach(party => {
        const listItem = document.createElement('li');
        if (party.id === rulingPartyId) listItem.classList.add('highlighted');

        const colorBox = document.createElement('div');
        colorBox.className = 'party-color-box';
        colorBox.style.backgroundColor = party.color || '#cccccc';

        const partyNameSpan = document.createElement('span');
        partyNameSpan.textContent = ` ${party.name} (${party.popularity}%)`;

        listItem.appendChild(colorBox);
        listItem.appendChild(partyNameSpan);

        let effectsForTooltip = `Популярность: ${party.popularity}%`;
        if (party.ideology_tags_rus && party.ideology_tags_rus.length > 0) {
            effectsForTooltip += `\nИдеологии: ${party.ideology_tags_rus.join(', ')}`;
        }
        // Для элемента списка партий, используем party.short_description как fullDescription
        addTooltipEventsToElement(listItem, party.name, effectsForTooltip, party.short_description);
        partyListContainer.appendChild(listItem);
    });
}

function handlePieChartMouseMove(event, canvas, sectors, centerX, centerY, radius) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const dx = mouseX - centerX;
    const dy = mouseY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance <= radius) {
        let angle = Math.atan2(dy, dx);
        if (angle < -Math.PI / 2) { // Нормализация угла, чтобы совпадал с отрисовкой
            angle += 2 * Math.PI;
        }
        for (const sector of sectors) {
            // Проверяем, находится ли угол мыши в пределах сектора
            // Небольшая погрешность для углов
            let normalizedStartAngle = sector.startAngle;
            let normalizedEndAngle = sector.endAngle;
            // Нормализация для случаев, когда сектор пересекает 0 радиан (вертикаль вверх)
            if (normalizedStartAngle > normalizedEndAngle && angle < normalizedStartAngle && angle < normalizedEndAngle + 2*Math.PI ) { // for sector crossing the 0/2PI line (top)
                angle += 2 * Math.PI; // if mouse angle is small positive and sector endAngle is small positive after crossing 0.
            } else if (normalizedStartAngle > normalizedEndAngle && normalizedStartAngle > Math.PI && angle < Math.PI/2 ) {
                 // Edge case for sector that crosses the -PI/2 to +PI/2 line on the right
            }
            if (angle >= normalizedStartAngle && angle < normalizedEndAngle) {
                tooltipElement.innerHTML = `<strong>${sector.partyName}</strong><hr>${sector.popularity}%`;
                tooltipElement.style.display = 'block';
                positionTooltip(event);
                return;
            }
        }
    }
    tooltipElement.style.display = 'none'; // Скрыть, если не над сектором
}
function handlePieChartMouseLeave() {
    tooltipElement.style.display = 'none';
}
function updatePartyList() {
    const partyListContainer = document.getElementById('partyListContainer');
    if (!partyListContainer || !GAME_DATA.parties_array) {
        if(partyListContainer) partyListContainer.innerHTML = "<li>Нет данных</li>";
        return;
    }
    const rulingPartyId = "united_russia"; // TODO: Сделать динамическим
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
        partyNameSpan.textContent = ` ${party.name} (${party.popularity}%)`;
        listItem.appendChild(colorBox);
        listItem.appendChild(partyNameSpan);
        // Формируем текст для тултипа списка партий
        // УБРАЛИ party.effects_summary из этого блока
        let effectsForTooltip = `Популярность: ${party.popularity}%`;
        if (party.ideology_tags_rus && party.ideology_tags_rus.length > 0) {
            effectsForTooltip += `\nИдеологии: ${party.ideology_tags_rus.join(', ')}`;
        }
        // Передаем party.short_description как fullDescription
        addTooltipEventsToElement(listItem, party.name, effectsForTooltip, party.short_description);
        partyListContainer.appendChild(listItem);
    });
}

// --- UI Initialization Function ---
function initializeUI() {
    // Leader
    const countryLeaderId = "putin_vladimir"; // TODO: Should be dynamic from game state
    const leaderData = GAME_DATA.leaders[countryLeaderId];
    const countryLeaderId = "putin_vladimir";
    const leaderData = GAME_DATA.leaders?.[countryLeaderId];
    const leaderPortraitEl = document.querySelector('.leader-pane .leader-portrait img');
    const leaderNameEl = document.querySelector('.leader-pane .leader-name');
    if (leaderData && leaderPortraitEl && leaderNameEl) {
@@ -382,34 +260,34 @@ function initializeUI() {
    }

    // Ideology
    const currentIdeologyId = "sovereign_democracy"; // TODO: Should be dynamic
    const ideologyData = GAME_DATA.ideologies[currentIdeologyId];
    const currentIdeologyId = "sovereign_democracy";
    const ideologyData = GAME_DATA.ideologies?.[currentIdeologyId];
    const ideologyIconContainer = document.querySelector('.ideology-info .ideology-icon');
    const ideologyIconEl = ideologyIconContainer?.querySelector('img');
    const ideologyNameEl = document.querySelector('.ideology-info .ideology-name');
    if (ideologyData && ideologyIconEl && ideologyNameEl && ideologyIconContainer) {
        ideologyIconEl.src = ideologyData.icon_path || 'https://via.placeholder.com/45/666/fff?text=Idlgy';
        ideologyNameEl.innerHTML = ideologyData.name_multiline || ideologyData.name || "Неизв. Идеология";
        addTooltipEventsToElement(ideologyIconContainer, ideologyData.name, ideologyData.effects_summary, ideologyData.description);
        if(ideologyIconContainer.dataset.tooltip) ideologyIconContainer.dataset.tooltip = ""; // Clear static
        if(ideologyIconContainer.dataset.tooltip) ideologyIconContainer.removeAttribute('data-tooltip');
    }

    // Party Emblem (Ruling Party)
    const rulingPartyId = "united_russia"; // TODO: Should be dynamic
    const rulingPartyId = "united_russia";
    const partyData = GAME_DATA.parties?.[rulingPartyId];
    const partyEmblemContainer = document.querySelector('.party-emblem');
    const partyEmblemEl = partyEmblemContainer?.querySelector('img');
     if (partyData && partyEmblemEl && partyEmblemContainer) {
        partyEmblemEl.src = partyData.icon_path || 'https://via.placeholder.com/45/666/fff?text=Pty';
        addTooltipEventsToElement(partyEmblemContainer, partyData.name, partyData.effects_summary, partyData.description);
        if(partyEmblemContainer.dataset.tooltip) partyEmblemContainer.dataset.tooltip = ""; // Clear static
        addTooltipEventsToElement(partyEmblemContainer, partyData.name, `Популярность: ${partyData.popularity}%\n${partyData.ideology_tags_rus ? 'Идеологии: ' + partyData.ideology_tags_rus.join(', ') : ''}`, partyData.short_description);
        if(partyEmblemContainer.dataset.tooltip) partyEmblemContainer.removeAttribute('data-tooltip');
    }

    // National Spirits
    const nationalSpiritsContainer = document.querySelector('.national-spirits');
    if (nationalSpiritsContainer && GAME_DATA.national_spirits) {
        nationalSpiritsContainer.innerHTML = '';
        const activeSpiritIds = ["great_power_ambitions", "strong_army"]; // TODO: Example, should be dynamic
        const activeSpiritIds = ["great_power_ambitions", "strong_army"]; // Example
        activeSpiritIds.forEach(spiritId => {
            const spiritData = GAME_DATA.national_spirits[spiritId];
            if (spiritData) {
@@ -425,7 +303,6 @@ function initializeUI() {
    }

    // Political Parties Chart and List
    
    drawPoliticalPieChart();
    updatePartyList();
    const rulingPartyInfoStrongEl = document.querySelector('.ruling-party-info strong');
@@ -443,22 +320,23 @@ function initializeUI() {
                const currentOption = principle.options?.find(opt => opt.is_current);
                if (currentOption) {
                    const slotEl = document.createElement('div');
                    slotEl.className = 'item-slot constitutional-principle'; // Class for specific styling
                    slotEl.className = 'item-slot constitutional-principle';
                    slotEl.dataset.slotType = `constitutional_principle_${principle.id}`;
                    slotEl.dataset.currentId = currentOption.id;
                    slotEl.dataset.slotTitle = principle.name; // Название самого принципа для тултипа слота
                    const imgEl = document.createElement('img');
                    imgEl.src = principle.icon_path || 'https://via.placeholder.com/50x50/4a4a4a/fff?text=C';
                    slotEl.appendChild(imgEl);
                    const labelEl = document.createElement('span');
                    labelEl.className = 'item-slot-label-small';
                    labelEl.textContent = currentOption.name_display;
                    slotEl.appendChild(labelEl);
                    addTooltipEventsToElement(slotEl, currentOption.name_display, currentOption.effects_summary, null);
                    // Тултип для основного слота: Название принципа -> Имя опции -> Эффекты опции
                    addTooltipEventsToElement(slotEl, currentOption.name_display, currentOption.effects_summary, null, principle.name);
                    slotEl.addEventListener('click', function() { openSidePanelForCategory(this.dataset.slotType, this); });
                    principlesContainer.appendChild(slotEl);
                } else {
                    console.warn(`Для конституционного принципа '${principle.id}' не найдена активная опция.`);
                }
                } else { console.warn(`Для конституционного принципа '${principle.id}' не найдена активная опция.`); }
        });
    }

@@ -472,71 +350,73 @@ function initializeUI() {
                const currentOption = area.options?.find(opt => opt.is_current);
                if (currentOption) {
                    const slotEl = document.createElement('div');
                    slotEl.className = 'item-slot development-area'; // Class for specific styling
                    slotEl.className = 'item-slot development-area';
                    slotEl.dataset.slotType = `development_area_${area.id}`;
                    slotEl.dataset.currentId = currentOption.id;
                    slotEl.dataset.slotTitle = area.name; // Название области развития
                    const imgEl = document.createElement('img');
                    imgEl.src = area.icon_path || 'https://via.placeholder.com/50x50/4a4a4a/fff?text=D';
                    slotEl.appendChild(imgEl);
                    const labelEl = document.createElement('span');
                    labelEl.className = 'item-slot-label-small';
                    labelEl.textContent = currentOption.name_display;
                    slotEl.appendChild(labelEl);
                    addTooltipEventsToElement(slotEl, currentOption.name_display, currentOption.effects_summary, null);
                    addTooltipEventsToElement(slotEl, currentOption.name_display, currentOption.effects_summary, null, area.name);
                    slotEl.addEventListener('click', function() { openSidePanelForCategory(this.dataset.slotType, this); });
                    developmentContainer.appendChild(slotEl);
                } else {
                     console.warn(`Для области развития '${area.id}' не найдена активная опция.`);
                }
                } else { console.warn(`Для области развития '${area.id}' не найдена активная опция.`); }
        });
    }

    // Initialize pre-defined HTML slots (Advisors, Corporations)
    document.querySelectorAll('[data-slot-type]').forEach(slotEl => {
        const slotId = slotEl.id || "";
        if (slotId === 'constitutional-principles-container' || slotId === 'development-areas-container' ||
        const slotIdAttr = slotEl.id || "";
        if (slotIdAttr === 'constitutional-principles-container' || slotIdAttr === 'development-areas-container' ||
            slotEl.dataset.slotType === 'ideology_display' || slotEl.dataset.slotType === 'party_display' ||
            slotEl.classList.contains('constitutional-principle') || slotEl.classList.contains('development-area')) {
            return; // Already handled or is a dynamic container/display-only initialized elsewhere
            return;
        }

        const slotType = slotEl.dataset.slotType;
        const currentItemId = slotEl.dataset.currentId;
        let currentItemData = null;
        const slotTitleFromHTML = slotEl.dataset.slotTitle;

        if (currentItemId) {
            if (slotType.startsWith("advisor_")) currentItemData = GAME_DATA.leaders[currentItemId];
            else if (slotType.startsWith("corporation_slot_")) currentItemData = GAME_DATA.corporations[currentItemId];
            if (slotType.startsWith("advisor_")) currentItemData = GAME_DATA.leaders?.[currentItemId];
            else if (slotType.startsWith("corporation_slot_")) currentItemData = GAME_DATA.corporations?.[currentItemId];
        }

        const imgEl = slotEl.querySelector('img');
        const labelEl = slotEl.querySelector('.item-slot-label-small'); // Assuming some item-slots might have labels
        const labelEl = slotEl.querySelector('.item-slot-label-small');

        if (currentItemData && imgEl) {
            imgEl.src = currentItemData.icon_path || currentItemData.portrait_path || 'https://via.placeholder.com/80/ccc/000?text=N/A';
            imgEl.alt = currentItemData.name?.substring(0, 3) || "ICO";
            if(labelEl && slotEl.classList.contains('item-slot') && !slotEl.classList.contains('advisor-portrait-slot')) labelEl.textContent = currentItemData.name_display || currentItemData.name;
            slotEl.classList.add('selected');
            addTooltipEventsToElement(slotEl, currentItemData.name_display || currentItemData.name, currentItemData.tooltip_summary || currentItemData.effects_summary, null);
        } else if (imgEl) { // Slot is empty or data missing
            addTooltipEventsToElement(slotEl, currentItemData.name, currentItemData.tooltip_summary || currentItemData.effects_summary, null, slotTitleFromHTML);
        } else if (imgEl) {
            let emptyIconSrc = 'https://via.placeholder.com/50x50/333/666?text=+';
            if (slotEl.classList.contains('advisor-portrait-slot')) emptyIconSrc = 'https://via.placeholder.com/65x65/333/666?text=+';
            imgEl.src = emptyIconSrc;
            imgEl.alt = "+";
            if(labelEl) labelEl.textContent = "";
            slotEl.classList.remove('selected');
            addTooltipEventsToElement(slotEl, "Назначить / Выбрать", null, null);
            addTooltipEventsToElement(slotEl, null, "Назначить / Выбрать", null, slotTitleFromHTML);
        }
        // Ensure click listener for opening side panel is added to these pre-defined slots
        if(!slotType.includes("_display")) {
        if(!slotType.includes("_display") && !slotEl.getAttribute('listenerAttached')) { // Проверяем, не добавлен ли уже слушатель
           slotEl.addEventListener('click', function() { openSidePanelForCategory(this.dataset.slotType, this); });
           slotEl.setAttribute('listenerAttached', 'true'); // Помечаем, что слушатель добавлен
        }
    });

    // General tooltips for static elements (like focus banner, pie chart if they have data-tooltip)
    document.querySelectorAll('.national-focus-banner, .pie-chart').forEach(el => {
        if(el.dataset.tooltip && !el.dataset.slotType) { // Avoid re-adding if already handled by slot-type logic
        if(el.dataset.tooltip && !el.dataset.slotType && !el.getAttribute('listenerAttached')) {
             addTooltipEventsToElement(el, el.dataset.tooltip, null, null);
             el.setAttribute('listenerAttached', 'true');
        }
    });
}
0 commit comments
Comments
0
 (0)
Comment
You're receiving notifications because you're subscribed to this thread.

Update script.js · HerrRihter/Roman_Republic@07b92a5
