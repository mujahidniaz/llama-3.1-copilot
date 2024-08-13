import json

import chromadb
from chromadb.config import DEFAULT_TENANT, DEFAULT_DATABASE, Settings
from chromadb.utils import embedding_functions

client = chromadb.HttpClient(
    host="localhost",
    port=9000,
    ssl=False,
    headers=None,
    settings=Settings(),
    tenant=DEFAULT_TENANT,
    database=DEFAULT_DATABASE,
)

# collection = client.create_collection(
#     name="documents_collection",
#     embedding_function=embedding_functions.DefaultEmbeddingFunction(),
#     get_or_create=True
# )
client.delete_collection("documents_collection")

# collection.add(documents=[
#     "phone",
#     "tv",
#     "trees",
#     "mangos",
#     "mobile phone",
#     "wood"
# ],
#     ids=["id1", "id2","id3", "id4","id5","wood6"])
# results = collection.query(
#     query_texts=["where can i get Sports stuff in europe?"],n_results=4
# )
# print(json.dumps(results))
