import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { firebaseConfig } from '../src/firebaseClient.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addAggregatorSpirit() {
  const spiritId = 'spirit_roll_mods_aggregator';
  const spiritData = {
    id: spiritId,
    name: 'Сводка модификаторов бросков',
    icon_path: 'history/national_spirits_icons/aggregator.png',
    is_aggregator: true,
    description: 'Показывает все модификаторы бросков, действующие от активных национальных духов.'
  };

  // Добавляем дух в коллекцию national_spirits
  await setDoc(doc(db, 'national_spirits', spiritId), spiritData, { merge: true });
  console.log('Агрегатор добавлен в national_spirits');

  // Добавляем дух в активные (state/main)
  const stateDocRef = doc(db, 'state', 'main');
  await updateDoc(stateDocRef, {
    'national_info_state.active_national_spirit_ids': arrayUnion(spiritId)
  });
  console.log('Агрегатор добавлен в active_national_spirit_ids');
}

addAggregatorSpirit().then(() => {
  console.log('Готово!');
  process.exit(0);
}).catch(e => {
  console.error('Ошибка:', e);
  process.exit(1);
}); 