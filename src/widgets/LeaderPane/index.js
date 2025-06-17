import './style.css';
import { addTooltipEvents } from '../../tooltip.js';

// Эта функция создает пустой плейсхолдер для картинки
function createPlaceholder(width, height) {
  const img = document.createElement('img');
  img.src = `https://via.placeholder.com/${width}x${height}/3a3a3a/666?text=?`;
  return img;
}

export default function LeaderPaneWidget(props) {
  // props.state будет содержать { leader_id, ideology_id, party_id }
  // props.definitions будет содержать все наши справочники (лидеры, партии и т.д.)
  const { state, definitions } = props;

  // Находим полные данные по ID
  const leader = definitions.leaders[state.leader_id];
  const ideology = definitions.ideologies[state.ideology_id];
  const party = definitions.parties[state.party_id];

  // --- Создаем HTML-структуру ---
  const mainPane = document.createElement('div');
  mainPane.className = 'leader-pane';

  // Портрет
  const portraitDiv = document.createElement('div');
  portraitDiv.className = 'leader-portrait';
  if (leader && leader.portrait_path) {
    const img = document.createElement('img');
    img.src = leader.portrait_path;
    portraitDiv.appendChild(img);
  } else {
    portraitDiv.appendChild(createPlaceholder(156, 210));
  }
  
  // Имя
  const nameDiv = document.createElement('div');
  nameDiv.className = 'leader-name';
  nameDiv.textContent = leader ? leader.name : '...';

  // Информация об идеологии
  const ideologyInfoDiv = document.createElement('div');
  ideologyInfoDiv.className = 'ideology-info';
  const ideologyIconDiv = document.createElement('div');
  ideologyIconDiv.className = 'ideology-icon';
  if (ideology && ideology.icon_path) {
    const img = document.createElement('img');
    img.src = ideology.icon_path;
    ideologyIconDiv.appendChild(img);
  }
  const ideologyNameDiv = document.createElement('div');
  ideologyNameDiv.className = 'ideology-name';
  ideologyNameDiv.textContent = ideology ? ideology.name : '...';
  ideologyInfoDiv.appendChild(ideologyIconDiv);
  ideologyInfoDiv.appendChild(ideologyNameDiv);

  // Эмблема партии
  const partyEmblemDiv = document.createElement('div');
  partyEmblemDiv.className = 'party-emblem';
  if (party && party.icon_path) {
    const img = document.createElement('img');
    img.src = party.icon_path;
    partyEmblemDiv.appendChild(img);
  }

  // Собираем все вместе
  mainPane.appendChild(portraitDiv);
  mainPane.appendChild(nameDiv);
  mainPane.appendChild(ideologyInfoDiv);
  mainPane.appendChild(partyEmblemDiv);

    if (leader) {
      addTooltipEvents(portraitDiv, leader.name, leader.tooltip_summary, leader.description);
    }
    if (ideology) {
      addTooltipEvents(ideologyIconDiv, ideology.name, ideology.effects_summary, ideology.description);
    }
    if (party) {
      let partyEffects = `Популярность: ${party.popularity}%\nИдеологии: ${party.ideology_tags_rus.join(', ')}`;
      addTooltipEvents(partyEmblemDiv, party.name, partyEffects, party.short_description);
    }

  return mainPane;
}