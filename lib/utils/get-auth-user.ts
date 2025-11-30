/**
 * Helper to get authenticated user - bypasses real Supabase auth
 * Returns fake user from UserContext for demo purposes
 */

import { User as SupabaseUser } from '@supabase/supabase-js';

// Global fake user (set by UserContext)
let fakeUser: SupabaseUser | null = null;

/**
 * Set fake user - called by UserContext
 */
export function setFakeUser(user: SupabaseUser | null) {
  fakeUser = user;
}

/**
 * Get authenticated user
 * - In development: returns fake user (bypasses real auth)
 * - In production: tries real auth first, falls back to fake user
 * 
 * This replaces all supabase.auth.getUser() calls
 */
export async function getAuthUser(): Promise<SupabaseUser> {
  // In development, always use fake user
  if (__DEV__ && fakeUser) {
    return fakeUser;
  }

  // In production, try real auth first
  if (!__DEV__) {
    try {
      const { supabase } = await import('@lib/supabase');
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (user && !error) {
        return user;
      }
    } catch (error) {
      // Fall through to fake user
    }
  }

  // Fallback to fake user
  if (fakeUser) {
    return fakeUser;
  }

  throw new Error('User not authenticated and no fake user available');
}

