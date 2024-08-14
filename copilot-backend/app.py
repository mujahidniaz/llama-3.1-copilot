import os
import threading

import ollama
from flask import Flask, request, jsonify
from flask_socketio import SocketIO
from flask_cors import CORS
import chromadb
from chromadb.config import DEFAULT_TENANT, DEFAULT_DATABASE, Settings
from chromadb.utils import embedding_functions
from llama_index.core import SimpleDirectoryReader

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")
print("Pulling Llama-3.1")

# Initialize Ollama client
client = ollama.Client(host='http://localhost:11434')
client.pull("llama3.1")
# Initialize ChromaDB client
chroma_client = chromadb.HttpClient(
    host="localhost",
    port=9000,
    ssl=False,
    headers=None,
    settings=Settings(),
    tenant=DEFAULT_TENANT,
    database=DEFAULT_DATABASE,
)

# Create or get ChromaDB collection
collection = chroma_client.create_collection(
    name="documents_collection",
    embedding_function=embedding_functions.DefaultEmbeddingFunction(),  # Chroma will use this to generate embeddings
    get_or_create=True
)

# A dictionary to keep track of active streams
active_streams = {}

SYSTEM_PROMPT = """
Your name is Sherlock, an AI assistant that answers queries based on local documents and general knowledge. Follow these guidelines:
1. If relevant information is found in the provided context, use it to answer accurately.
2. If no relevant information is in the context, state this clearly.
3. After stating no relevant information was found, answer using your general knowledge.
4. Always clarify when you're using local document info vs. general knowledge.
5. Be concise but thorough. Offer to elaborate if needed.
6. Maintain conversation flow by referring to chat history when appropriate.
7. If uncertain, state it clearly. Don't make up information.
8. For vague queries, ask for clarification or suggest related topics.

Your goal is to assist users with accurate, helpful information from documents or general knowledge."""


def handle_message_stream(message, chat_history, sid):
    try:
        results = collection.query(
            query_texts=[message], n_results=10
        )

        documents = results['documents'][0]
        ids = results['ids'][0]
        context = "\n\n".join(f"Document ID: {id}\nContent:\n{doc}" for id, doc in zip(ids, documents))

        # Construct the full context string
        full_context = (f"Chat History: {chat_history} \n\n"
                        f"Current Context:\n{context} \n\n"
                        f"Now answer the following query based on the context provided above:\n\n"
                        f"User Query: {message}")

        # Generate response using LLaMA model
        stream = client.chat(model='llama3.1', messages=[
            {'role': 'system', 'content': SYSTEM_PROMPT},
            {'role': 'user', 'content': full_context}

        ], stream=True)
        for chunk in stream:
            # Check if the generation has been stopped by the client
            if active_streams.get(sid) == 'stopped':
                break
            socketio.emit('receive_message', {'content': chunk['message']['content']}, room=sid)
        socketio.emit('generation_completed', room=sid)
    except Exception as e:
        print(f"Error: {e}")
        socketio.emit('receive_message', {'content': "Error generating response"}, room=sid)
    finally:
        # Cleanup the active stream entry after the response is completed or stopped
        active_streams.pop(sid, None)


@socketio.on('send_message')
def handle_message(data):
    sid = request.sid
    message = data.get('message', '')
    chat_history = data.get('chat_history', '')
    active_streams[sid] = 'active'  # Mark this stream as active
    thread = threading.Thread(target=handle_message_stream, args=(message, chat_history, sid))
    thread.start()


@socketio.on('stop_generation')
def stop_generation():
    sid = request.sid
    active_streams[sid] = 'stopped'  # Mark this stream as stopped


def split_document(doc_text, chunk_size=1000):
    """Split a document into smaller chunks."""
    return [doc_text[i:i + chunk_size] for i in range(0, len(doc_text), chunk_size)]

@app.route('/health')
def health_check():
    return jsonify({"status": "healthy"}), 200

@app.route('/add_documents', methods=['POST'])
def add_documents():
    directory_path = r"C:\Users\977mniaz\PycharmProjects\llama-3.1-copilot\data"

    if not directory_path or not os.path.isdir(directory_path):
        return jsonify({"error": "Invalid directory path"}), 400

    # Use LlamaIndex to read files (or any other method to read documents)
    documents = SimpleDirectoryReader(directory_path).load_data()

    all_documents = []
    all_ids = []

    # Split and add each document
    for doc in documents:
        chunks = split_document(doc.text)
        ids = [f"{doc.doc_id}_{i}" for i in range(len(chunks))]
        all_documents.extend(chunks)
        all_ids.extend(ids)

    # Add documents to ChromaDB
    collection.add(
        documents=all_documents,  # Document chunks
        ids=all_ids  # Unique IDs for each chunk
    )

    return jsonify({"status": "Documents added successfully"}), 200


if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=8000, debug=True, allow_unsafe_werkzeug=True)
