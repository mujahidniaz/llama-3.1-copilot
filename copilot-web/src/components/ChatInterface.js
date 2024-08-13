import InputArea from "./InputArea";
import Message from "./Message";
import SidePanel from "./SidePanel";
import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import "../styles/ChatInterface.css";
import TypingAnimation from "./TypingAnimation";

const socket = io("http://localhost:8000");

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStopped, setGenerationStopped] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.on("receive_message", (data) => {
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

    socket.on("generation_completed", () => {
      setIsGenerating(false);
    });

    return () => {
      socket.off("receive_message");
      socket.off("generation_completed");
    };
  }, [generationStopped]);

  const sendMessage = (message) => {
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
    socket.emit("send_message", {
      message: message,
      chat_history: chatHistory,
    });
  };

  const stopGeneration = () => {
    socket.emit("stop_generation");
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
        />
      </div>
    </div>
  );
};

export default ChatInterface;
