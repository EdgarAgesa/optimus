import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bnpyphkohtlmmspwxbkb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJucHlwaGtvaHRsbW1zcHd4YmtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4NDczMDAsImV4cCI6MjA5NTQyMzMwMH0.FhhlVZEjdwyu2jEc3mGzicGDxAroi0F7h-pVYk-p0iU';

export const supabase = createClient(supabaseUrl, supabaseKey);