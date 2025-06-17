import './style.css';
import { renderDashboard } from './renderer.js';
import { initTooltip } from './tooltip.js';
import { initModal } from './modal.js';
import { initSidePanel } from './sidePanel.js';
import { supabase } from './supabaseClient.js';

function arrayToIdObject(array, key = 'id') {
  if (!Array.isArray(array)) return {};
  return Object.fromEntries(array.map(item => [item[key], item]));
}

// --- Глобальные переменные ---
let definitions = {};
let state = {};
let currentUser = null;
const appContainer = document.getElementById('app');
let realtimeChannel = null; // Переменная для хранения нашего real-time канала

/**
 * Функция для полной перерисовки интерфейса.
 */
function reRenderApp() {
  if (appContainer) {
    renderDashboard(appContainer, state, definitions, currentUser);
  }
}

/**
 * Загружает все справочники и все данные о состоянии из Supabase.
 */
async function fetchAllData() {
  console.log("Загрузка всех данных из Supabase...");
  const [
    { data: leadersData }, { data: ideologiesData }, { data: partiesData },
    { data: corpsData }, { data: principlesData }, { data: principleOptionsData },
    { data: devAreasData }, { data: devAreaLevelsData }, { data: focusNodesData },
    { data: spiritsData }, { data: layoutData }, { data: advisorsState },
    { data: corpsState }, { data: principlesState }, { data: devAreasState },
    { data: focusStateResult }, { data: gameVarsData }, { data: activeSpiritsData }
  ] = await Promise.all([
    supabase.from('leaders').select('*'), supabase.from('ideologies').select('*'),
    supabase.from('parties').select('*'), supabase.from('corporations').select('*'),
    supabase.from('constitutional_principles').select('*'), supabase.from('constitutional_principle_options').select('*'),
    supabase.from('development_areas').select('*'), supabase.from('development_area_levels').select('*'),
    supabase.from('focus_tree_nodes').select('*'), supabase.from('national_spirits').select('*'),
    supabase.from('layout').select('*').order('id'), supabase.from('state_advisors').select('*'),
    supabase.from('state_corporations').select('*'), supabase.from('state_constitutional_principles').select('*'),
    supabase.from('state_development_areas').select('*'), supabase.from('state_focus_tree').select('*').single(),
    supabase.from('game_variables').select('*'), supabase.from('state_national_spirits').select('spirit_id')
  ]);

  const principles = arrayToIdObject(principlesData);
  principleOptionsData.forEach(opt => { if (principles[opt.principle_id]) { if (!principles[opt.principle_id].options) principles[opt.principle_id].options = {}; principles[opt.principle_id].options[opt.id] = opt; } });
  const devAreas = arrayToIdObject(devAreasData);
  devAreaLevelsData.forEach(level => { if (devAreas[level.area_id]) { if (!devAreas[level.area_id].levels) devAreas[level.area_id].levels = {}; devAreas[level.area_id].levels[level.id] = level; } });

  definitions = {
    leaders: arrayToIdObject(leadersData), ideologies: arrayToIdObject(ideologiesData),
    parties: arrayToIdObject(partiesData), parties_array: partiesData || [],
    corporations: arrayToIdObject(corpsData), constitutional_principles: principles,
    development_areas: devAreas, national_focus_tree: arrayToIdObject(focusNodesData),
    national_spirits: arrayToIdObject(spiritsData)
  };

  const gameVars = arrayToIdObject(gameVarsData, 'key');
  state = {
    dashboardTitle: "Политический интерфейс", layout: layoutData, game_variables: gameVars,
    advisors_selected: arrayToIdObject(advisorsState, 'slot_type'),
    corporations_selected: arrayToIdObject(corpsState, 'slot_type'),
    constitutional_principles_selected_options: arrayToIdObject(principlesState, 'principle_id'),
    development_areas_state: arrayToIdObject(devAreasState, 'area_id'),
    leader_pane_state: { leader_id: gameVars.display_leader_id?.value, ideology_id: gameVars.display_ideology_id?.value, party_id: gameVars.ruling_party_id?.value },
    national_info_state: { completed_focuses: focusStateResult?.completed_focuses || [], active_national_spirit_ids: activeSpiritsData.map(s => s.spirit_id) }
  };
}

/**
 * Функция, которая подписывается на все real-time обновления
 */
function subscribeToRealtimeUpdates() {
    const handleUpdate = async (payload) => {
        console.log('Обнаружено изменение в БД, перезагружаем все данные...', payload);
        await fetchAllData();
        reRenderApp();
    };

    // Если канал уже есть, отписываемся от старого, чтобы избежать дублей
    if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
    }

    // Создаем новый канал и подписки
    realtimeChannel = supabase.channel('realtime-updates');
    realtimeChannel
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_variables' }, handleUpdate)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'state_advisors' }, handleUpdate)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'state_corporations' }, handleUpdate)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'state_constitutional_principles' }, handleUpdate)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'state_development_areas' }, handleUpdate)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'state_focus_tree' }, handleUpdate)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'state_national_spirits' }, handleUpdate)
      .subscribe();

    console.log("Приложение подписано на real-time обновления.");
}

async function main() {
  initTooltip();
  initModal();
  initSidePanel();
  if (!appContainer) return;

  // --- ГЛАВНЫЙ СЛУШАТЕЛЬ АУТЕНТИФИКАЦИИ ---
  supabase.auth.onAuthStateChange(async (_event, session) => {
    currentUser = session?.user || null;

    if (currentUser) {
      // Пользователь ЗАЛОГИНЕН
      try {
        await fetchAllData(); // Загружаем все данные
        subscribeToRealtimeUpdates(); // И подписываемся на обновления
      } catch (error) {
        console.error('Ошибка при загрузке данных после входа:', error);
        appContainer.innerHTML = `<h1 style="color:red;">Ошибка: ${error.message}</h1>`;
      }
    } else {
      // Пользователь НЕ залогинен
      // Очищаем данные и отписываемся от обновлений
      state = {};
      definitions = {};
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
        realtimeChannel = null;
      }
    }

    // В любом случае (вход, выход, первая загрузка) перерисовываем интерфейс
    reRenderApp();
  });
}

// Запускаем всё
main();