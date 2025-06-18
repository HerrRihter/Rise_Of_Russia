import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from './cors.ts';

console.log('Hello from perform-political-action Function!')

const ACTION_COSTS = {
  INFLUENCE_PARTY: 25,
};

Deno.serve(async (req) => {
  // Обработка preflight-запроса CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Создаем админский клиент, который может обходить RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Получаем пользователя из токена
    const { data: { user } } = await supabaseAdmin.auth.getUser()
    if (!user) throw new Error('User not found')

    // Получаем данные от клиента
    const { actionType, params } = await req.json()
    if (!actionType) throw new Error('Action type is required')

    // Получаем профиль пользователя, чтобы проверить права и очки
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('political_power, abilities')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) throw new Error('Profile not found')

    let cost = 0;

    // Основная логика проверки прав и выполнения действия
    switch (actionType) {
     case 'INFLUENCE_PARTY':
       if (!profile.abilities?.can_influence_parties) {
         throw new Error('Permission denied: cannot influence parties.')
       }
       cost = ACTION_COSTS.INFLUENCE_PARTY;
       if (profile.political_power < cost) {
         throw new Error('Not enough Political Power.')
       }

       // Проверяем, что значение изменения в разумных пределах
       const change = parseInt(params.change, 10);
       if (isNaN(change) || Math.abs(change) > 10) { // Ограничение, чтобы не ломали баланс
           throw new Error('Invalid change value.');
       }

       const { error: partyError } = await supabaseAdmin.rpc('adjust_party_popularity', {
         // Просто передаем значение как есть (может быть +5 или -5)
         party_id_to_adjust: params.partyId,
         adjustment_value: change
       });

       if (partyError) {
         throw partyError;
       }
       break;

      default:
        throw new Error(`Unknown action type: ${actionType}`)
    }

    // Списываем политические очки
    const newPower = profile.political_power - cost;
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ political_power: newPower })
      .eq('id', user.id)

    if (updateError) throw updateError;
    
    return new Response(JSON.stringify({ message: 'Action successful!', newPoliticalPower: newPower }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
})