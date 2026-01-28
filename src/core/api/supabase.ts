import { createClient } from '@supabase/supabase-js';
import { ENV } from '../config/env';

export const supabase = (ENV.VITE_SUPABASE_URL && ENV.VITE_SUPABASE_ANON_KEY)
    ? createClient(ENV.VITE_SUPABASE_URL, ENV.VITE_SUPABASE_ANON_KEY)
    : null as any; // Cast to any to avoid type errors in other files, we'll handle null in App.tsx
