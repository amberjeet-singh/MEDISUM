# Medisum — Fact Verification

## Objective
Verify each factual claim in the generated discharge summary against the original clinical notes before the draft is shown as ready for doctor review.

## Verification Architecture
Generated Summary
→ Claim Extraction
→ Evidence Retrieval with BGE
→ DeBERTa-v3 NLI
→ Claim Status
→ Flagging
→ Doctor Review

## Claim Statuses

### Supported
The retrieved source evidence supports the generated claim.

### Contradicted
The source evidence conflicts with the generated claim.

### Not Found
No adequate supporting evidence was retrieved from the source notes.

## Verification Record
Each verification record should contain:
- summary ID
- claim ID
- claim text
- evidence source ID
- evidence text
- retrieval score when available
- NLI label
- confidence when available
- final verification status
- verifier timestamp

## Important Rules
1. A claim must not be marked supported solely because the generator produced it.
2. Missing evidence should be surfaced as uncertainty rather than converted into a positive result.
3. Contradicted claims must be explicitly flagged.
4. Date and age claims should also be checked against deterministic values.
5. The original source note must remain unchanged.

## Claim Categories
The implementation may classify claims such as:
- diagnosis
- symptom
- procedure
- medication
- dosage
- investigation/result
- admission/discharge date
- age
- length of stay
- clinical course
- follow-up instruction

## Doctor Review
The frontend should show the claim, its status, and the evidence that caused the status. The doctor remains responsible for accepting, editing, or rejecting content.
