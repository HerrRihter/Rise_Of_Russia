import './style.css';
import { addTooltipEvents } from '../../components/Tooltip.js';

// Этот виджет будет создавать контейнер для всех пользовательских ресурсов
export default function UserResourcesBarWidget(props) {
  const { state } = props;
  const politicalPower = state.profile?.political_power ?? '...';

  const bar = document.createElement('div');
  bar.className = 'user-resources-bar';

  // Создаем элемент для Политических Очков
  const ppElement = document.createElement('div');
  ppElement.className = 'resource-item';
  ppElement.innerHTML = `
    <span class="resource-icon pp-icon"></span>
    <span class="resource-value">${politicalPower}</span>
  `;
  addTooltipEvents(ppElement, "Политические очки", "Ваш основной ресурс для принятия решений и влияния на политическую жизнь страны.", null);

  bar.appendChild(ppElement);

  // В будущем сюда можно будет добавлять другие ресурсы:
  // const anotherResourceElement = document.createElement('div');
  // ...
  // bar.appendChild(anotherResourceElement);

  return bar;
}