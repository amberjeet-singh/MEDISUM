# Medisum — Project Overview

## Purpose
Medisum is an AI-assisted clinical discharge summary generation and verification system. It takes clinical encounter notes, prepares structured information, generates a draft discharge summary, verifies the factual claims in that draft against the source notes, flags unsupported or incorrect claims, and presents the result for doctor review and editing.

## Core Objective
The system is designed around two stages that must remain separate:

1. **Generation** — an LLM creates a concise discharge summary from the clinical source material.
2. **Verification** — a separate evidence-retrieval and NLI layer checks the generated claims against the source notes before clinical review.

## Research Gaps Addressed
- **Gap 1 — Specialty coverage and dataset limitations:** use MIMIC-IV-BHC together with a small set of specialty-specific cases for broader evaluation.
- **Gap 2 — Date and age errors:** calculate age, dates, and length of stay separately with deterministic Python logic.
- **Gap 3 — Claim-level hallucination and omission checking:** extract claims, retrieve supporting evidence, and verify each claim independently.
- **Gap 4 — Evaluation methodology:** combine clinician evaluation, LLM-as-Judge evaluation, and automated metrics such as ROUGE/BERTScore.
- **Gap 5 — Prompt iteration:** explicitly test iterative/structured prompting and function-calling-style workflows as an error-reduction strategy.

## Planned Models / Components
| Component | Model / Method | Fine-tune? |
|---|---|---|
| Medical information extraction | BioClinicalBERT | No initially |
| Age/date/length-of-stay calculation | Python | No |
| Summary generation | Gemini API | No |
| Evidence retrieval | BGE / Sentence Transformer | No initially |
| Claim verification | DeBERTa-v3 NLI | No initially |
| LLM-as-Judge | Gemini API | No |
| Doctor review | Frontend + backend | N/A |

## Important Scope Rule
Do not add another generator LLM or replace the listed models/components unless the project plan is intentionally updated.

## Expected End-to-End Flow
Clinical Notes → Preprocessing → Information Extraction → Python Calculations → Evidence Retrieval → Gemini Summary Generation → Prompt Iteration/Structured Refinement → Claim Extraction → Evidence Retrieval → DeBERTa-v3 NLI Verification → Flags → Doctor Review/Edit → Final Summary → Evaluation

## Intended Use
This is a research/college prototype and evaluation system. It is not a substitute for clinical judgment or a production medical decision-making system.
