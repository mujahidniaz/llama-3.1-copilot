import os

from flask import Flask, request
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import ollama

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")
print("Pulling Llama-3.1")
client = ollama.Client(host='http://ollama-api:11434')
client.pull("llama3.1")


@socketio.on('send_message')
def handle_message(data):
    message = data.get('message', '')

    try:

        stream = client.chat(model='llama3.1', messages=[{'role': 'user', 'content': message}], stream=True)
        for chunk in stream:
            emit('receive_message', {'content': chunk['message']['content']})
    except Exception as e:
        print(f"Error: {e}")
        emit('receive_message', {'content': "Error generating response"})


if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=8000, debug=True,allow_unsafe_werkzeug=True)
