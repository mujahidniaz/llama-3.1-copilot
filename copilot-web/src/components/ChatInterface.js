import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import "../styles/ChatInterface.css";
import InputArea from "./InputArea";
import Message from "./Message";
import SidePanel from "./SidePanel";
import TypingAnimation from "./TypingAnimation";
import KnowledgeBaseModal from "./KnowledgeBaseModal";

const ChatInterface = () => {
  const [isKnowledgeBaseModalOpen, setIsKnowledgeBaseModalOpen] =
    useState(false);

  // ... rest of the code ...

  return (
    <div className="chat-interface">
      <div className="side-panel-container">
        <SidePanel
          useKnowledgeBase={useKnowledgeBase}
          setUseKnowledgeBase={setUseKnowledgeBase}
          relevantDocuments={relevantDocuments}
          setRelevantDocuments={setRelevantDocuments}
          chatHistoryMessages={chatHistoryMessages}
          setChatHistoryMessages={setChatHistoryMessages}
          openKnowledgeBaseModal={openKnowledgeBaseModal}
          closeKnowledgeBaseModal={closeKnowledgeBaseModal}
        />
      </div>
      <div className="main-chat">
        <div className="chat-header">
          <h2 style={{ fontFamily: "Exo" }}>TRY THE ART OF DEDUCTION</h2>
          <KnowledgeBaseModal
            isOpen={isKnowledgeBaseModalOpen}
            onClose={closeKnowledgeBaseModal}
          />
        </div>
        {/* ... rest of the code ... */}
      </div>
    </div>
  );
};

export default ChatInterface;
