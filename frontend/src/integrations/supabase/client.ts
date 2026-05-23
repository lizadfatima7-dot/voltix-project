import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = 'https://lefgqgtxirrafytrkcjt.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_6n9a3RxfpNnM4DOEW64IYg_JCJmBcgP';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  }
});
