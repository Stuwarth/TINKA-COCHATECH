require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function debugUserSales() {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
  const userId = '320a1c71-299b-4e69-9ef8-0d5d14950289';
  
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
    
  const { data: sales, error: salesError } = await supabase
    .from('sales')
    .select('*')
    .eq('user_id', userId);
    
  console.log('--- USER DATA ---');
  console.log(user);
  console.log('--- SALES DATA ---');
  console.log(sales);
}

debugUserSales();
