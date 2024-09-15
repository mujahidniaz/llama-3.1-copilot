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

  // Rest of the code...
};
