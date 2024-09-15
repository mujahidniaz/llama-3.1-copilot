// src/context/KnowledgeBaseContext.js
import { createContext, useState } from 'react';

const KnowledgeBaseContext = createContext();

const KnowledgeBaseProvider = ({ children }) => {
  const [useKnowledgeBase, setUseKnowledgeBase] = useState(false);
  const [relevantDocuments, setRelevantDocuments] = useState([]);
  const [chatHistoryMessages, setChatHistoryMessages] = useState([]);
  const [openKnowledgeBaseModal, setOpenKnowledgeBaseModal] = useState(false);

  return (
    <KnowledgeBaseContext.Provider
      value={{
        useKnowledgeBase,
        setUseKnowledgeBase,
        relevantDocuments,
        setRelevantDocuments,
        chatHistoryMessages,
        setChatHistoryMessages,
        openKnowledgeBaseModal,
        setOpenKnowledgeBaseModal,
      }}
    >
      {children}
    </KnowledgeBaseContext.Provider>
  );
};

export { KnowledgeBaseProvider, KnowledgeBaseContext };
