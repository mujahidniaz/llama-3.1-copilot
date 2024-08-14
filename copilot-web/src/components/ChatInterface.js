import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import InputArea from "./InputArea";
import Message from "./Message";
import SidePanel from "./SidePanel";
import TypingAnimation from "./TypingAnimation";
import "../styles/ChatInterface.css";

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStopped, setGenerationStopped] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io("http://localhost:8000");

    socketRef.current.on("connect", () => {
      setIsConnected(true);
    });

    socketRef.current.on("disconnect", () => {
      setIsConnected(false);
    });

    socketRef.current.on("receive_message", (data) => {
      if (generationStopped) return;

      setMessages((prevMessages) => {
        const newMessages = [...prevMessages];
        if (newMessages[newMessages.length - 1]?.isUser) {
          newMessages.push({ text: data.content, isUser: false });
        } else {
          newMessages[newMessages.length - 1] = {
            text: newMessages[newMessages.length - 1].text + data.content,
            isUser: false,
          };
        }
        return newMessages;
      });
    });

    socketRef.current.on("generation_completed", () => {
      setIsGenerating(false);
    });

    return () => {
      socketRef.current.off("connect");
      socketRef.current.off("disconnect");
      socketRef.current.off("receive_message");
      socketRef.current.off("generation_completed");
      socketRef.current.disconnect();
    };
  }, [generationStopped]);

  const sendMessage = (message) => {
    if (!isConnected) return;

    const chatHistory = messages
      .slice(-2)
      .map((msg) => (msg.isUser ? `User: ${msg.text}` : `Bot: ${msg.text}`))
      .join("\n");

    setMessages((prevMessages) => [
      ...prevMessages,
      { text: message, isUser: true },
    ]);
    setIsGenerating(true);
    setGenerationStopped(false);
    socketRef.current.emit("send_message", {
      message: message,
      chat_history: chatHistory,
    });
  };

  const stopGeneration = () => {
    socketRef.current.emit("stop_generation");
    setIsGenerating(false);
    setGenerationStopped(true);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-interface">
      <div className="side-panel-container">
        <SidePanel />
      </div>
      <div className="main-chat">
        <div className="chat-header">
          <h2>Try the Art of Deduction</h2>
        </div>
        {!isConnected ? (
          <div className="connection-message">
            <p>Setting things up...</p>
            <div className="loading-animation"></div>
          </div>
        ) : (
          <>
            <div className="messages-container">
              {messages.map((msg, index) => (
                <Message key={index} text={msg.text} isUser={msg.isUser} />
              ))}
              {isGenerating && <TypingAnimation />}
              <div ref={messagesEndRef} />
            </div>
            <InputArea
              onSendMessage={sendMessage}
              onStopGeneration={stopGeneration}
              isGenerating={isGenerating}
              isConnected={isConnected}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;