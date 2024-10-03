const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://piykumcyaqnyxwndozhb.supabase.co'; // Ovaj URL mora biti u navodnicima
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpeWt1bWN5YXFueXh3bmRvemhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc2OTk2MTMsImV4cCI6MjA0MzI3NTYxM30.eqh0FPRGtqD3A9DLeJv6yZKXP6pnaygDTaaa2bgz3Xs'

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
