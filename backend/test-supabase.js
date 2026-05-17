require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function testSupabase() {
  try {
    console.log('Testing Supabase Connection...');
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_KEY;
    console.log('URL:', url);
    console.log('KEY:', key ? key.substring(0, 15) + '...' : 'undefined');

    const supabase = createClient(url, key);
    
    const { data, error } = await supabase.from('users').select('*').limit(1);
    
    if (error) {
      console.error('Supabase Error:', error);
    } else {
      console.log('Success! Data:', data);
    }
  } catch (e) {
    console.error('Exception:', e.message);
  }
}

testSupabase();
