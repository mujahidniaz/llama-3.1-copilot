import axios from "axios";
import React, { useState } from "react";

const SidePanel = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [useKnowledgeBase, setUseKnowledgeBase] = useState(false);

  const handleLoadData = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setNotification(null);

    try {
      const response = await axios.post("http://localhost:8000/add_documents");
      setNotification({ type: "success", message: response.data.status });
    } catch (error) {
      const errorMessage = error.response
        ? error.response.data.error || "An error occurred"
        : "Failed to load data";
      setNotification({ type: "error", message: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="side-panel">
      <div
        className="logo-container"
        style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}
      >
        <div className="logo" style={{ marginRight: "10px" }}>
          <svg viewBox="0 0 100 100" width="40" height="40">
            <circle cx="50" cy="50" r="45" fill="#ffffff" />
            <text
              x="50"
              y="50"
              fontFamily="Arial"
              fontSize="40"
              fill="#5e72e4"
              textAnchor="middle"
              dominantBaseline="central"
            >
              S
            </text>
          </svg>
        </div>
        <h1 style={{ fontSize: "30px", fontWeight: "bold" }}>Sherlock</h1>
      </div>

      <div
        className="heartbeat-container"
        style={{ marginBottom: "20px", textAlign: "center" }}
      >
        <svg width="100" height="50" viewBox="0 0 100 50">
          <polyline
            points="0,25 20,25 30,10 40,40 50,25 60,25 70,10 80,40 90,25 100,25"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
            className="heartbeat"
          />
        </svg>
      </div>

      <div className="features">
        <div className="toggle-container">
          <span className="toggle-label">Use Knowledge Base</span>
          <div
            className={`toggle-button ${useKnowledgeBase ? "active" : ""}`}
            onClick={() => setUseKnowledgeBase(!useKnowledgeBase)}
          >
            <div className="toggle-switch"></div>
          </div>
        </div>

        <button
          className={`load-data-button ${isLoading ? "disabled" : ""}`}
          onClick={handleLoadData}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Load Knowledge Base"}
        </button>
      </div>

      {notification && (
        <div className={`notification ${notification.type}`}>
          <p>{notification.message}</p>
        </div>
      )}
    </div>
  );
};

export default SidePanel;
