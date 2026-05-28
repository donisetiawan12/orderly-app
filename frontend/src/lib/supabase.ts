import { createClient } from '@supabase/supabase-js';

// Pakai API URL dari bagian Data API
const supabaseUrl = 'https://udmgbjllfpirsknsqeha.supabase.co';

// Pakai Publishable key (sb_publishable_...)
const supabaseKey = 'sb_publishable_smm5UtV0o19tVY8TgAiCsw_jf_btX7v';

export const supabase = createClient(supabaseUrl, supabaseKey);