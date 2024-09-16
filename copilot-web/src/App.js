import React, { useEffect } from "react";
import ChatInterface from "./components/ChatInterface";
import "./App.css";

function App() {
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "Sind Sie sicher, dass Sie die Seite verlassen möchten? Ihr Chatverlauf geht dabei verloren.";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <div className="App">
      <ChatInterface />
    </div>
  );
}

export default App;
