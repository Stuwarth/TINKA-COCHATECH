require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function testSupabase() {
  try {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_KEY;
    const supabase = createClient(url, key);
    
    console.log('Testing .single()...');
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone', '75472634')
      .eq('status', 'active')
      .single();
    
    if (error) {
      console.error('Supabase Error from .single():', error);
      
      console.log('Testing without .single()...');
      const res2 = await supabase
        .from('users')
        .select('*')
        .eq('phone', '75472634')
        .eq('status', 'active');
      console.log('Data without .single():', res2.data);
    } else {
      console.log('Success! Data:', data);
    }
  } catch (e) {
    console.error('Exception:', e.message);
  }
}

testSupabase();
