import './style.css';
import { db } from '../../firebaseClient.js';
import { collection, getDocs, doc, updateDoc, increment, arrayUnion } from "firebase/firestore";
import { addTooltipEvents } from '../../components/Tooltip.js';

// --- Constants ---
const ICONS_PATH = 'public/history/diplomacy_icons/';

// --- Main Widget Function ---
export default function InteractiveMapWidget(props) {
    // Проверяем, есть ли у пользователя право на действия за границей.
    // Если права нет, виджет не будет отрисован.
    if (props.state?.profile?.abilities?.can_action_abroad !== true) {
        return document.createComment('Interactive Map hidden due to insufficient permissions.');
    }

    const outerContainer = document.createElement('div');
    outerContainer.className = 'interactive-map-outer-container';

    const toggleButton = document.createElement('button');
    toggleButton.className = 'widget-toggle-button';
    toggleButton.textContent = 'Интерактивная карта Ближнего Востока';
    outerContainer.appendChild(toggleButton);
    
    // const { definitions, state } = props; // Props can be used later
    const widgetContainer = document.createElement('div');
    // Добавляем класс 'collapsed', чтобы карта была свернута по умолчанию.
    widgetContainer.className = 'interactive-map-widget collapsed';
    outerContainer.appendChild(widgetContainer);

    toggleButton.addEventListener('click', () => {
        widgetContainer.classList.toggle('collapsed');
        toggleButton.classList.toggle('active');
    });

    // --- State Management ---
    let allCountriesData = new Map();
    let allStatusDefinitions = new Map();

    // --- HTML Structure ---
    widgetContainer.innerHTML = `
        <div class="main-container">
            <div id="mapContainer" class="map-container">
                <p class="loading-text">Загрузка карты...</p>
            </div>
            <aside id="country-sidebar" class="country-sidebar">
                <h2>Обзор стран</h2>
                <ul id="country-list" class="country-list"></ul>
            </aside>
        </div>
        <div id="countryModal" class="modal">
            <div class="modal-content">
                <span class="close-button">&times;</span>
                <div id="modalCountryDetails"></div>
            </div>
        </div>
    `;

    // --- Element References ---
    const mapContainer = widgetContainer.querySelector('#mapContainer');
    const countryList = widgetContainer.querySelector('#country-list');
    const modal = widgetContainer.querySelector('#countryModal');
    const modalDetails = widgetContainer.querySelector('#modalCountryDetails');
    const closeButton = widgetContainer.querySelector('.close-button');
    
    // --- Data ---
    const countryIdToName = {
        'Turquie': 'Турция', 'Syrie': 'Сирия', 'Jordanie': 'Иордания', 'Liban': 'Ливан',
        'Israel': 'Израиль', 'Koweit': 'Кувейт', 'Qatar': 'Катар', 'Yemen': 'Йемен',
        'Oman': 'Оман', 'Irak': 'Ирак', 'Iran': 'Иран', 'Egypte': 'Египет',
        'Soudan': 'Судан', 'Lybie': 'Ливия', 'Arabie_Saoudite': 'Саудовская Аравия', 'Emirats_Arabes_Unis': 'ОАЭ'
    };

    const flagMapping = {
        'Turquie': 'tr', 'Syrie': 'sy', 'Jordanie': 'jo', 'Liban': 'lb', 'Israel': 'il', 'Koweit': 'kw',
        'Qatar': 'qa', 'Yemen': 'ye', 'Oman': 'om', 'Irak': 'iq', 'Iran': 'ir', 'Egypte': 'eg',
        'Soudan': 'sd', 'Lybie': 'ly', 'Arabie_Saoudite': 'sa', 'Emirats_Arabes_Unis': 'ae'
    };

    // --- Helper Functions ---
    function getInfluenceColor(influence) {
        if (influence <= 0) return '#e0e0e0';
        if (influence <= 5) return '#aed6f1';
        if (influence <= 10) return '#5dade2';
        if (influence <= 20) return '#3498db';
        return '#21618c';
    }

    function getCountryFlagCode(countryId) {
        return flagMapping[countryId] || 'un';
    }

    function updateMapColors() {
        allCountriesData.forEach((data, countryId) => {
            const countryPath = widgetContainer.querySelector(`#${countryId}`);
            if (countryPath) {
                countryPath.style.fill = getInfluenceColor(data.influence);
            }
        });
    }

    function updateCountrySidebar() {
        const influenceIcon = `<img src="public/history/icons/political_power.png" class="country-stat-icon" alt="Influence">`;
        const intelligenceIcon = `<img src="public/history/icons/Solar.png" class="country-stat-icon" alt="Intelligence">`;
        const relationsIcon = `<img src="public/history/icons/Lunar.png" class="country-stat-icon" alt="Relations">`;
        const sortedCountries = [...allCountriesData.entries()].sort((a, b) => (countryIdToName[a[0]] || a[0]).localeCompare(countryIdToName[b[0]] || b[0]));
        
        countryList.innerHTML = sortedCountries.map(([countryId, data]) => `
            <li class="country-list-item" id="sidebar-item-${countryId}">
                <span class="country-name">${countryIdToName[countryId] || countryId}</span>
                <div class="country-stat" title="Влияние">${influenceIcon}<span class="country-stat-value">${data.influence || 0}</span></div>
                <div class="country-stat" title="Разведданные">${intelligenceIcon}<span class="country-stat-value">${data.intelligence || 0}</span></div>
                <div class="country-stat" title="Отношения">${relationsIcon}<span class="country-stat-value">${data.relations || 0}</span></div>
            </li>
        `).join('');
    }

    function updateStatusIcons() {
        const iconSize = 7;
        const iconPadding = 1;
        allCountriesData.forEach((data, countryId) => {
            const countryPath = widgetContainer.querySelector(`#${countryId}`);
            const iconGroup = widgetContainer.querySelector(`#icons-${countryId}`);
            if (!countryPath || !iconGroup) return;
            iconGroup.innerHTML = '';
            if (!data.statuses) return;
            const activeStatuses = Object.keys(data.statuses).filter(key => data.statuses[key] === true);
            if (activeStatuses.length > 0) {
                try {
                    const bbox = countryPath.getBBox();
                    let currentX = bbox.x + bbox.width - iconPadding;
                    const y = bbox.y + iconPadding;
                    activeStatuses.forEach(statusKey => {
                        const statusDef = allStatusDefinitions.get(statusKey);
                        if (statusDef) {
                            currentX -= iconSize;
                            const icon = document.createElementNS("http://www.w3.org/2000/svg", "image");
                            icon.setAttributeNS(null, 'href', `${ICONS_PATH}${statusDef.icon}`);
                            icon.setAttributeNS(null, 'x', currentX);
                            icon.setAttributeNS(null, 'y', y);
                            icon.setAttributeNS(null, 'width', iconSize);
                            icon.setAttributeNS(null, 'height', iconSize);
                            icon.classList.add('status-icon');
                            const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
                            title.textContent = statusDef.name;
                            icon.appendChild(title);
                            iconGroup.appendChild(icon);
                            currentX -= iconPadding;
                        }
                    });
                } catch (e) {
                    // BBox can fail on hidden/non-rendered elements. It's fine to ignore.
                }
            }
        });
    }

    function displayCountryData(countryData, actionsData) {
        const historyHtml = countryData.history && countryData.history.length > 0 ? countryData.history.map(h => `<div class="history-item"><strong>Ход ${h.turn}:</strong> ${h.action} - <em>${h.details}</em></div>`).join('') : '<p>Нет записей в истории.</p>';
        const activeStatuses = countryData.statuses ? Object.keys(countryData.statuses).filter(key => countryData.statuses[key] === true) : [];
        const statusesHtml = activeStatuses.length > 0 ? activeStatuses.map(key => {
            const status = allStatusDefinitions.get(key);
            return status ? `<div class="status-item" title="${status.name}"><img src="${ICONS_PATH}${status.icon}" class="status-icon-modal" alt="${status.name}"><span>${status.name}</span></div>` : '';
        }).join('') : '<p>Нет активных статусов.</p>';
        const actionsHtml = actionsData.map(action => `<button class="action-button" data-action-id="${action.id}">${action.name}</button>`).join('');

        modalDetails.innerHTML = `
            <div class="country-header">
                <div class="country-flag"><img src="https://flagcdn.com/w80/${getCountryFlagCode(countryData.id)}.png" alt="Флаг ${countryData.name}"></div>
                <div class="country-info"><h3>${countryData.name}</h3><p>Страна Ближнего Востока</p></div>
            </div>
            <div class="info-grid">
                <div class="info-item"><h4>Влияние</h4><p id="modal-influence-value">${countryData.influence || 0}</p></div>
                <div class="info-item"><h4>Разведданные</h4><p id="modal-intelligence-value">${countryData.intelligence || 0}</p></div>
                <div class="info-item"><h4>Отношения</h4><p id="modal-relations-value">${countryData.relations || 0}</p></div>
            </div>
            <div class="actions-container"><h4>Доступные действия</h4>${actionsHtml}</div>
            <div class="status-container"><h4>Статусы</h4><div class="status-list">${statusesHtml}</div></div>
            <div class="history-container"><h4>История действий</h4><div class="history-log" id="modal-history-log">${historyHtml}</div></div>
        `;

        modalDetails.querySelectorAll('.action-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const actionId = e.target.getAttribute('data-action-id');
                const action = actionsData.find(a => a.id === actionId);
                handleActionClick(countryData, action, actionsData);
            });
        });
    }

    async function openModal(countryId, countryName) {
        modal.style.display = 'block';
        const countryData = allCountriesData.get(countryId);
        if (countryData) {
            // Fetch actions dynamically when modal opens
            const actionsSnapshot = await getDocs(collection(db, "middleEastActions"));
            const actionsData = actionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            displayCountryData(countryData, actionsData);
        } else {
            modalDetails.innerHTML = `<p>Данные для страны ${countryName} не найдены.</p>`;
        }
    }

    async function handleActionClick(country, action, allActions) {
        const countryDataForUpdate = allCountriesData.get(country.id);
        if (!countryDataForUpdate) {
            console.error("Map Widget: Cannot find country data to update.");
            return;
        }
        
        modalDetails.querySelectorAll('.action-button').forEach(b => b.disabled = true);
        try {
            const countryDocRef = doc(db, "middleEastCountries", country.id);
            const newHistoryItem = { turn: 1, action: action.name, details: `Действие "${action.name}" успешно выполнено.` }; // Placeholder for turn
            
            await updateDoc(countryDocRef, {
                influence: increment(action.effects.influence || 0),
                intelligence: increment(action.effects.intelligence || 0),
                relations: increment(action.effects.relations || 0),
                history: arrayUnion(newHistoryItem)
            });
            
            // Update local state
            const newInfluence = (countryDataForUpdate.influence || 0) + (action.effects.influence || 0);
            const newIntelligence = (countryDataForUpdate.intelligence || 0) + (action.effects.intelligence || 0);
            const newRelations = (countryDataForUpdate.relations || 0) + (action.effects.relations || 0);
            countryDataForUpdate.influence = newInfluence;
            countryDataForUpdate.intelligence = newIntelligence;
            countryDataForUpdate.relations = newRelations;
            if (!countryDataForUpdate.history) countryDataForUpdate.history = [];
            countryDataForUpdate.history.push(newHistoryItem);

            // Update UI
            modalDetails.querySelector('#modal-influence-value').textContent = newInfluence;
            modalDetails.querySelector('#modal-intelligence-value').textContent = newIntelligence;
            modalDetails.querySelector('#modal-relations-value').textContent = newRelations;
            const historyLogEl = modalDetails.querySelector('#modal-history-log');
            if (historyLogEl.querySelector('p')) historyLogEl.innerHTML = '';
            const newHistoryEl = document.createElement('div');
            newHistoryEl.classList.add('history-item');
            newHistoryEl.innerHTML = `<strong>Ход ${newHistoryItem.turn}:</strong> ${newHistoryItem.action} - <em>${newHistoryItem.details}</em>`;
            historyLogEl.appendChild(newHistoryEl);
            historyLogEl.scrollTop = historyLogEl.scrollHeight;

            // Re-render map and sidebar
            updateMapColors();
            updateCountrySidebar();
            updateStatusIcons();
        } catch (error) {
            console.error("Map Widget: Firestore update failed:", error);
            alert(`Не удалось выполнить действие: ${error.message}`);
        } finally {
            modalDetails.querySelectorAll('.action-button').forEach(b => b.disabled = false);
        }
    }

    function closeModal() {
        modal.style.display = 'none';
    }

    function makeCountriesInteractive(svg) {
        Object.keys(countryIdToName).forEach(countryId => {
            const countryPath = svg.querySelector(`#${countryId}`);
            if (countryPath) {
                const iconGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
                iconGroup.id = `icons-${countryId}`;
                iconGroup.classList.add('status-icons-group');
                svg.appendChild(iconGroup);
                countryPath.removeAttribute('style');
                countryPath.classList.add('country-region');
                countryPath.addEventListener('click', () => openModal(countryId, countryIdToName[countryId]));
            } else {
                console.warn(`Map Widget: Path for ${countryId} not found in SVG.`);
            }
        });
    }

    async function loadMap() {
        try {
            const response = await fetch('public/history/MiddleEastMap.svg');
            if (!response.ok) throw new Error(`Network response was not ok`);
            const svgText = await response.text();
            mapContainer.innerHTML = svgText;
            makeCountriesInteractive(mapContainer.querySelector('svg'));
        } catch (error) {
            console.error('Map Widget: Error loading SVG:', error);
            mapContainer.innerHTML = `<p style="color:red;">Ошибка загрузки SVG карты.</p>`;
        }
    }
    
    async function loadInitialData() {
        try {
            const [countriesSnapshot, statusesSnapshot] = await Promise.all([
                getDocs(collection(db, "middleEastCountries")),
                getDocs(collection(db, "middleEastStatuses"))
            ]);
            countriesSnapshot.forEach(doc => allCountriesData.set(doc.id, doc.data()));
            statusesSnapshot.forEach(doc => allStatusDefinitions.set(doc.id, doc.data()));
            
            await loadMap(); // Load map after data is ready
            
            updateMapColors();
            updateCountrySidebar();
            updateStatusIcons();
        } catch (e) {
            console.error("Map Widget: Failed to load initial data:", e);
            mapContainer.innerHTML = `<p style="color:red;">Ошибка загрузки данных для карты.</p>`;
        }
    }

    // --- Initial Load & Event Listeners ---
    loadInitialData();
    closeButton.addEventListener('click', closeModal);
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    return outerContainer;
} 