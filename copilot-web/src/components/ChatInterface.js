import React, { useState, useEffect, useRef } from "react";
import Message from "./Message";
import io from "socket.io-client";
import InputArea from "./InputArea";
import SidePanel from "./SidePanel";
import "../styles/ChatInterface.css";
import TypingAnimation from "./TypingAnimation";

const socket = io("http://localhost:8000");

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStopped, setGenerationStopped] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Listen for message chunks
    socket.on("receive_message", (data) => {
      if (generationStopped) return;

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
    });

    // Listen for generation completion
    socket.on("generation_completed", () => {
      setIsGenerating(false);
    });

    return () => {
      socket.off("receive_message");
      socket.off("generation_completed");
    };
  }, [generationStopped]);

  const sendMessage = (message) => {
    const context = messages.map((msg) => msg.text).join(" ") + " " + message;

    setMessages((prevMessages) => [
      ...prevMessages,
      { text: message, isUser: true },
    ]);
    setIsGenerating(true);
    setGenerationStopped(false);
    socket.emit("send_message", { message: context });
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
      <SidePanel />
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
