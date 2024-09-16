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
import os


def get_env_as_int(var_name, default=0):
    """
    Retrieve an environment variable and convert it to an integer.

    :param var_name: Name of the environment variable.
    :param default: Default value to return if the environment variable is not set
                    or cannot be converted to an integer. Defaults to 0.
    :return: Integer value of the environment variable or the default value.
    """
    # Retrieve the environment variable as a string
    env_var_str = os.getenv(var_name, str(default))  # Default to str(default) if not set

    try:
        # Convert the string to an integer
        return int(env_var_str)
    except ValueError:
        # Handle cases where conversion fails
        print(f"Warning: Environment variable '{var_name}' is not a valid integer. Returning default value.")
        return default


def get_env_as_float(var_name, default=0.5):
    """
    Retrieve an environment variable and convert it to an integer.

    :param var_name: Name of the environment variable.
    :param default: Default value to return if the environment variable is not set
                    or cannot be converted to an integer. Defaults to 0.
    :return: Integer value of the environment variable or the default value.
    """
    # Retrieve the environment variable as a string
    env_var_str = os.getenv(var_name, str(default))  # Default to str(default) if not set

    try:
        # Convert the string to an integer
        return float(env_var_str)
    except ValueError:
        # Handle cases where conversion fails
        print(f"Warning: Environment variable '{var_name}' is not a valid integer. Returning default value.")
        return default


# Example usage


app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")
MODEL = os.environ.get('OLLAMA_MODEL', "llama3.1:8b-instruct-q2_K")
CHROMA_HOST = os.environ.get('CHROMA_HOST', "chromadb")
CHROMA_PORT = os.environ.get('CHROMA_PORT', "8000")
CHROMA_COLLECTION = os.environ.get('CHROMA_COLLECTION', "documents_collection")
OLLAMA_HOST = os.environ.get('OLLAMA_HOST', "http://ollama-api:11434")
CHUNK_SIZE = get_env_as_int('CHUNK_SIZE', 1000)
TEMP_KNOWLEDGE_BASE = get_env_as_float('TEMP_KNOWLEDGE_BASE', 0.4)
TEMP_GEN_KNOWLEDGE = get_env_as_float('TEMP_GEN_KNOWLEDGE', 0.7)
# Initialize Ollama client
client = ollama.Client(host=OLLAMA_HOST)
print(f"Pulling {MODEL}")
client.pull(model=MODEL)
client.generate(model=MODEL, prompt='test', keep_alive=-1)
# client.generate(model=MODEL,stream=True)
# Initialize ChromaDB client
chroma_client = chromadb.HttpClient(
    host=CHROMA_HOST,
    port=CHROMA_PORT,
    ssl=False,
    headers=None,
    settings=Settings(),
    tenant=DEFAULT_TENANT,
    database=DEFAULT_DATABASE,
)
UPLOAD_FOLDER = '/data'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


# Create or get ChromaDB collection
def split_document(doc_text, chunk_size=CHUNK_SIZE):
    """Split a document into smaller chunks based on word count."""
    words = doc_text.split()
    return [' '.join(words[i:i + chunk_size]) for i in range(0, len(words), chunk_size)]


def add_documents():
    try:
        chroma_client.delete_collection(CHROMA_COLLECTION)
    except:
        print("collection doesnt exist!!")
    collection = chroma_client.create_collection(
        name=CHROMA_COLLECTION,
        embedding_function=embedding_functions.DefaultEmbeddingFunction(),
        # Chroma will use this to generate embeddings
        get_or_create=True
    )

    if not app.config['UPLOAD_FOLDER'] or not os.path.isdir(app.config['UPLOAD_FOLDER']):
        return

    # Use LlamaIndex to read files (or any other method to read documents)
    documents = SimpleDirectoryReader(app.config['UPLOAD_FOLDER'], filename_as_id=True).load_data()

    all_documents = []
    all_ids = []

    # Split and add each document
    for doc in documents:
        chunks = split_document(doc.text)
        ids = [f"{os.path.basename(doc.doc_id)}_{i}" for i in range(len(chunks))]
        all_documents.extend(chunks)
        all_ids.extend(ids)
    if len(all_ids)>0:
        # Add documents to ChromaDB
        collection.add(
            documents=all_documents,  # Document chunks
            ids=all_ids  # Unique IDs for each chunk
        )

    return


add_documents()
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
9. Always provide citations if local knowledge is used otherwise mentioned that its from the general knowledge and not from the documents.

Your goal is to assist users with accurate, helpful information from documents or general knowledge."""


def handle_message_stream(message, chat_history, use_knowledge_base, relevant_documents, sid):
    try:
        options = {"temperature": TEMP_GEN_KNOWLEDGE}

        print(chat_history)
        context = ""
        collection = chroma_client.create_collection(
            name=CHROMA_COLLECTION,
            embedding_function=embedding_functions.DefaultEmbeddingFunction(),
            # Chroma will use this to generate embeddings
            get_or_create=True
        )
        if use_knowledge_base:
            options = {
                "temperature": TEMP_KNOWLEDGE_BASE}
            results = collection.query(
                query_texts=[message], n_results=relevant_documents
            )
            documents = results['documents'][0]
            ids = results['ids'][0]
            context = "\n\n".join(f"Document ID: {id}\nContent:\n{doc}" for id, doc in zip(ids, documents))

        # Construct the full context string
        full_context = f"User Query: {message}\n\n"
        if chat_history:
            full_context = f"Chat History: {chat_history}\n\n" + full_context
        if context:
            full_context = f"Current Context:\n{context}\n\n" + full_context

        # Generate response using LLaMA model
        stream = client.chat(model=MODEL, keep_alive=-1, messages=[
            {'role': 'system', 'content': SYSTEM_PROMPT},
            {'role': 'user', 'content': full_context}
        ], options=options, stream=True)

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
    use_knowledge_base = data.get('use_knowledge_base', False)
    relevant_documents = data.get('relevant_documents', 5)
    print(relevant_documents)
    active_streams[sid] = 'active'  # Mark this stream as active
    thread = threading.Thread(target=handle_message_stream,
                              args=(message, chat_history, use_knowledge_base, relevant_documents, sid))
    thread.start()


@socketio.on('stop_generation')
def stop_generation():
    sid = request.sid
    active_streams[sid] = 'stopped'  # Mark this stream as stopped


@app.route('/health')
def health_check():
    return jsonify({"status": "healthy"}), 200


@app.route('/upload', methods=['POST'])
def upload_files():
    if 'files' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400

    files = request.files.getlist('files')

    if not files or files[0].filename == '':
        return jsonify({'error': 'No files selected for uploading'}), 400

    uploaded_files = []
    for file in files:
        if file:
            filename = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
            file.save(filename)
            uploaded_files.append(file.filename)

    add_documents()
    return jsonify({
        'message': 'Files successfully uploaded',
        'uploaded_files': uploaded_files
    }), 200


@app.route('/list_files', methods=['GET'])
def list_files():
    files = []
    for filename in os.listdir(UPLOAD_FOLDER):
        if "do_not_delete.file" in filename:
            continue
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        if os.path.isfile(file_path):
            stats = os.stat(file_path)
            files.append({
                'name': filename,
                'size': stats.st_size
            })

    return jsonify(files), 200


@app.route('/delete_files', methods=['POST'])
def delete_files():
    data = request.json
    if not data:
        return jsonify({'error': 'No files specified for deletion'}), 400

    files_to_delete = data['files']

    if not isinstance(files_to_delete, list):
        return jsonify({'error': 'Files must be provided as a list'}), 400

    results = []
    for filename in files_to_delete:
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)

        if not os.path.exists(file_path):
            results.append({'filename': filename, 'status': 'error', 'message': 'File not found'})
        elif not os.path.isfile(file_path):
            results.append({'filename': filename, 'status': 'error', 'message': 'Not a file'})
        else:
            try:
                os.remove(file_path)
                results.append({'filename': filename, 'status': 'success', 'message': 'File deleted'})
            except Exception as e:
                results.append({'filename': filename, 'status': 'error', 'message': str(e)})
    add_documents()
    return jsonify({'results': results}), 200


if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=8000, debug=True, allow_unsafe_werkzeug=True)
