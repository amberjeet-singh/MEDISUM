import sys
import os
import json
import logging

# Force HuggingFace hub offline mode to use local cache and prevent network requests
os.environ["HF_HUB_OFFLINE"] = "1"

# Set up logging to stderr so it doesn't corrupt stdout JSON output
logging.basicConfig(
    level=logging.INFO, 
    stream=sys.stderr,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

logging.info("Starting Python extractor script...")

try:
    from transformers import pipeline
except ImportError:
    # If transformers is missing, we output a graceful JSON error
    logging.error("transformers package is missing.")
    print(json.dumps({
        "success": False,
        "facts": [],
        "error": "Python package 'transformers' is not installed."
    }))
    sys.exit(1)

# Model specified by user
MODEL_ID = "pabRomero/BioClinicalBERT-full-finetuned-ner-pablo"

def run_extraction(chunks):
    logging.info(f"Loading pipeline for model: {MODEL_ID}")
    try:
        # Load the NER pipeline
        # We set aggregation_strategy="simple" to group subwords into full words automatically
        ner_pipeline = pipeline("ner", model=MODEL_ID, aggregation_strategy="simple")
        logging.info("Model pipeline loaded successfully.")
    except Exception as e:
        logging.error(f"Failed to load model. Exception: {str(e)}", exc_info=True)
        return {
            "success": False,
            "facts": [],
            "error": f"Failed to load NER model {MODEL_ID}. Error: {str(e)}"
        }

    all_facts = []
    logging.info(f"Starting inference on {len(chunks)} chunks...")

    for i, chunk in enumerate(chunks):
        text = chunk.get("text", "")
        start_offset = chunk.get("startIndex", 0)

        if not text:
            continue

        try:
            # Run the NER model (since id2label uses BIO tags, simple aggregation works perfectly)
            results = ner_pipeline(text)
            
            for entity in results:
                entity_type = entity.get("entity_group") or entity.get("entity")
                
                # Filter out very low confidence extractions
                if entity.get("score", 0) < 0.4:
                    continue

                all_facts.append({
                    "entity_type": entity_type,
                    "entity_value": entity.get("word", ""),
                    "confidence": float(entity.get("score", 0.0)),
                    "startIndex": start_offset + entity.get("start", 0),
                    "endIndex": start_offset + entity.get("end", 0),
                    "source_chunk_id": "chunk_0"
                })
                
        except Exception as e:
            logging.error(f"Error processing chunk {i}: {e}", exc_info=True)
            continue

    logging.info("Inference completed successfully.")
    return {
        "success": True,
        "facts": all_facts,
        "error": None
    }

if __name__ == "__main__":
    # Read stdin
    logging.info("Waiting for stdin JSON payload...")
    input_data = sys.stdin.read()
    logging.info(f"Received {len(input_data)} bytes of input.")
    
    try:
        chunks = json.loads(input_data)
        if not isinstance(chunks, list):
            chunks = [chunks]
            
        result = run_extraction(chunks)
        print(json.dumps(result))
    except json.JSONDecodeError as e:
        logging.error(f"Failed to parse JSON input: {e}")
        print(json.dumps({
            "success": False,
            "facts": [],
            "error": "Invalid JSON input provided to Python extraction script."
        }))
        sys.exit(1)
