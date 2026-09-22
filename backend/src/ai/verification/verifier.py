import sys
import os
import json
import logging
from typing import List, Dict, Any

# Force offline mode for local models
os.environ["HF_HUB_OFFLINE"] = "1"

logging.basicConfig(
    level=logging.INFO,
    stream=sys.stderr,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

logging.info("Starting Python ML Verifier script...")

try:
    from sentence_transformers import SentenceTransformer
    from transformers import pipeline, AutoConfig
    import torch
    from torch.nn.functional import cosine_similarity
except ImportError as e:
    logging.error(f"Missing required packages: {e}")
    print(json.dumps({
        "success": False,
        "error": f"Python dependencies missing: {e}"
    }))
    sys.exit(1)

# Models
BGE_MODEL = "BAAI/bge-base-en-v1.5"
BGE_REVISION = "a5beb1e3e68b9ab74eb54cfd186867f64f240e1a"
NLI_MODEL = "MoritzLaurer/DeBERTa-v3-base-mnli-fever-anli"
NLI_REVISION = "6f5cf0a2b59cabb106aca4c287eed12e357e90eb"

def run_verification(data: Dict[str, Any]) -> Dict[str, Any]:
    try:
        claims = data.get("claims", [])
        clinical_notes = data.get("clinical_notes", [])
        extracted_facts = data.get("extracted_facts", [])
        summary_sentences = data.get("summary_sentences", [])
        retrieval_threshold = data.get("retrieval_threshold", 0.5)
        top_k = data.get("top_k", 3)
        nli_threshold = data.get("nli_threshold", 0.6)

        logging.info(f"Loading BGE Model: {BGE_MODEL} (revision {BGE_REVISION})")
        embedder = SentenceTransformer(BGE_MODEL, revision=BGE_REVISION)
        
        logging.info(f"Loading DeBERTa NLI Pipeline: {NLI_MODEL} (revision {NLI_REVISION})")
        nli_pipeline = pipeline("text-classification", model=NLI_MODEL, revision=NLI_REVISION, device=0 if torch.cuda.is_available() else -1)
        # 0: entailment, 1: neutral, 2: contradiction
        
        # 1. Evidence Retrieval for Claims
        note_chunks = []
        note_texts = []
        for note in clinical_notes:
            note_chunks.append(note)
            note_texts.append(note.get("text", ""))

        if note_texts:
            logging.info("Computing embeddings for clinical notes...")
            note_embeddings = embedder.encode(note_texts, convert_to_tensor=True)
        else:
            note_embeddings = None
            
        verified_claims = []
        for claim in claims:
            claim_text = claim.get("text", "")
            claim_id = claim.get("id", "")
            
            evidence = []
            best_sim = 0.0
            best_evidence_text = ""
            
            if note_embeddings is not None and claim_text.strip():
                claim_embedding = embedder.encode(claim_text, convert_to_tensor=True)
                cos_scores = cosine_similarity(claim_embedding.unsqueeze(0), note_embeddings)[0]
                top_results = torch.topk(cos_scores, min(top_k, len(note_texts)))
                
                for rank, (score_tensor, idx_tensor) in enumerate(zip(top_results.values, top_results.indices)):
                    score = score_tensor.item()
                    idx = idx_tensor.item()
                    
                    if rank == 0:
                        best_sim = score
                        best_evidence_text = note_texts[idx]
                        
                    if score >= retrieval_threshold:
                        chunk_data = note_chunks[idx]
                        evidence.append({
                            "source_note_id": chunk_data.get("source_note_id", ""),
                            "source_chunk_id": chunk_data.get("chunk_id", ""),
                            "source_start_index": chunk_data.get("startIndex", None),
                            "source_end_index": chunk_data.get("endIndex", None),
                            "evidence_text": note_texts[idx],
                            "similarity_score": score,
                            "rank": rank + 1
                        })
            
            status = "NOT_FOUND"
            nli_label = None
            nli_conf = None
            
            # Combine evidence for NLI or just take best
            if evidence:
                combined_evidence = " ".join([e["evidence_text"] for e in evidence])
                # format for nli: string or pair
                nli_result = nli_pipeline({"text": combined_evidence, "text_pair": claim_text})
                
                # The model outputs entailment, neutral, or contradiction.
                nli_label = nli_result.get("label", "").lower()
                nli_conf = nli_result.get("score", 0.0)
                
                if nli_conf >= nli_threshold:
                    if nli_label == "entailment":
                        status = "SUPPORTED"
                    elif nli_label == "contradiction":
                        status = "CONTRADICTED"
                    else:
                        status = "NOT_FOUND" # neutral + good retrieval = NOT_FOUND based on rules unless it's ambiguous
                else:
                    status = "NOT_FOUND"
                    
            verified_claims.append({
                "claim_id": claim_id,
                "claim_text": claim_text,
                "evidence": evidence,
                "nli_label": nli_label,
                "nli_confidence": nli_conf,
                "similarity_score": best_sim,
                "status": status
            })

        # 2. Omission Detection for Source Facts
        coverage_results = []
        
        if summary_sentences:
            logging.info("Computing embeddings for summary sentences...")
            summary_embeddings = embedder.encode(summary_sentences, convert_to_tensor=True)
        else:
            summary_embeddings = None
            
        for fact in extracted_facts:
            fact_id = fact.get("id", "")
            fact_val = fact.get("fact_value", "")
            fact_type = fact.get("fact_type", "")
            
            # Simple context format
            fact_text = f"{fact_type}: {fact_val}"
            
            status = "OMITTED"
            best_sim = 0.0
            nli_label = None
            nli_conf = None
            
            if summary_embeddings is not None and fact_text.strip():
                fact_embedding = embedder.encode(fact_text, convert_to_tensor=True)
                cos_scores = cosine_similarity(fact_embedding.unsqueeze(0), summary_embeddings)[0]
                top_result = torch.topk(cos_scores, 1)
                best_sim = top_result.values[0].item()
                best_idx = top_result.indices[0].item()
                best_summary_sent = summary_sentences[best_idx]
                
                if best_sim >= retrieval_threshold:
                    # NLI check: Does the summary sentence entail the source fact?
                    nli_result = nli_pipeline({"text": best_summary_sent, "text_pair": fact_text})
                    nli_label = nli_result.get("label", "").lower()
                    nli_conf = nli_result.get("score", 0.0)
                    
                    if nli_conf >= nli_threshold:
                        if nli_label == "entailment":
                            status = "COVERED"
                        elif nli_label == "neutral":
                            status = "OMITTED"
                        else: # contradiction
                            status = "UNCERTAIN"
                    else:
                        status = "UNCERTAIN"
                        
            coverage_results.append({
                "source_fact_id": fact_id,
                "status": status,
                "coverage_score": best_sim,
                "nli_label": nli_label,
                "nli_confidence": nli_conf
            })

        logging.info("Verification completed successfully.")
        return {
            "success": True,
            "claims": verified_claims,
            "coverage": coverage_results,
            "error": None
        }
        
    except Exception as e:
        logging.error(f"Error during verification: {e}", exc_info=True)
        return {
            "success": False,
            "error": f"Verification failed: {str(e)}"
        }

if __name__ == "__main__":
    logging.info("Waiting for stdin JSON payload...")
    input_data = sys.stdin.read()
    logging.info(f"Received {len(input_data)} bytes of input.")
    
    try:
        data = json.loads(input_data)
        result = run_verification(data)
        print(json.dumps(result))
    except json.JSONDecodeError as e:
        logging.error(f"Failed to parse JSON input: {e}")
        print(json.dumps({
            "success": False,
            "error": "Invalid JSON input provided to Python verification script."
        }))
        sys.exit(1)
