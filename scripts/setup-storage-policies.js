#!/usr/bin/env node

// This script sets up RLS policies for the profiles storage bucket
// Run with: node scripts/setup-storage-policies.js

const SUPABASE_URL = 'https://vwqfwehtjnjenzrhzgol.supabase.co';
const SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3cWZ3ZWh0am5qZW56cmh6Z29sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDkzNTI1MywiZXhwIjoyMDY2NTExMjUzfQ.PQMTRnTNq2e3kzT4-NuxDb_2eZu3ae7WaulJo4Bb4SA';

async function setupStoragePolicies() {
  console.log('Setting up storage policies for profiles bucket...');

  const policies = [
    {
      name: 'Authenticated users can upload own profile images',
      sql: `
        CREATE POLICY "Authenticated users can upload own profile images"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (
          bucket_id = 'profiles' AND
          (storage.foldername(name))[1] = auth.uid()::text
        );
      `,
    },
    {
      name: 'Authenticated users can update own profile images',
      sql: `
        CREATE POLICY "Authenticated users can update own profile images"
        ON storage.objects FOR UPDATE
        TO authenticated
        USING (
          bucket_id = 'profiles' AND
          (storage.foldername(name))[1] = auth.uid()::text
        )
        WITH CHECK (
          bucket_id = 'profiles' AND
          (storage.foldername(name))[1] = auth.uid()::text
        );
      `,
    },
    {
      name: 'Authenticated users can delete own profile images',
      sql: `
        CREATE POLICY "Authenticated users can delete own profile images"
        ON storage.objects FOR DELETE
        TO authenticated
        USING (
          bucket_id = 'profiles' AND
          (storage.foldername(name))[1] = auth.uid()::text
        );
      `,
    },
    {
      name: 'Authenticated users can view all profile images',
      sql: `
        CREATE POLICY "Authenticated users can view all profile images"
        ON storage.objects FOR SELECT
        TO authenticated
        USING (bucket_id = 'profiles');
      `,
    },
  ];

  for (const policy of policies) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({ query: policy.sql }),
      });

      if (!response.ok) {
        // Try alternative approach - direct SQL execution
        const altResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({ query: policy.sql }),
        });

        if (!altResponse.ok) {
          console.log(`⚠️  Policy might already exist: ${policy.name}`);
        } else {
          console.log(`✅ Created: ${policy.name}`);
        }
      } else {
        console.log(`✅ Created: ${policy.name}`);
      }
    } catch (error) {
      console.error(`❌ Error creating ${policy.name}:`, error.message);
    }
  }

  console.log('\nPolicies setup attempt complete.');
  console.log(
    '\nIf policies failed to create, you need to add them manually in Supabase Dashboard:'
  );
  console.log('1. Go to Storage → Policies');
  console.log('2. Click "New Policy" for the "profiles" bucket');
  console.log('3. Add each policy with the SQL provided above');
}

setupStoragePolicies();
