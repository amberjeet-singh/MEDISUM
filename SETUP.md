# Medisum — Setup

## Backend Responsibilities
The backend is responsible for:
- API routes
- Supabase data access
- preprocessing orchestration
- Gemini API calls
- local embedding/NLI model execution
- claim verification
- review/finalization persistence

## Required External Services
- Supabase PostgreSQL
- Gemini API access

## Local Model Components
- BioClinicalBERT
- BGE / Sentence Transformer
- DeBERTa-v3 NLI

These components should run through a local Python/ML service or another backend-compatible runtime.

## Environment Variables
Example:

```env
PORT=3000
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
GEMINI_API_KEY=...
GEMINI_MODEL=...
```

Use only the minimum Supabase credential required by each backend operation. Do not expose service-role credentials to the frontend.

## Recommended Development Order
1. Project/backend skeleton
2. Supabase schema and connection
3. Patient/encounter/note APIs
4. Preprocessing
5. Deterministic age/date calculations
6. BioClinicalBERT extraction
7. BGE retrieval
8. Gemini generation
9. Prompt iteration
10. Claim extraction
11. DeBERTa verification
12. Review/finalization APIs
13. Evaluation
14. End-to-end tests

## Secrets
Never commit API keys, Supabase secrets, model credentials, or private configuration files to source control.
