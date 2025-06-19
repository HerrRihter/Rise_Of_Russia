import './style.css';
import { addTooltipEvents } from '../../components/Tooltip.js';

export default function LeaderPaneWidget(props) {
  const { definitions, state } = props;

  // Получаем все нужные ID напрямую из game_variables
  const leader_id = state.game_variables?.display_leader_id?.value;
  const ideology_id = state.game_variables?.display_ideology_id?.value;
  const party_id = state.game_variables?.ruling_party_id?.value;

  // Если ключевых данных нет, не рисуем ничего
  if (!leader_id || !party_id) {
    console.warn(`LeaderPane: Не найден leader_id или party_id в game_variables.`);
    return document.createElement('div');
  }

  const leader = definitions.leaders[leader_id];
  const ideology = definitions.ideologies[ideology_id];
  const party = definitions.parties[party_id];

  const mainPane = document.createElement('div');
  mainPane.className = 'leader-pane';

  const portraitDiv = document.createElement('div');
  portraitDiv.className = 'leader-portrait';
  if (leader?.portrait_path) {
    portraitDiv.innerHTML = `<img src="${leader.portrait_path}" alt="${leader.name}">`;
    addTooltipEvents(portraitDiv, leader.name, leader.tooltip_summary, leader.description);
  }

  const nameDiv = document.createElement('div');
  nameDiv.className = 'leader-name';
  nameDiv.textContent = leader ? leader.name : '...';

  const ideologyInfoDiv = document.createElement('div');
  ideologyInfoDiv.className = 'ideology-info';
  const ideologyIconDiv = document.createElement('div');
  ideologyIconDiv.className = 'ideology-icon';
  if (ideology?.icon_path) {
    ideologyIconDiv.innerHTML = `<img src="${ideology.icon_path}" alt="${ideology.name}">`;
    addTooltipEvents(ideologyIconDiv, ideology.name, ideology.effects_summary, ideology.description);
  }
  const ideologyNameDiv = document.createElement('div');
  ideologyNameDiv.className = 'ideology-name';
  ideologyNameDiv.innerHTML = ideology ? (ideology.name_multiline || ideology.name) : '...';
  ideologyInfoDiv.appendChild(ideologyIconDiv);
  ideologyInfoDiv.appendChild(ideologyNameDiv);

  const partyEmblemDiv = document.createElement('div');
  partyEmblemDiv.className = 'party-emblem';
  if (party?.icon_path) {
    partyEmblemDiv.innerHTML = `<img src="${party.icon_path}" alt="${party.name}">`;
    const partiesPopularity = state?.parties_popularity || {};
    const popularity = partiesPopularity[party.id] ?? 0;
    let partyEffects = `Популярность: ${popularity}%`;
    if (party.ideology_tags_rus?.length > 0) {
        partyEffects += `\nИдеологии: ${party.ideology_tags_rus.join(', ')}`;
    }
    addTooltipEvents(partyEmblemDiv, party.name, partyEffects, party.short_description);
  }

  mainPane.appendChild(portraitDiv);
  mainPane.appendChild(nameDiv);
  mainPane.appendChild(ideologyInfoDiv);
  mainPane.appendChild(partyEmblemDiv);

  return mainPane;
}