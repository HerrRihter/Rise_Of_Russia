import './style.css';

export default function DemoChartWidget(props) {
  const el = document.createElement('div');
  el.className = 'widget demo-chart-widget';

  const labelEl = document.createElement('h3');
  labelEl.textContent = props.label || 'DemoChartWidget';

  el.appendChild(labelEl);

  return el;
}
