# Medisum — Testing Strategy

## Testing Layers

### Unit Tests
Test:
- age calculation
- date calculation
- length-of-stay calculation
- note preprocessing
- claim status mapping
- validation schemas
- API error handling

### Integration Tests
Test:
- Supabase connection
- patient → encounter → notes retrieval
- Gemini generation orchestration
- embedding generation/retrieval
- claim verification pipeline
- summary review/finalization

### End-to-End Test
Use a small controlled encounter and verify:
1. notes are loaded,
2. deterministic fields are calculated,
3. summary is generated,
4. claims are extracted,
5. evidence is retrieved,
6. claims receive verification statuses,
7. flags appear,
8. doctor edits are saved,
9. final summary is stored.

## Verification Test Cases
Include at least:

### Supported claim
Source explicitly states the fact. Expected: `supported`.

### Contradicted claim
Source contains a conflicting fact. Expected: `contradicted`.

### Unsupported claim
Source does not contain the fact. Expected: `not_found`.

### Date error
Generated date differs from source/deterministic date. Expected: flagged.

### Age error
Generated age differs from deterministic calculation. Expected: flagged.

### Missing evidence
Retrieval returns no reliable evidence. Expected: `not_found` or review-required state.

## Safety Tests
- malformed Gemini response
- Gemini timeout/error
- verifier unavailable
- empty source notes
- duplicate claims
- invalid encounter ID
- unauthorized access
- missing required fields

## Data Integrity Rules
Testing must not modify or delete the original source notes or production data. Prefer dedicated test records/database environments.
