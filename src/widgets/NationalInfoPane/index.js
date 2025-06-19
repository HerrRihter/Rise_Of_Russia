import './style.css';
import '../../style.css';
import { FocusBanner } from '../../components/FocusBanner.js';
import { NationalSpirits } from '../../components/NationalSpirits.js';
import { PoliticalDetails } from '../../components/PoliticalDetails.js';

export default function NationalInfoPaneWidget(props) {
  const { state, definitions, userId } = props;
  console.log('NationalInfoPaneWidget: userId', userId);
  const ruling_party_id = state.game_variables?.ruling_party_id?.value;
  const paneState = state.national_info_state;
  const completed_focuses = paneState?.completed_focuses || [];
  const active_national_spirit_ids = paneState?.active_national_spirit_ids || [];

  const mainPane = document.createElement('div');
  mainPane.className = 'national-info-pane';

  // 1. Баннер фокусов
  mainPane.appendChild(FocusBanner({ completed_focuses, definitions }));
  // 2. Национальные духи
  mainPane.appendChild(NationalSpirits({ active_national_spirit_ids, definitions }));
  // 3. Политические детали
  mainPane.appendChild(PoliticalDetails({ ruling_party_id, definitions, state, userId }));

  return mainPane;
}