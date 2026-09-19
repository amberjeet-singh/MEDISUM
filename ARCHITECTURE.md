# Medisum — System Architecture

## Architecture Overview
Medisum uses a backend-centered pipeline with a separate frontend. The backend owns data access, preprocessing, model orchestration, verification, persistence, and evaluation APIs. The frontend consumes the backend APIs and provides the doctor review workflow.

## Logical Components
1. **Frontend**
   - Doctor dashboard
   - Patient/encounter selection
   - Generated summary display
   - Claim-level verification display
   - Doctor edit/review workflow
   - Finalization workflow

2. **Backend API**
   - Authentication/authorization integration
   - Patient and encounter APIs
   - Summary generation orchestration
   - Claim extraction and verification orchestration
   - Review/finalization APIs
   - Evaluation endpoints where required

3. **Preprocessing Layer**
   - Normalize note text
   - Remove irrelevant formatting
   - Chunk long notes
   - Prepare model-ready input
   - Preserve source-to-chunk traceability

4. **Clinical Information Extraction**
   - BioClinicalBERT-based extraction
   - Identify important clinical entities/fields needed by the pipeline

5. **Deterministic Calculation Layer**
   - Patient age
   - Date differences
   - Length of stay
   - Other deterministic fields required for the summary

6. **Evidence Retrieval Layer**
   - BGE / Sentence Transformer embeddings
   - Search source-note chunks for evidence relevant to generated claims

7. **Generation Layer**
   - Gemini API
   - Structured prompt
   - Iterative prompting / structured refinement

8. **Verification Layer**
   - Claim extraction
   - Evidence retrieval
   - DeBERTa-v3 NLI classification
   - Supported / Contradicted / Not Found status

9. **Persistence Layer**
   - Supabase database
   - Store patients, encounters, notes, generated summaries, claims, evidence, verification results, reviews, and final summaries

10. **Evaluation Layer**
   - Clinician evaluation
   - Gemini-based LLM-as-Judge evaluation
   - ROUGE/BERTScore
   - Hallucination, omission, and date/age error analysis

## Key Design Principle
Generation and verification must be independent. The same generation output must not be treated as self-verified merely because the generator produced it.

## Data Traceability
Every generated claim should be traceable to:
- the generated summary,
- the source encounter/note,
- retrieved evidence chunks,
- the verifier result,
- and the doctor review decision.

## Failure Handling
The backend must fail safely when:
- the Gemini API is unavailable,
- no evidence is retrieved,
- NLI confidence is weak,
- note text is too long,
- required patient/encounter fields are missing,
- or a model returns malformed output.

In uncertain cases, the system should flag the claim rather than silently marking it as verified.
