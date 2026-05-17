require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function checkSales() {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
  const { data, error } = await supabase.from('sales').select('*');
  console.log('Sales in DB:');
  console.log(data);
}
checkSales();
