import './style.css';
import { addTooltipEvents } from '../../components/Tooltip.js';
import { openSidePanel } from '../../sidePanel.js';

export default function DevelopmentAreaSlotWidget(props) {
    const { definitions, state, type } = props;
    const areaDef = definitions.development_areas[type];
    const developmentAreasState = state?.development_areas_state || {};
    const areaState = developmentAreasState[type];

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
                <img src="${currentLevel.icon_path}" alt="${currentLevel.name_display}">
            </div>
            <div class="dev-progress-bar-container">
                <div class="dev-progress-bar-fill" style="width: ${progressPercentage}%;"></div>
                <span class="dev-progress-bar-text">${current_progress}/${progressPerLevel}</span>
            </div>
            <div class="development-area-title">${areaDef.name}</div>
        `;
        const tooltipTitle = currentLevel.name_display;
        const tooltipEffects = `Прогресс: ${current_progress}/${progressPerLevel}\n${currentLevel.effects_summary || ''}`;
        addTooltipEvents(wrapper.querySelector('.development-area-slot'), tooltipTitle, tooltipEffects, currentLevel.description);
    }

    wrapper.addEventListener('click', (event) => {
        if (!event.isTrusted) return;
        if (!areaDef || !areaDef.levels) return;
        const title = `Выбор уровня: ${areaDef.name}`;
        const options = Object.values(areaDef.levels).sort((a, b) => {
            const getLevelNum = (level) => {
                const match = level.id.match(/(\d+)$/);
                return match ? parseInt(match[1], 10) : 0;
            };
            return getLevelNum(a) - getLevelNum(b);
        });
        const onSelect = (selectedId) => {
            console.log(`Для области '${type}' выбран уровень: ${selectedId}`);
            if (state.development_areas_state && state.development_areas_state[type]) {
                state.development_areas_state[type].current_level_id = selectedId;
            }
            updateView(selectedId);
        };
        openSidePanel(title, options, onSelect, 'icon-style');
    });

    updateView(areaState?.current_level_id);
    return wrapper;
}