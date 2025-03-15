import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nvrgqfbmlvbewnhzjiry.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52cmdxZmJtbHZiZXduaHpqaXJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAyNjEwNjQsImV4cCI6MjA1NTgzNzA2NH0.qEHc-QZlxSCSw4YVzGn7uP2Q-F0MXiI58Klh5m7JqV4';

export const supabase = createClient(supabaseUrl, supabaseKey);