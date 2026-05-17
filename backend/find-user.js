require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function findUser() {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
  const { data, error } = await supabase.from('users').select('*').eq('id', '3c22f868-d3d8-401d-b869-38c7eb3b302f');
  console.log(data);
}
findUser();
