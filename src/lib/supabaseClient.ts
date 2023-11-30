import { createClient } from '@supabase/supabase-js';

export const supabaseClient = createClient(
	'https://ahwehejpuqrxmarxtfss.supabase.co',
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFod2VoZWpwdXFyeG1hcnh0ZnNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDEwODYwMjgsImV4cCI6MjAxNjY2MjAyOH0.W8d84TXCLpGn8SVkSXTFoJ7uFVZ5X-O4ISvOPBKhItU'
);
