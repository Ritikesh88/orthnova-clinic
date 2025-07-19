import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://supabase.com/dashboard/project/zbgcwthhasegvwnfewwe';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiZ2N3dGhoYXNlZ3Z3bmZld3dlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NTI4NDcsImV4cCI6MjA2ODQyODg0N30.SMFU91-3tx47c2lyxtASfkaj2zkUjxDstO-P7aUO4qI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);