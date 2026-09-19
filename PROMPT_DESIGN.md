# Medisum — Prompt Design

## Prompt Goals
Prompts must reduce unsupported generation, enforce structured output, and make claims easier to verify.

## Generation Prompt Requirements
The Gemini generation prompt should instruct the model to:
- summarize only information present in the supplied clinical source,
- use precomputed age/date/length-of-stay values,
- not perform independent age/date arithmetic when a deterministic value is supplied,
- avoid guessing missing details,
- avoid adding clinical facts not supported by the source,
- produce the requested discharge-summary structure,
- preserve clinically important facts while staying concise.

## Structured Input
Provide clearly separated sections such as:

```text
PATIENT FACTS
...

DETERMINISTIC CALCULATIONS
Age: ...
Length of stay: ...
Relevant dates: ...

CLINICAL SOURCE NOTES
...

TASK
Generate the discharge summary.
```

## Prompt Iteration
The backend should support prompt versions, for example:
- `v1` — baseline structured prompt
- `v2` — stronger source-grounding instructions
- `v3` — iterative refinement / self-check instruction

Prompt versions should be stored with each generated summary.

## Claim Extraction Prompt
When an LLM is used for claim extraction, request:
- one factual claim per item,
- no commentary,
- no new information,
- machine-readable JSON.

Example output:

```json
{
  "claims": [
    {"order": 1, "text": "..."},
    {"order": 2, "text": "..."}
  ]
}
```

## Judge Prompt
The LLM-as-Judge prompt should evaluate predefined dimensions rather than giving a vague overall opinion.

Suggested dimensions:
- factuality
- completeness
- coherence
- concision
- clinical usefulness

The judge must receive the source/reference information needed for a grounded evaluation.

## Output Validation
All model-generated JSON must be schema-validated before being accepted by the backend. Malformed outputs must be retried or returned as an error; they must not be silently parsed into incorrect data.
