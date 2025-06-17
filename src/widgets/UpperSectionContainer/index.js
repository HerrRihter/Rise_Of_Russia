import './style.css';
import widgets from '../index.js';

export default function UpperSectionContainerWidget(props) {
  const container = document.createElement('div');
  container.className = 'upper-section';

  if (props.children && Array.isArray(props.children)) {
    props.children.forEach(childProps => {
      const widgetName = childProps.$ref?.substring(1);
      const WidgetComponent = widgets[widgetName];
      if (WidgetComponent) {
        const childEl = WidgetComponent({ ...childProps, definitions: props.definitions, state: props.state });
        container.appendChild(childEl);
      }
    });
  }
  return container;
}