# Medisum — API Documentation

## API Principles
- Version all application routes.
- Return consistent JSON responses.
- Validate all path parameters and request bodies.
- Keep model-provider failures distinct from validation failures.
- Never expose provider API keys to the frontend.

## Planned Route Groups

### Health
`GET /api/v1/health`

Returns backend health/status.

### Patients
`GET /api/v1/patients`

List/search patients.

`GET /api/v1/patients/:id`

Return one patient.

`GET /api/v1/patients/:id/encounters`

Return the patient's encounters.

### Encounters
`GET /api/v1/encounters/:id`

Return encounter details.

`GET /api/v1/encounters/:id/notes`

Return source clinical notes for the encounter.

### Summary Generation
`POST /api/v1/encounters/:id/summaries/generate`

Generate a discharge-summary draft using the Gemini API.

Request should support:
- encounter ID
- optional generation configuration
- prompt version

Response should include:
- summary ID
- generated summary
- model/provider metadata
- generation status

### Claims
`GET /api/v1/summaries/:id/claims`

Return claims extracted from a generated summary.

### Verification
`POST /api/v1/summaries/:id/verify`

Run claim-level verification.

Response should include for every claim:
- claim text
- evidence snippets
- verifier result
- confidence when available
- status: `supported`, `contradicted`, or `not_found`

### Review
`PATCH /api/v1/summaries/:id/review`

Save doctor edits/review state.

Request should support:
- edited content
- review status
- optional review notes

### Finalization
`POST /api/v1/summaries/:id/finalize`

Create/store the final doctor-reviewed summary.

## API Response Pattern
Recommended response shape:

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

## Error Pattern
Recommended error shape:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request"
  }
}
```

## Security
- Gemini API credentials remain backend-only.
- Supabase credentials must be stored in environment variables.
- Validate UUIDs and user input.
- Apply authorization before returning clinical data.
- Never place secrets in frontend code or committed `.env` files.
