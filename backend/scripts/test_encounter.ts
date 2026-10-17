import { EncounterService } from '../src/services/encounter.service';
import { PatientService } from '../src/services/patient.service';
import { GenerationService } from '../src/ai/generation/generation.service';
import { supabase } from '../src/config/supabase';

async function run() {
    const { data, error } = await supabase
        .from('encounters')
        .select('*')
        .not('admission_datetime', 'is', null)
        .limit(1);

    if (error) {
        console.error("DB Error:", error);
        return;
    }

    if (data && data.length > 0) {
        const encounterId = data[0].id;
        console.log(`Found encounter with dates: ${encounterId}`);
        console.log("Admit:", data[0].admission_datetime);
        console.log("Discharge:", data[0].discharge_datetime);
        
        const genService = new GenerationService();
        try {
            const result = await genService.generateDischargeSummary(encounterId);
            console.log("--- SUMMARY ---");
            console.log(result.content);
        } catch (e) {
            console.error("Generation error:", e);
        }
    } else {
        console.log("No encounters with admission_datetime found.");
    }
}
run().catch(console.error);
