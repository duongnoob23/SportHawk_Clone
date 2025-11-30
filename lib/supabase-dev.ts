/**
 * Development Supabase Client
 * 
 * This client uses SERVICE_ROLE_KEY to bypass RLS (Row Level Security)
 * ONLY USE IN DEVELOPMENT MODE!
 * 
 * ⚠️ WARNING: Service role key bypasses all RLS policies
 * ⚠️ NEVER commit service role key to git
 * ⚠️ NEVER use in production
 */

import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase as regularSupabase } from './supabase';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Service role key - ONLY for development
// Get this from Supabase Dashboard → Settings → API → service_role key
const serviceRoleKey = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

/**
 * Development Supabase client that bypasses RLS
 * Only available in __DEV__ mode
 */
export const supabaseDev = __DEV__ && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

/**
 * Get Supabase client - uses dev client if available, otherwise regular client
 * 
 * Usage:
 *   const client = getSupabaseClient();
 *   // Use client for API calls that need to bypass RLS (POST operations)
 */
export function getSupabaseClient() {
  // In development, prefer dev client (bypasses RLS)
  if (__DEV__ && supabaseDev) {
    return supabaseDev;
  }
  
  if (__DEV__ && !serviceRoleKey) {
    console.warn('[DEV] Service role key not found! Add EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY to .env.local');
  }
  
  // Otherwise use regular client
  return regularSupabase;
}

