# Medisum — Database Schema

## Database
Supabase PostgreSQL is the planned persistence layer.

## Core Entities

### patients
Stores patient-level information required by the application.

Suggested fields:
- `id` UUID primary key
- `external_patient_ref` text nullable
- `date_of_birth` date nullable
- `created_at` timestamptz
- `updated_at` timestamptz

### encounters
Stores an individual clinical encounter/admission.

Suggested fields:
- `id` UUID primary key
- `patient_id` UUID foreign key → `patients.id`
- `admission_datetime` timestamptz nullable
- `discharge_datetime` timestamptz nullable
- `specialty` text nullable
- `created_at` timestamptz
- `updated_at` timestamptz

### clinical_notes
Stores source note documents/chunks used by preprocessing, retrieval, generation, and verification.

Suggested fields:
- `id` UUID primary key
- `encounter_id` UUID foreign key → `encounters.id`
- `note_type` text
- `content` text
- `source_reference` text nullable
- `chunk_index` integer nullable
- `created_at` timestamptz

### extracted_facts
Stores structured information extracted before generation.

Suggested fields:
- `id` UUID primary key
- `encounter_id` UUID foreign key → `encounters.id`
- `fact_type` text
- `fact_key` text
- `fact_value` text
- `source_note_id` UUID nullable
- `created_at` timestamptz

### generated_summaries
Stores each generated draft.

Suggested fields:
- `id` UUID primary key
- `encounter_id` UUID foreign key → `encounters.id`
- `model_provider` text
- `model_name` text nullable
- `prompt_version` text
- `content` text
- `generation_metadata` jsonb nullable
- `status` text
- `created_at` timestamptz

### claims
Stores individual claims extracted from a generated summary.

Suggested fields:
- `id` UUID primary key
- `summary_id` UUID foreign key → `generated_summaries.id`
- `claim_order` integer
- `claim_text` text
- `claim_type` text nullable
- `created_at` timestamptz

### evidence
Stores source evidence retrieved for a claim.

Suggested fields:
- `id` UUID primary key
- `claim_id` UUID foreign key → `claims.id`
- `note_id` UUID foreign key → `clinical_notes.id`
- `evidence_text` text
- `similarity_score` numeric nullable
- `rank` integer nullable
- `created_at` timestamptz

### verification_results
Stores the verifier output for each claim.

Suggested fields:
- `id` UUID primary key
- `claim_id` UUID foreign key → `claims.id`
- `status` text (`supported`, `contradicted`, `not_found`)
- `nli_label` text nullable
- `confidence` numeric nullable
- `reason` text nullable
- `created_at` timestamptz

### doctor_reviews
Stores doctor review decisions.

Suggested fields:
- `id` UUID primary key
- `summary_id` UUID foreign key → `generated_summaries.id`
- `reviewer_id` UUID nullable
- `edited_content` text nullable
- `review_status` text
- `review_notes` text nullable
- `created_at` timestamptz
- `updated_at` timestamptz

### evaluation_results
Stores experiment/evaluation results.

Suggested fields:
- `id` UUID primary key
- `summary_id` UUID nullable
- `evaluation_type` text
- `metric_name` text
- `metric_value` numeric nullable
- `details` jsonb nullable
- `created_at` timestamptz

## Relationships
patients 1→N encounters
encounters 1→N clinical_notes
encounters 1→N extracted_facts
encounters 1→N generated_summaries
generated_summaries 1→N claims
claims 1→N evidence
claims 1→N verification_results
generated_summaries 1→N doctor_reviews

## Data Safety Rules
- Do not overwrite source clinical notes during preprocessing.
- Do not store generated output as if it were source truth.
- Preserve original evidence text and source references.
- Prefer append-only records for generated drafts, claims, verification results, and evaluation results.
- Do not perform destructive schema/data operations during normal testing.
