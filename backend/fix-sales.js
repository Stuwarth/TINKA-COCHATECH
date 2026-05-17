require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function fixSales() {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
  
  const userId = '3c22f868-d3d8-401d-b869-38c7eb3b302f'; // Tomas' user ID
  
  const { data, error } = await supabase
    .from('sales')
    .update({ user_id: userId })
    .is('user_id', null);
    
  if (error) {
    console.error('Error fixing sales:', error);
  } else {
    console.log('Fixed sales! Updated rows:', data);
  }
}
fixSales();
