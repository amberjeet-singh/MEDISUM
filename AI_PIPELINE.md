# Medisum — AI Pipeline

## Approved Model/Component Set
This project uses only the following planned models/components:

| Component | Model / Method | Fine-tune? |
|---|---|---|
| Medical information extraction | BioClinicalBERT | No initially |
| Age + date + length-of-stay calculation | Python | No |
| Summary generation | Gemini API | No |
| Source/evidence retrieval | BGE / Sentence Transformer | No initially |
| Claim verification | DeBERTa-v3 NLI | No initially |
| LLM-as-Judge | Gemini API | No |

## End-to-End Pipeline

### 1. Clinical Notes
Load the complete source notes for an encounter.

### 2. Preprocessing
- Clean formatting.
- Normalize whitespace and note structure.
- Split long notes into traceable chunks.
- Preserve encounter and source-note identifiers.

### 3. Medical Information Extraction
Use BioClinicalBERT to identify clinically important entities/information that can support downstream preparation and evaluation.

### 4. Deterministic Calculations
Use Python rather than the LLM for:
- patient age when date of birth is available,
- date differences,
- length of stay,
- other deterministic date-related values.

### 5. Evidence Retrieval
Encode source chunks using BGE / Sentence Transformer embeddings and retrieve relevant source sentences/chunks.

### 6. Summary Generation
Send the prepared clinical context, structured fields, and controlled instructions to the Gemini API.

The generator should be instructed to:
- use source information only,
- use precomputed age/date values,
- avoid inventing facts,
- produce a structured discharge summary,
- avoid unsupported assumptions.

### 7. Prompt Iteration
Use a structured generation workflow that can refine the draft when required. Prompt versions must be recorded so the effect of prompt iteration can be evaluated.

### 8. Claim Extraction
Split the generated summary into factual claims that can be checked individually.

### 9. Claim-Level Evidence Retrieval
For every claim, retrieve the most relevant source-note evidence.

### 10. NLI Verification
Use DeBERTa-v3 NLI to compare each claim with retrieved evidence.

### 11. Verification Status
Map the result into:
- **Supported** — evidence supports the claim.
- **Contradicted** — evidence conflicts with the claim.
- **Not Found** — adequate supporting evidence was not retrieved.

### 12. Flagging
Contradicted and Not Found claims must be surfaced to the doctor rather than silently accepted.

### 13. Doctor Review
The doctor can inspect the claim, evidence, and draft, then edit or accept the content.

### 14. Finalization
Store only the doctor-reviewed/finalized version as the final output.
