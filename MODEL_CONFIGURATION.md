# Medisum — Model Configuration

## 1. BioClinicalBERT
**Role:** medical information extraction

**Planned use:** extract clinically important information from source clinical notes.

**Fine-tuning:** No initially.

**Output:** structured entities/fields for downstream processing.

## 2. Gemini API
**Role:** discharge summary generation

**Planned use:** generate the draft discharge summary from prepared clinical context and deterministic fields.

**Fine-tuning:** No.

**Important:** the exact Gemini model/version should be configured through an environment variable so it can be changed without code rewrites.

Example configuration concept:

```env
GEMINI_API_KEY=your_key
GEMINI_MODEL=your_selected_gemini_model
```

Never expose the key to the frontend.

## 3. BGE / Sentence Transformer
**Role:** semantic evidence retrieval

**Planned use:** create embeddings for source-note chunks and retrieve evidence relevant to each generated claim.

**Fine-tuning:** No initially.

The exact BGE checkpoint can be selected during implementation based on local hardware and retrieval performance.

## 4. DeBERTa-v3 NLI
**Role:** claim verification

**Planned use:** classify whether retrieved evidence entails, contradicts, or does not support the generated claim.

**Fine-tuning:** No initially.

## 5. Gemini API — LLM-as-Judge
**Role:** evaluation

**Planned use:** provide an additional structured evaluation signal for summary quality and comparison against human/clinician evaluation.

**Fine-tuning:** No.

## No Additional Generator
The architecture does not require Llama, Mistral, or another local generation model in the current plan.
