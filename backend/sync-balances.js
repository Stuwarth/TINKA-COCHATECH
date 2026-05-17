require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function syncBalances() {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

  // 1. Obtener todos los usuarios
  const { data: users, error: usersError } = await supabase.from('users').select('*');
  if (usersError) {
    console.error('Error fetching users:', usersError);
    return;
  }

  console.log(`Syncing balances for ${users.length} users...`);

  for (const user of users) {
    // 2. Obtener la suma de las ventas de este usuario
    const { data: sales, error: salesError } = await supabase
      .from('sales')
      .select('amount')
      .eq('user_id', user.id);

    if (salesError) {
      console.error(`Error fetching sales for user ${user.id}:`, salesError);
      continue;
    }

    const totalSalesAmount = sales.reduce((sum, s) => sum + Number(s.amount || 0), 0);
    const initialBalance = Number(user.initial_balance || 0);
    const newCurrentBalance = initialBalance + totalSalesAmount;

    // 3. Actualizar el current_balance del usuario
    const { error: updateError } = await supabase
      .from('users')
      .update({ current_balance: newCurrentBalance })
      .eq('id', user.id);

    if (updateError) {
      console.error(`Error updating balance for user ${user.id}:`, updateError);
    } else {
      console.log(`User ${user.full_name} (${user.phone}): Initial=${initialBalance}, Sales=${totalSalesAmount} => Current Balance updated to ${newCurrentBalance}`);
    }
  }

  console.log('Balance sync completed successfully!');
}

syncBalances();
