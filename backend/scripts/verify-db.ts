import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_API_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: SUPABASE_URL and SUPABASE_API_KEY must be provided in the .env file.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const requiredTables = [
    'patients',
    'encounters',
    'clinical_notes',
    'extracted_facts',
    'generated_summaries',
    'claims',
    'evidence',
    'verification_results',
    'doctor_reviews',
    'evaluation_results'
];

async function verifyDatabase() {
    console.log('Connecting to Supabase to verify database schema...\n');
    let verificationFailed = false;
    const missingTables: string[] = [];

    // To verify existence safely without destructive commands, we will attempt to do a non-destructive
    // read (LIMIT 0) on each table. If it errors with relation does not exist, we know it's missing.
    // This is safer and simpler than querying information_schema if the user doesn't have privileges for it.
    
    for (const table of requiredTables) {
        const { error } = await supabase.from(table).select('id').limit(0);
        
        if (error) {
            verificationFailed = true;
            // Check if error is related to table not existing
            // PostgREST returns 404 or specific code for missing relations depending on configuration
            if (error.code === '42P01' || (error.message && (error.message.includes('relation') || error.message.includes('does not exist')))) {
                missingTables.push(table);
                console.log(`❌ Table missing: ${table}`);
            } else {
                console.error(`❌ Unexpected error checking table ${table}: ${error.message || JSON.stringify(error)}`);
                if (error.message && error.message.includes('fetch failed')) {
                     console.error(`   -> Hint: "fetch failed" usually means the SUPABASE_URL is invalid or unreachable.`);
                     console.error(`   -> Current SUPABASE_URL: ${supabaseUrl}`);
                     console.error(`   -> Make sure it includes the full domain, e.g., https://<project-ref>.supabase.co`);
                }
            }
        } else {
            console.log(`✅ Table exists: ${table}`);
        }
    }

    console.log('\n--- Verification Summary ---');
    if (!verificationFailed) {
        console.log('✅ Success: All required database tables are present.');
    } else {
        console.error('❌ Failure: Database verification did not complete successfully.');
        console.error(`Missing Tables: ${missingTables.join(', ')}`);
        console.error('\nPlease ensure you have manually executed the SQL scripts in the Supabase SQL Editor in the exact order:');
        console.error('1. supabase/01_extensions.sql');
        console.error('2. supabase/02_schema.sql');
        console.error('3. supabase/03_indexes.sql');
        console.error('4. supabase/04_rls.sql');
        console.error('5. supabase/05_functions_and_triggers.sql');
        console.error('6. supabase/06_seed_optional.sql (optional)');
        process.exit(1);
    }
}

verifyDatabase().catch((err) => {
    console.error('Failed to verify database:', err);
    process.exit(1);
});
