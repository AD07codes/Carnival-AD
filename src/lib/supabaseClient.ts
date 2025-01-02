import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://isvbfguruzzjfrjlwmrr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzdmJmZ3VydXp6amZyamx3bXJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTIxNTU0MiwiZXhwIjoyMDUwNzkxNTQyfQ.kKXr1qElccjSckp0pDlPCfk6UW6yHy6vobhFWIjpp2I';
export const supabase = createClient(supabaseUrl, supabaseKey);
