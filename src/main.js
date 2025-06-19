import './style.css';
import { renderDashboard } from './renderer.js';
import { ensureTooltipExists } from './components/Tooltip.js';
import { initModal } from './modal.js';
import { initSidePanel } from './sidePanel.js';
import { onAuthStateChanged } from './auth.js';
import { getFirestore, collection, getDocs, getDoc, doc } from 'firebase/firestore';
import { firebaseApp } from './firebaseClient.js';

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
    renderDashboard(appContainer, state, definitions, currentUser);
  }
}

async function fetchStateData() {
  console.log("Загрузка данных состояния и профиля пользователя...");
  // Загружаем state из одного документа
  const stateDocRef = doc(db, 'state', 'main');
  const stateSnap = await getDoc(stateDocRef);
  if (!stateSnap.exists()) {
    throw new Error('Документ state/main не найден!');
  }
  const stateData = stateSnap.data();

  // Загружаем профиль пользователя, если есть
  let userProfile = null;
  if (currentUser) {
    const profileDocRef = doc(db, 'profiles', currentUser.uid);
    const profileSnap = await getDoc(profileDocRef);
    userProfile = profileSnap.exists() ? profileSnap.data() : null;
  }

  // Обновляем state
  state = {
    ...state,
    ...stateData,
    profile: userProfile,
  };
}

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
  // development_areas и focus_tree_nodes аналогично, если есть вложенные уровни — обработать отдельно

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

  // В state сохраняем только layout (остальное загрузим в fetchStateData)
  state = {
    dashboardTitle: "Политический интерфейс",
    layout: definitions.layout
  };

  // После загрузки справочников, загружаем изменяемое состояние
  await fetchStateData();
}

async function main() {
  initModal();
  initSidePanel();
  if (!appContainer) return;

  appContainer.innerHTML = `<div style="color:gray;padding:20px;">Загрузка...</div>`;

  // Firebase Auth: слушаем изменения статуса пользователя
  onAuthStateChanged(async (user) => {
    currentUser = user;
    if (currentUser) {
      try {
        await fetchInitialData();
      } catch (err) {
        console.error('Ошибка при загрузке данных:', err);
        appContainer.innerHTML = `<h1 style="color:red;">Ошибка: ${err.message}</h1>`;
      }
    } else {
      state = {};
      definitions = {};
    }
    reRenderApp();
  });

  // Гарантируем наличие тултипа в DOM
  ensureTooltipExists();
}

main();