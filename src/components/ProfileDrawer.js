import './ProfileDrawer.css';
import { marked } from 'marked';

const ABILITIES_LABELS = {
  can_enact_advisors: 'Может менять советников',
  can_influence_party: 'Может влиять на партии',
  // Добавьте другие ключи по необходимости
};

export function ProfileDrawer({ profile, leader, onClose }) {
  const drawer = document.createElement('div');
  drawer.className = 'profile-drawer';

  // Имя
  const nameDiv = document.createElement('div');
  nameDiv.className = 'profile-drawer-name';
  nameDiv.textContent = profile?.displayName || profile?.name || 'Пользователь';
  drawer.appendChild(nameDiv);

  // Портрет
  const portraitDiv = document.createElement('div');
  portraitDiv.className = 'profile-drawer-portrait';
  const portraitUrl = leader?.portrait_path || '/default_avatar.png';
  portraitDiv.innerHTML = `<img src="${portraitUrl}" alt="Портрет">`;
  drawer.appendChild(portraitDiv);

  // Список abilities (выше био)
  if (profile?.abilities) {
    const abilitiesDiv = document.createElement('div');
    abilitiesDiv.className = 'profile-drawer-abilities';
    abilitiesDiv.innerHTML = '<strong>Способности:</strong>';
    const ul = document.createElement('ul');
    for (const key in profile.abilities) {
      if (profile.abilities[key]) {
        const li = document.createElement('li');
        li.textContent = ABILITIES_LABELS[key] || key;
        ul.appendChild(li);
      }
    }
    abilitiesDiv.appendChild(ul);
    drawer.appendChild(abilitiesDiv);
  }

  // Био только из profile, без заголовка
  if (profile?.bio) {
    const bioDiv = document.createElement('div');
    bioDiv.className = 'profile-drawer-bio';
    // Преобразуем Markdown в HTML
    const bioHtml = marked.parse(profile.bio);
    bioDiv.innerHTML = bioHtml;
    drawer.appendChild(bioDiv);
  }

  return drawer;
} 