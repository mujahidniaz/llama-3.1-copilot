import os
import fitz  # PyMuPDF
import numpy as np
import pandas as pd
from flask import Flask, request
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import ollama
import marqo
import threading

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")
print("Pulling Llama-3.1")

# Initialize Ollama client
client = ollama.Client(host='http://localhost:11434')
client.pull("llama3.1")

# A dictionary to keep track of active streams
active_streams = {}


def handle_message_stream(message, sid):
    try:
        stream = client.chat(model='llama3.1', messages=[{'role': 'user', 'content': message}], stream=True)
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
    active_streams[sid] = 'active'  # Mark this stream as active
    thread = threading.Thread(target=handle_message_stream, args=(message, sid))
    thread.start()


@socketio.on('stop_generation')
def stop_generation():
    sid = request.sid
    active_streams[sid] = 'stopped'  # Mark this stream as stopped


if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=8000, debug=True, allow_unsafe_werkzeug=True)
