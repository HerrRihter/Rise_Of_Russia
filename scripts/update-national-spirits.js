import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { firebaseConfig } from '../src/firebaseClient.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const spirits = [
  {
    id: 'fortress_state',
    roll_modifiers: { internal_security: 2, social_development: 1, welfare: -1 }
  },
  {
    id: 'near_abroad_policy',
    roll_modifiers: { internal_security: 1, industry: 1, diplomacy: 1 }
  },
  {
    id: 'national_projects_infrastructure',
    roll_modifiers: { industry: 2, welfare: 1 }
  },
  {
    id: 'reindustrialization_opk_tech_sovereignty',
    roll_modifiers: { industry: 2, military_might: 1 }
  },
  {
    id: 'divided_society',
    roll_modifiers: { social_development: -2, internal_security: -1 }
  },
  {
    id: 'systemic_corruption',
    roll_modifiers: { internal_security: -1, industry: -1, governance: -1 }
  },
  {
    id: 'oil_gas_rent_stabilization_fund',
    roll_modifiers: { welfare: 2, industry: 1, healthcare: 1 }
  },
  {
    id: 'sovereign_economy',
    roll_modifiers: { industry: 2, agriculture: 1, education: 1, social_development: 1 }
  },
  {
    id: 'social_initiatives_family_support',
    roll_modifiers: { welfare: 1, social_development: 1 }
  },
  {
    id: 'russian_dream_culture_identity',
    roll_modifiers: { education: 1, social_development: 2 }
  },
  {
    id: 'soft_power_russia_abroad',
    roll_modifiers: { social_development: 1 }
  },
  {
    id: 'development_pace_aggregator',
    roll_modifiers: {} }
  ,{
    id: 'spirit_roll_mods_aggregator',
    roll_modifiers: {} }
];

async function updateSpirits() {
  for (const spirit of spirits) {
    const ref = doc(db, 'national_spirits', spirit.id);
    await updateDoc(ref, { roll_modifiers: spirit.roll_modifiers });
    // console.log(`Обновлён дух: ${spirit.id}`);
  }
  // Удаляем moscow_advance
  const oldSpiritRef = doc(db, 'national_spirits', 'moscow_advance');
  if ((await deleteDoc(oldSpiritRef)).exists) {
    // console.log('moscow_advance удалён');
  }
  // console.log('Готово!');
}

updateSpirits().catch(console.error); 