import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(url && key);

// .env.local 이 없으면 null — 화면은 뜨고 안내 문구만 표시
export const supabase = isSupabaseConfigured ? createClient(url, key) : null;
