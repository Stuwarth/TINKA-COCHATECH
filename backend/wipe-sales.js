require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function deleteUserSales() {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
  
  const userId = '3c22f868-d3d8-401d-b869-38c7eb3b302f'; // Tomas' user ID
  
  // Delete all sales for this user
  const { data, error } = await supabase
    .from('sales')
    .delete()
    .eq('user_id', userId);
    
  // Delete local offline fallback sales as well in next instructions...
  if (error) {
    console.error('Error deleting sales:', error);
  } else {
    console.log('All sales for user deleted from database!');
  }
}
deleteUserSales();
