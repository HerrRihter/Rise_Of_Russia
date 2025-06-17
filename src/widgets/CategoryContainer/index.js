import './style.css';
import widgets from '../index.js'; // Импортируем реестр, чтобы вызывать дочерние виджеты

export default function CategoryContainerWidget(props) {
  const { definitions } = props;

  const container = document.createElement('div');
  container.className = 'category-block';

  container.innerHTML = `
    <div class="category-header">${props.title || 'Категория'}</div>
    <div class="category-items"></div>
  `;

  const itemsContainer = container.querySelector('.category-items');

  if (props.children && itemsContainer) {
    props.children.forEach(childProps => {
      const widgetName = childProps.$ref?.substring(1);
      const WidgetComponent = widgets[widgetName];

      if (WidgetComponent) {
        // Передаем дочернему виджету все его свойства И общие справочники
        const childWidgetEl = WidgetComponent({ ...childProps, definitions });
        itemsContainer.appendChild(childWidgetEl);
      }
    });
  }

  return container;
}