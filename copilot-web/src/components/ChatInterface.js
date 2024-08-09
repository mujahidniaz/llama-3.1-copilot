import React, { useState, useEffect, useRef } from "react";
import Message from "./Message";
import io from "socket.io-client";

import InputArea from "./InputArea";
import "../styles/ChatInterface.css";
import TypingAnimation from "./TypingAnimation";
const socket = io("http://localhost:8000");
//const socket = io("http://localhost:8000");
const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessages((prevMessages) => {
        const newMessages = [...prevMessages];
        if (newMessages[newMessages.length - 1].isUser) {
          newMessages.push({ text: data.content, isUser: false });
        } else {
          newMessages[newMessages.length - 1] = {
            text: newMessages[newMessages.length - 1].text + data.content,
            isUser: false,
          };
        }
        return newMessages;
      });
      setIsGenerating(false);
    });

    return () => {
      socket.off("receive_message");
    };
  }, []);

  const sendMessage = (message) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: message, isUser: true },
    ]);
    setIsGenerating(true);
    socket.emit("send_message", { message });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-interface">
      <div className="side-panel">
        <div className="logo-container">
          <div className="logo">
            {/* Replace with your actual logo */}
            <svg viewBox="0 0 100 100" width="80" height="80">
              <circle cx="50" cy="50" r="45" fill="#667eea" />
              <text
                x="50"
                y="50"
                fontFamily="Arial"
                fontSize="40"
                fill="white"
                textAnchor="middle"
                dominantBaseline="central"
              >
                L3
              </text>
            </svg>
          </div>
          <h1>LLaMA 3</h1>
        </div>
        <div className="ai-animation">
          <div className="node n1"></div>
          <div className="node n2"></div>
          <div className="node n3"></div>
          <div className="node n4"></div>
          <div className="node n5"></div>
          <div className="node n6"></div>
        </div>
        <div className="welcome-message">
          <h2>Welcome to the future of conversation</h2>
          <p>
            Powered by advanced AI, I'm here to assist you with any questions or
            tasks you have.
          </p>
        </div>
        <div className="features">
          <div className="feature">
            <span className="feature-icon">🚀</span>
            <span className="feature-text">Lightning-fast responses</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🧠</span>
            <span className="feature-text">
              Advanced language understanding
            </span>
          </div>
          <div className="feature">
            <span className="feature-icon">🔒</span>
            <span className="feature-text">
              Secure and private conversations
            </span>
          </div>
        </div>
      </div>
      <div className="main-chat">
        <div className="chat-header">
          <h2>Chat with LLaMA 3</h2>
        </div>
        <div className="messages-container">
          {messages.map((msg, index) => (
            <Message key={index} text={msg.text} isUser={msg.isUser} />
          ))}
          {isGenerating && <TypingAnimation />}
          <div ref={messagesEndRef} />
        </div>
        <InputArea onSendMessage={sendMessage} />
      </div>
    </div>
  );
};

export default ChatInterface;
