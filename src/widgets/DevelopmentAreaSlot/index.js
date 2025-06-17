import './style.css';
import { addTooltipEvents } from '../../tooltip.js';
import { openSidePanel } from '../../sidePanel.js';

export default function DevelopmentAreaSlotWidget(props) {
    const { definitions, state, type } = props;
    const areaDef = definitions.development_areas[type];
    const areaState = state.development_areas_state[type];

    const wrapper = document.createElement('div');
    wrapper.className = 'development-area-wrapper';

    function updateView(levelId) {
        const currentLevel = areaDef?.levels?.[levelId];
        if (!areaDef || !currentLevel) {
            wrapper.textContent = `Ошибка: область ${type} не найдена`;
            return;
        }
        const current_progress = areaState?.current_progress || 0;
        const progressPerLevel = areaDef.progress_per_level || 100;
        const progressPercentage = (current_progress / progressPerLevel) * 100;
        wrapper.innerHTML = `
            <div class="development-area-slot">
                <img src="${currentLevel.icon_path}" alt="${areaDef.name}">
                <span class="item-slot-label-small">${currentLevel.name_display}</span>
            </div>
            <div class="dev-progress-bar-container">
                <div class="dev-progress-bar-fill" style="width: ${progressPercentage}%;"></div>
                <span class="dev-progress-bar-text">${current_progress}/${progressPerLevel}</span>
            </div>
        `;
        const tooltipEffects = `Прогресс: ${current_progress}/${progressPerLevel}\n${currentLevel.effects_summary || ''}`;
        addTooltipEvents(wrapper.querySelector('.development-area-slot'), areaDef.name, tooltipEffects, currentLevel.description);
    }

    wrapper.addEventListener('click', () => {
        if (!areaDef || !areaDef.levels) return;
        const title = `Выбор уровня: ${areaDef.name}`;
        const options = Object.values(areaDef.levels);
        const onSelect = (selectedId) => {
            console.log(`Для области '${type}' выбран уровень: ${selectedId}`);
            if(state.development_areas_state[type]) {
                state.development_areas_state[type].current_level_id = selectedId;
            }
            updateView(selectedId);
        };
        openSidePanel(title, options, onSelect, 'icon-style');
    });

    updateView(areaState?.current_level_id);
    return wrapper;
}