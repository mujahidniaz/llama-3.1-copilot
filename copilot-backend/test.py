import json
import re
import yake

# Define the text
text = "how does hawkins go to the office"

# Initialize YAKE extractor
language = "en"
max_ngram_size = 3
deduplication_threshold = 0.9
num_keywords = 5
custom_kw_extractor = yake.KeywordExtractor(lan=language, n=max_ngram_size, dedupLim=deduplication_threshold,
                                            top=num_keywords, features=None)

# Extract keywords
keywords = custom_kw_extractor.extract_keywords(text)
search_conditions = list({"$contains": kw} for kw, score in keywords)
print(search_conditions)

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
# mystr = 'This is a string, with words!'
# wordList = re.sub("[^\w]", " ",  mystr).split()
# print(wordList)
collection = chroma_client.get_or_create_collection("documents_collection")
results = collection.query(
    query_texts=[text], n_results=2,
    where_document={"$or": search_conditions}
)
print(results)
# import os
#
# from llama_index.core import SimpleDirectoryReader
#
# directory_path = r"C:\Users\977mniaz\PycharmProjects\llama-3.1-copilot\data"
#
# # Use LlamaIndex to read files (or any other method to read documents)
# documents = SimpleDirectoryReader(directory_path,filename_as_id=True).load_data()
#
# all_documents = []
# all_ids = []
#
# # Split and add each document
# for doc in documents:
#     file_name = os.path.basename(doc.doc_id)
#     print(file_name)
#     # ids = [f"{doc.doc_id}_{i}" for i in range(len(chunks))]
#     # all_documents.extend(chunks)
#     # all_ids.extend(ids)
