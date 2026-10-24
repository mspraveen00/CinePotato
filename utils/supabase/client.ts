import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://eeusrolutjmynkndkhxt.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_PK6QikPX3yvK0OXRqOwCPA_cQAAqcuG';

    return createBrowserClient(
        supabaseUrl,
        supabaseAnonKey
    )
}
