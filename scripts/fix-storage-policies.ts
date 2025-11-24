// Run this script to fix storage policies
// Usage: npx ts-node scripts/fix-storage-policies.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vwqfwehtjnjenzrhzgol.supabase.co';
const serviceRoleKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3cWZ3ZWh0am5qZW56cmh6Z29sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDkzNTI1MywiZXhwIjoyMDY2NTExMjUzfQ.PQMTRnTNq2e3kzT4-NuxDb_2eZu3ae7WaulJo4Bb4SA';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function fixStoragePolicies() {
  console.log('Fixing storage policies...\n');

  // First, drop existing policies if any
  const dropPolicies = [
    'DROP POLICY IF EXISTS "Authenticated users can upload own profile images" ON storage.objects;',
    'DROP POLICY IF EXISTS "Authenticated users can update own profile images" ON storage.objects;',
    'DROP POLICY IF EXISTS "Authenticated users can delete own profile images" ON storage.objects;',
    'DROP POLICY IF EXISTS "Authenticated users can view all profile images" ON storage.objects;',
    'DROP POLICY IF EXISTS "Users can upload own profile images" ON storage.objects;',
    'DROP POLICY IF EXISTS "Users can update own profile images" ON storage.objects;',
    'DROP POLICY IF EXISTS "Users can delete own profile images" ON storage.objects;',
    'DROP POLICY IF EXISTS "Profile images are publicly accessible" ON storage.objects;',
  ];

  for (const sql of dropPolicies) {
    const { error } = await supabase.rpc('exec', { sql_query: sql });
    if (error) {
      console.log('Policy might not exist, continuing...');
    }
  }

  // Create new policies
  const policies = [
    {
      name: 'Authenticated users can upload',
      sql: `
        CREATE POLICY "auth_upload_${Date.now()}"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (bucket_id = 'profiles');
      `,
    },
    {
      name: 'Authenticated users can update',
      sql: `
        CREATE POLICY "auth_update_${Date.now()}"
        ON storage.objects FOR UPDATE
        TO authenticated
        USING (bucket_id = 'profiles')
        WITH CHECK (bucket_id = 'profiles');
      `,
    },
    {
      name: 'Authenticated users can delete',
      sql: `
        CREATE POLICY "auth_delete_${Date.now()}"
        ON storage.objects FOR DELETE
        TO authenticated
        USING (bucket_id = 'profiles');
      `,
    },
    {
      name: 'Authenticated users can view',
      sql: `
        CREATE POLICY "auth_select_${Date.now()}"
        ON storage.objects FOR SELECT
        TO authenticated
        USING (bucket_id = 'profiles');
      `,
    },
  ];

  let success = 0;
  let failed = 0;

  for (const policy of policies) {
    const { error } = await supabase.rpc('exec', { sql_query: policy.sql });

    if (error) {
      console.log(`❌ Failed: ${policy.name}`);
      console.log(`   Error: ${error.message}`);
      failed++;
    } else {
      console.log(`✅ Created: ${policy.name}`);
      success++;
    }
  }

  console.log(`\n Summary: ${success} policies created, ${failed} failed`);

  if (failed > 0) {
    console.log('\n⚠️  Some policies failed. Trying alternative approach...');
    console.log('Please run the following SQL in Supabase SQL Editor:');
    console.log('----------------------------------------');
    for (const policy of policies) {
      console.log(policy.sql);
    }
  }
}

fixStoragePolicies().catch(console.error);
