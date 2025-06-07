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
        // Если переданы данные для динамического тултипа, используем их
        if (name || effectsSummary || fullDescription) {
            if (name) tooltipContent += `<strong>${name}</strong>`;
            if (effectsSummary) tooltipContent += (name ? "<hr>" : "") + effectsSummary.replace(/\n/g, '<br>');
            if (fullDescription) tooltipContent += (name || effectsSummary ? "<hr>" : "") + "<small>" + fullDescription.replace(/\n/g, '<br>') + "</small>";
        } else {
            // Иначе пытаемся взять из data-tooltip HTML-элемента
            const staticTooltipText = this.dataset.tooltip;
            if (staticTooltipText) {
                tooltipContent = staticTooltipText.replace(/\n/g, '<br>'); // Используем innerHTML, так как data-tooltip может содержать HTML
            }
        }

        if (tooltipContent) {
            tooltipElement.innerHTML = tooltipContent; // innerHTML, чтобы теги <br>, <strong> и т.д. работали
            tooltipElement.style.display = 'block';
            positionTooltip(event);
        } else {
            tooltipElement.style.display = 'none';
        }
    });
    element.addEventListener('mousemove', positionTooltip);
    element.addEventListener('mouseleave', function() { tooltipElement.style.display = 'none'; });
}

// ЗАХАРДКОЖЕННЫЕ ДАННЫЕ ДЛЯ ИДЕОЛОГИИ - ЭТОТ БЛОК ПОЛНОСТЬЮ УДАЛЯЕМ
// const HARDCODED_IDEOLOGY_DATA = { ... };

// --- Balance Modal Logic ---
const balanceModal = document.getElementById('balanceModal');
// ... (остальная логика Balance Modal без изменений) ...

// --- Game Data Loading and Management ---
const GAME_DATA = { leaders: {}, constitutional_principles: {}, development_areas: {}, corporations: {}, parties: {}, national_spirits: {} }; // Убрано ideologies
const ALL_DATA_FILES_TO_LOAD = [
    "history/leaders.json",
    "history/constitutional_principles.json",
    "history/development_areas.json",
    "history/corporations.json",
    // "history/ideologies.json", // УБРАНО
    "history/parties.json",
    "history/national_spirits.json"
];

// ... (loadJsonFile остается без изменений) ...

async function initializeGameData() {
    const loadPromises = ALL_DATA_FILES_TO_LOAD.map(async (filePath) => {
        const data = await loadJsonFile(filePath);
        if (!data) return;

        if (filePath.endsWith('leaders.json') && data.options) { GAME_DATA.leaders = {}; data.options.forEach(l => GAME_DATA.leaders[l.id] = l); }
        else if (filePath.endsWith('constitutional_principles.json') && data.principles) { GAME_DATA.constitutional_principles = {}; data.principles.forEach(p => {if(p.id)GAME_DATA.constitutional_principles[p.id] = p;}); }
        else if (filePath.endsWith('development_areas.json') && data.areas) { GAME_DATA.development_areas = {}; data.areas.forEach(a => {if(a.id)GAME_DATA.development_areas[a.id] = a;}); }
        else if (filePath.endsWith('corporations.json') && data.options) { GAME_DATA.corporations = {}; data.options.forEach(c => GAME_DATA.corporations[c.id] = c); }
        // БЛОК ДЛЯ ideologies.json УДАЛЕН
        else if (filePath.endsWith('parties.json') && data.options) { GAME_DATA.parties_array = data.options; GAME_DATA.parties = {}; data.options.forEach(p => GAME_DATA.parties[p.id] = p); }
        else if (filePath.endsWith('national_spirits.json') && data.options) { GAME_DATA.national_spirits = {}; data.options.forEach(s => GAME_DATA.national_spirits[s.id] = s); }
    });
    await Promise.all(loadPromises);
    console.log("Игровые данные загружены:", GAME_DATA);
    initializeUI();
}

// --- Side Panel Logic (остается без изменений) ---
// ...

// --- Party Politics UI (остается без изменений) ---
// ...

// --- UI Initialization Function ---
function initializeUI() {
    // Leader (остается без изменений)
    // ...

    // Ideology - ТЕПЕРЬ НЕ ИНИЦИАЛИЗИРУЕТСЯ ЗДЕСЬ ИЗ JS, так как данные в HTML
    // const ideologyIconContainer = document.querySelector('.ideology-info .ideology-icon');
    // if (ideologyIconContainer && ideologyIconContainer.dataset.tooltip) {
    //     // Функция addTooltipEventsToElement будет вызвана для него в общем цикле ниже
    // }

    // Party Emblem (Ruling Party) - (остается без изменений, но убедитесь, что НЕ ПЕРЕЗАПИСЫВАЕТ data-tooltip если он есть в HTML)
    const rulingPartyId = "united_russia"; // TODO: Should be dynamic
    const partyData = GAME_DATA.parties?.[rulingPartyId];
    const partyEmblemContainer = document.querySelector('.party-emblem');
    const partyEmblemEl = partyEmblemContainer?.querySelector('img');
     if (partyData && partyEmblemEl && partyEmblemContainer) {
        partyEmblemEl.src = partyData.icon_path || 'https://via.placeholder.com/45/666/fff?text=Pty';
        // Если у partyEmblemContainer есть свой data-tooltip в HTML, который вы хотите использовать,
        // то либо не вызывайте addTooltipEventsToElement, либо передайте null в качестве аргументов.
        // Либо, если JS должен формировать тултип для партии:
        addTooltipEventsToElement(partyEmblemContainer, partyData.name,
            `Популярность: ${partyData.popularity}%\n${partyData.ideology_tags_rus ? 'Идеологии: ' + partyData.ideology_tags_rus.join(', ') : ''}`,
            partyData.short_description);
        // Если вы НЕ хотите, чтобы JS формировал тултип для партии (а хотите HTML data-tooltip), то закомментируйте строку выше
        // и убедитесь, что у .party-emblem в HTML есть data-tooltip.
    }

    // ... (National Spirits, Political Parties Chart and List, Constitutional Principles, Development Areas - остаются) ...
    // ... (Initialize pre-defined HTML slots for Advisors, Corporations - остаются) ...

    // General tooltips for elements with data-tooltip
    // Этот цикл должен обработать и .ideology-icon, если у него есть data-tooltip в HTML.
    document.querySelectorAll('[data-tooltip]').forEach(el => {
        // Добавим проверку, чтобы не перезаписывать тултипы, установленные более специфичной логикой,
        // если такая специфичная логика передает все три аргумента (name, effectsSummary, fullDescription)
        // Однако, для data-slot-type элементов, мы УЖЕ вызываем addTooltipEventsToElement.
        // Для простоты, если у элемента есть data-tooltip и для него НЕ была явно вызвана addTooltipEventsToElement с JS-данными,
        // то эта функция будет использована для отображения HTML-тултипа.

        // Проверим, не инициализировали ли мы его уже как data-slot-type с JS-данными.
        // Если элемент НЕ ЯВЛЯЕТСЯ слотом, которому мы строим тултип из GAME_DATA,
        // то для него можно смело применить addTooltipEventsToElement(el, null, null, null).
        const isSpecialSlot = el.dataset.slotType && !el.dataset.slotType.includes('_display'); // Примерный фильтр
        const isIdeologyOrPartyDisplay = el.dataset.slotType === 'ideology_display' || el.dataset.slotType === 'party_display';

        if (!(isSpecialSlot && !isIdeologyOrPartyDisplay) ) { // Если это не слот с данными из GAME_DATA или это display-слот
            if(el.dataset.tooltip){ // Убедимся что data-tooltip существует
                addTooltipEventsToElement(el, null, null, null);
            }
        }
    });
}

// --- Start Application ---
document.addEventListener('DOMContentLoaded', initializeGameData);
