import { EncounterService } from '../backend/src/services/encounter.service';
import { PatientService } from '../backend/src/services/patient.service';
import { GenerationService } from '../backend/src/ai/generation/generation.service';

async function run() {
    const encService = new EncounterService();
    const patService = new PatientService();

    // Just list some encounters
    const { data, error } = await require('../backend/src/config/supabase').supabase
        .from('encounters')
        .select('*')
        .not('admission_datetime', 'is', null)
        .limit(1);

    if (data && data.length > 0) {
        const encounterId = data[0].id;
        console.log(`Found encounter with dates: ${encounterId}`);
        console.log(data[0]);
        
        const genService = new GenerationService();
        const result = await genService.generateDischargeSummary(encounterId);
        console.log(result.content);
    } else {
        console.log("No encounters with admission_datetime found.");
    }
}
run().catch(console.error);
