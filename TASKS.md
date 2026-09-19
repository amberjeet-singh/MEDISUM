# Medisum — Implementation Tasks

## Phase 1 — Foundation
- [ ] Initialize backend project
- [ ] Configure environment variables
- [ ] Connect Supabase
- [ ] Create/validate database schema
- [ ] Add logging and centralized error handling

## Phase 2 — Clinical Data
- [ ] Create patient APIs
- [ ] Create encounter APIs
- [ ] Create clinical-note APIs
- [ ] Implement preprocessing and note chunking
- [ ] Preserve source-note traceability

## Phase 3 — Clinical Information & Calculations
- [ ] Integrate BioClinicalBERT for information extraction
- [ ] Implement Python age calculation
- [ ] Implement date calculations
- [ ] Implement length-of-stay calculation
- [ ] Store extracted facts

## Phase 4 — Generation
- [ ] Integrate Gemini API on backend
- [ ] Create versioned generation prompts
- [ ] Enforce structured output validation
- [ ] Implement prompt iteration / refinement
- [ ] Persist generated summaries

## Phase 5 — Verification
- [ ] Integrate BGE / Sentence Transformer
- [ ] Build source-chunk retrieval
- [ ] Extract individual claims
- [ ] Integrate DeBERTa-v3 NLI
- [ ] Map NLI output to supported/contradicted/not_found
- [ ] Store evidence and verification results
- [ ] Add claim-level flags

## Phase 6 — Review
- [ ] Review API
- [ ] Save doctor edits
- [ ] Finalization API
- [ ] Store final doctor-reviewed summary

## Phase 7 — Evaluation
- [ ] Define baseline and experimental conditions
- [ ] Implement ROUGE/BERTScore calculation
- [ ] Implement hallucination/omission/date/age error analysis
- [ ] Integrate Gemini LLM-as-Judge evaluation
- [ ] Support clinician evaluation data
- [ ] Compare automatic metrics with human/judge ratings
- [ ] Evaluate prompt iteration separately

## Phase 8 — Testing
- [ ] Unit tests
- [ ] Integration tests
- [ ] Verification test cases
- [ ] End-to-end tests
- [ ] Error and failure-path tests
- [ ] Data integrity checks

## Definition of Done
The backend is ready for frontend integration when:
- all core APIs are documented and tested,
- Gemini generation works through the backend,
- claims can be verified independently of generation,
- evidence and flags are returned through APIs,
- doctor review/finalization is persisted,
- and the end-to-end pipeline works on a controlled test encounter.
