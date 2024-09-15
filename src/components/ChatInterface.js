// src/components/ChatInterface.js
import React from 'react';
import { useContext } from 'react';
import { KnowledgeBaseContext } from '../context/KnowledgeBaseContext';

const ChatInterface = () => {
  const {
    useKnowledgeBase,
    setUseKnowledgeBase,
    relevantDocuments,
    setRelevantDocuments,
    chatHistoryMessages,
    setChatHistoryMessages,
    openKnowledgeBaseModal,
    setOpenKnowledgeBaseModal,
  } = useContext(KnowledgeBaseContext);

  return (
    <div>
      <button onClick={() => setOpenKnowledgeBaseModal(true)}>Open Modal</button>
      {openKnowledgeBaseModal && (
        <div className="modal">
          <h2>Knowledge Base</h2>
          <button className="delete-button">Delete</button>
          <button className="add-new-file-button">Add New File</button>
          <button onClick={() => setOpenKnowledgeBaseModal(false)}>Close</button>
        </div>
      )}
    </div>
  );
};
