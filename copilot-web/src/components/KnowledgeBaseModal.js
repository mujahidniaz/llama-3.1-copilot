import React from "react";
import "../styles/KnowledgeBaseModal.css";

const KnowledgeBaseModal = ({ isOpen, onClose }) => {
  return (
    <div
      className={`knowledge-base-modal ${isOpen ? "open" : ""}`}
      onClick={onClose}
    >
      <div className="modal-content">
        <h2>Knowledge Base</h2>
        <p>
          This is a sample knowledge base. You can add more information here.
        </p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default KnowledgeBaseModal;
