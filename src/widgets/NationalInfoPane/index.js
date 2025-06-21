import './style.css';
import '../../style.css';
import { FocusBanner } from '../../components/FocusBanner.js';
import { NationalSpirits } from '../../components/NationalSpirits.js';
import { PoliticalDetails } from '../../components/PoliticalDetails.js';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

export function NationalInfoPaneWidget({ definitions, state, userId }) {
  const element = document.createElement('div');
  element.className = 'national-info-pane';

  // console.log('NationalInfoPaneWidget: userId', userId);
  
  const ruling_party_id = state.game_variables?.ruling_party_id?.value;
  const paneState = state.national_info_state;
  const completed_focuses = paneState?.completed_focuses || [];
  const active_national_spirit_ids = paneState?.active_national_spirit_ids || [];
  const turnImage = state.turn_image;
  
  // 1. Баннер фокусов
  element.appendChild(FocusBanner({ completed_focuses, definitions, turnImage }));
  // 2. Национальные духи
  element.appendChild(NationalSpirits({ active_national_spirit_ids, definitions }));
  // 3. Политические детали
  element.appendChild(PoliticalDetails({ ruling_party_id, definitions, state, userId }));

  return element;
}