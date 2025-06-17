import widgets from './widgets/index.js';

export function renderDashboard(container, data, definitions) {
  // --- ОТЛАДОЧНЫЙ ВЫВОД ---
  console.log("Данные, полученные рендерером:");
  console.log("State и Layout:", data);
  console.log("Справочники (Definitions):", definitions);
  // --------------------------

  container.innerHTML = '';

  // --- Верхняя секция ---
  const upperSection = document.createElement('div');
  upperSection.className = 'upper-section';

  const LeaderPaneWidget = widgets['leader-pane'];
  if (LeaderPaneWidget && data.leader_pane_state) {
    upperSection.appendChild(LeaderPaneWidget({ state: data.leader_pane_state, definitions }));
  }

  const NationalInfoPaneWidget = widgets['national-info-pane'];
  if (NationalInfoPaneWidget && data.national_info_state) {
    upperSection.appendChild(NationalInfoPaneWidget({
      state: data.national_info_state,
      ruling_party_id: data.leader_pane_state.party_id,
      definitions
    }));
  }
  container.appendChild(upperSection);

  // --- Нижняя секция ---
  const lowerSection = document.createElement('div');
  lowerSection.className = 'lower-section';
  if (data.layout) {
    data.layout.forEach(categoryProps => {
      const widgetName = categoryProps.$ref?.substring(1);
      const WidgetComponent = widgets[widgetName];
      if (WidgetComponent) {
        const categoryEl = WidgetComponent({ ...categoryProps, definitions });
        lowerSection.appendChild(categoryEl);
      }
    });
  }
  container.appendChild(lowerSection);
}