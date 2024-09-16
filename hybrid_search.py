import json
import yake

# Define the text
text = "how does hawkins go to the office"

# Initialize YAKE extractor
language = "en"
max_ngram_size = 3
deduplication_threshold = 0.9
num_keywords = 5
custom_kw_extractor = yake.KeywordExtractor(
    lan=language,
    n=max_ngram_size,
    dedupLim=deduplication_threshold,
    top=num_keywords
)

# Extract keywords
keywords = custom_kw_extractor.extract_keywords(text)

# Create search conditions for the ChromaDB query (using '$contains')
search_conditions = [{"$contains": kw} for kw, score in keywords]
print("Search conditions:", search_conditions)

# Initialize ChromaDB client
import chromadb
from chromadb import Settings, DEFAULT_TENANT, DEFAULT_DATABASE

chroma_client = chromadb.HttpClient(
    host="localhost",
    port=9000,
    ssl=False,
    headers=None,
    settings=Settings(),
    tenant=DEFAULT_TENANT,
    database=DEFAULT_DATABASE,
)

# Access or create the collection in ChromaDB
collection = chroma_client.get_or_create_collection("documents_collection")

# Query the collection with a hybrid approach (keyword search + vector similarity)
# Perform a hybrid search
results = collection.query(
    query_texts=["how does hawkins go to the office"],  # Semantic search input
    n_results=3,  # Number of neighbors to return
    where_document={
        "$or": [
            {"$contains": {"text": "hawkins"}},
            {"$contains": {"text": "office"}}
        ]
    }
)

# Output the results
print(results)


# Output the query results
print("Results:", results)
