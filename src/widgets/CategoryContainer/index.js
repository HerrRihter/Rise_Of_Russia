import './style.css';
import widgets from '../index.js';

export default function CategoryContainerWidget(props) {
  const { definitions, state, title, children } = props;

  const container = document.createElement('div');
  container.className = 'category-block';

  const header = document.createElement('div');
  header.className = 'category-header';
  header.textContent = title || 'Категория';
  container.appendChild(header);

  const itemsContainer = document.createElement('div');
  itemsContainer.className = 'category-items';
  container.appendChild(itemsContainer);

  if (children && Array.isArray(children)) {
    children.forEach(childProps => {
      const widgetName = childProps.$ref?.substring(1);
      const WidgetComponent = widgets[widgetName];
      if (WidgetComponent) {
        const childWidgetEl = WidgetComponent({ ...childProps, definitions, state });
        itemsContainer.appendChild(childWidgetEl);
      }
    });
  }
  return container;
}