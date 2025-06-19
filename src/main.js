import './style.css';
import { renderDashboard } from './renderer.js';
import { ensureTooltipExists } from './components/Tooltip.js';
import { initModal } from './modal.js';
import { initSidePanel } from './sidePanel.js';
import { onAuthStateChanged } from './auth.js';
import { getFirestore, collection, getDocs, getDoc, doc, onSnapshot } from 'firebase/firestore';
import { firebaseApp } from './firebaseClient.js';
import { ProfileDrawer } from './components/ProfileDrawer.js';

function arrayToIdObject(array, key = 'id') {
  if (!Array.isArray(array)) return {};
  return Object.fromEntries(array.map(item => [item[key], item]));
}

let definitions = {};
let state = {};
let currentUser = null;
const appContainer = document.getElementById('app');
const db = getFirestore(firebaseApp);

function reRenderApp() {
  if (appContainer) {
    // Удаляем старую панель профиля, если есть
    const oldDrawer = document.querySelector('.profile-drawer');
    if (oldDrawer) oldDrawer.remove();
    const oldBtn = document.querySelector('.profile-drawer-open-btn');
    if (oldBtn) oldBtn.remove();

    renderDashboard(appContainer, state, definitions, currentUser);

    // Добавляем вертикальную кнопку для открытия панели профиля
    const openBtn = document.createElement('button');
    openBtn.className = 'profile-drawer-open-btn';
    openBtn.innerHTML = '☰';
    openBtn.title = 'Профиль';
    openBtn.style.position = 'fixed';
    openBtn.style.top = '50%';
    openBtn.style.left = '0';
    openBtn.style.transform = 'translateY(-50%)';
    openBtn.style.width = '32px';
    openBtn.style.height = '80px';
    openBtn.style.background = '#232323';
    openBtn.style.color = '#ffd700';
    openBtn.style.border = '1.5px solid #444';
    openBtn.style.borderRadius = '0 8px 8px 0';
    openBtn.style.zIndex = '1200';
    openBtn.style.cursor = 'pointer';
    openBtn.style.fontSize = '1.5em';
    openBtn.style.display = 'flex';
    openBtn.style.alignItems = 'center';
    openBtn.style.justifyContent = 'center';
    openBtn.style.boxShadow = '2px 0 8px rgba(0,0,0,0.18)';
    document.body.appendChild(openBtn);

    openBtn.onclick = () => {
      // Получаем профиль и лидера (если есть leader_id)
      const profile = state.profile || {};
      let leader = null;
      if (profile.leader_id && definitions.leaders && definitions.leaders[profile.leader_id]) {
        leader = definitions.leaders[profile.leader_id];
      }
      // Создаём и показываем панель
      const drawer = ProfileDrawer({
        profile,
        leader,
        onClose: () => {
          drawer.remove();
          openBtn.style.display = 'flex';
        }
      });
      document.body.appendChild(drawer);
      openBtn.style.display = 'none';
    };
  }
}

function subscribeToStateAndProfile(user, onUpdate) {
  const db = getFirestore(firebaseApp);
  const stateDocRef = doc(db, 'state', 'main');
  let unsubProfile = null;

  // Подписка на state/main
  const unsubState = onSnapshot(stateDocRef, (stateSnap) => {
    if (!stateSnap.exists()) return;
    const stateData = stateSnap.data();
    let userProfile = null;
    if (user) {
      const profileDocRef = doc(db, 'profiles', user.uid);
      if (unsubProfile) unsubProfile();
      unsubProfile = onSnapshot(profileDocRef, (profileSnap) => {
        userProfile = profileSnap.exists() ? profileSnap.data() : null;
        state = {
          ...state,
          ...stateData,
          profile: userProfile,
        };
        onUpdate();
      });
    } else {
      state = {
        ...state,
        ...stateData,
        profile: null,
      };
      onUpdate();
    }
  });
  return () => {
    unsubState();
    if (unsubProfile) unsubProfile();
  };
}

let unsubscribeStateProfile = null;

async function fetchInitialData() {
  console.log("Загрузка первоначальных данных (справочников и layout) из Firestore...");
  const collectionsToFetch = [
    'leaders', 'ideologies', 'parties', 'corporations',
    'constitutional_principles', 'development_areas',
    'focus_tree_nodes', 'national_spirits', 'national_focus_data', 'layout'
  ];
  const results = {};
  for (const col of collectionsToFetch) {
    const snap = await getDocs(collection(db, col));
    results[col] = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  // Преобразуем данные в definitions
  const principles = arrayToIdObject(results['constitutional_principles']);
  definitions = {
    leaders: arrayToIdObject(results['leaders']),
    ideologies: arrayToIdObject(results['ideologies']),
    parties: arrayToIdObject(results['parties']),
    parties_array: results['parties'] || [],
    corporations: arrayToIdObject(results['corporations']),
    constitutional_principles: principles,
    development_areas: arrayToIdObject(results['development_areas']),
    national_focus_tree: arrayToIdObject(results['focus_tree_nodes']),
    national_spirits: arrayToIdObject(results['national_spirits']),
    national_focus_data: arrayToIdObject(results['national_focus_data']),
    layout: results['layout'] || []
  };

  // В state сохраняем только layout (остальное загрузим в подписке)
  state = {
    dashboardTitle: "Политический интерфейс",
    layout: definitions.layout
  };
}

async function main() {
  initModal();
  initSidePanel();
  if (!appContainer) return;

  appContainer.innerHTML = `<div style="color:gray;padding:20px;">Загрузка...</div>`;

  // Firebase Auth: слушаем изменения статуса пользователя
  onAuthStateChanged(async (user) => {
    currentUser = user;
    if (unsubscribeStateProfile) unsubscribeStateProfile();
    if (currentUser) {
      try {
        await fetchInitialData();
        unsubscribeStateProfile = subscribeToStateAndProfile(currentUser, reRenderApp);
      } catch (err) {
        console.error('Ошибка при загрузке данных:', err);
        appContainer.innerHTML = `<h1 style="color:red;">Ошибка: ${err.message}</h1>`;
      }
    } else {
      state = {};
      definitions = {};
      reRenderApp();
    }
  });

  // Гарантируем наличие тултипа в DOM
  ensureTooltipExists();
}

main();