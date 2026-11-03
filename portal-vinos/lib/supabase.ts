import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rzmhccxlibmxzeogzwsq.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_vnOeCrlIJ04k39eBFDpYCQ_4ibjNNoV';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);