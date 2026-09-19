# Medisum — Evaluation

## Evaluation Goal
Measure whether generation plus verification improves factual reliability and overall summary quality compared with an unverified generation baseline.

## Dataset Strategy
- MIMIC-IV-BHC as the primary benchmark dataset.
- Add a small specialty-specific set for broader specialty evaluation.
- Use patient/encounter-level separation between development and held-out evaluation data.

## Baseline
At minimum, evaluate a Gemini-generated summary without the Medisum verification layer.

## Experimental Conditions
Recommended comparison:

1. **Baseline:** Gemini generation only.
2. **Verified:** Gemini generation + evidence retrieval + claim verification.
3. **Prompt-iteration:** Gemini generation + iterative/structured prompting.
4. **Full Medisum:** generation + prompt iteration + claim verification + doctor review evaluation.

## Human / Clinician Evaluation
Evaluate:
- quality
- comprehensiveness
- concision
- coherence
- factual correctness
- clinical usefulness

## LLM-as-Judge
Use Gemini API as a separate evaluation component. Record its scores separately from human scores.

## Automated Metrics
Track:
- ROUGE
- BERTScore
- hallucination count/rate
- omission count/rate
- unsupported claim count/rate
- contradicted claim count/rate
- age error rate
- date error rate

## Gap 4 Analysis
Explicitly examine whether ROUGE/BERTScore correlate with clinician or LLM-as-Judge ratings. Do not assume automatic metrics represent clinical preference.

## Gap 5 Analysis
Compare fixed prompting against iterative/structured prompting and report whether prompt iteration reduces major hallucinations or omissions.

## Error Taxonomy
Use claim-level error categories so individual failures are inspectable rather than relying only on one aggregate score.

## Reporting
Report sample sizes, experimental condition, metric values, and failure cases. Do not claim clinical superiority from a small course-scale experiment.
