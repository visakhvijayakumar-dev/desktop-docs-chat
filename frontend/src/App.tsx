// FILE LOCATION: frontend/src/App.tsx
// REPLACE YOUR ENTIRE App.tsx WITH THIS COMPLETE VERSION

import React, { useEffect, useRef, useState } from "react";
import { ModelProviderSelector } from "./components/ModelProviderSelector";
import "./styles/app.css";

const API_BASE = "http://localhost:3001";
type Msg = { id: number; content: string; isUser: boolean };

// Provider/Model interfaces to match the component
interface Provider {
  id: string;
  name: string;
  description: string;
  isEnabled: boolean;
  models: Model[];
}

interface Model {
  id: string;
  name: string;
  description: string;
  maxTokens: number;
  isDefault: boolean;
}

export default function App() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: 1,
      content: "What's quantum computing? Answer in one sentence.",
      isUser: true,
    },
    {
      id: 2,
      content:
        "Quantum computing uses quantum effects like superposition and entanglement so it can solve certain problems far faster than classical computers.",
      isUser: false,
    },
  ]);

  // UI state
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [customInstructions, setCustomInstructions] = useState("");
  const [sidebarWidth, setSidebarWidth] = useState(380);
  const [isResizing, setIsResizing] = useState(false);

  // Provider/Model selection state
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(
    null
  );
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ingestDone, setIngestDone] = useState(false);

  // Streaming state
  const [streamingMessageId, setStreamingMessageId] = useState<number | null>(
    null
  );
  const [streamingContent, setStreamingContent] = useState("");

  // Refs
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const instructionsRef = useRef<HTMLTextAreaElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Handle provider/model changes
  const handleProviderModelChange = (
    provider: Provider | null,
    model: Model | null
  ) => {
    console.log("🔥 PROVIDER/MODEL CHANGED:");
    console.log("Provider:", provider?.name);
    console.log("Model:", model?.name);

    setSelectedProvider(provider);
    setSelectedModel(model);
  };

  // Helper functions
  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  const autoResize = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  useEffect(() => {
    autoResize(instructionsRef.current);
  }, [customInstructions]);

  // Sidebar resize handlers
  const handleMouseDown: React.MouseEventHandler<HTMLDivElement> = (e) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return;
    const w = Math.max(300, Math.min(560, e.clientX));
    setSidebarWidth(w);
  };

  const handleMouseUp = () => setIsResizing(false);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing]);

  // Send message function
  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    const newMessage: Msg = {
      id: Date.now(),
      content: userMessage,
      isUser: true,
    };
    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simple echo for testing
    setTimeout(() => {
      const response = `Echo: ${userMessage} (Using ${selectedProvider?.name} - ${selectedModel?.name})`;
      const botMessage: Msg = {
        id: Date.now() + 1,
        content: response,
        isUser: false,
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const startIngestion = async () => {
    setShowModal(true);
    setProgress(0);
    setIngestDone(false);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          setIngestDone(true);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);
  };

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar" style={{ width: sidebarWidth }}>
        {/* Provider/Model Selection Panel */}
        <div className="panel">
          <div className="title">AI Provider</div>
          <div className="subtitle">Choose your model</div>

          {/* Debug info */}
          <div
            style={{
              fontSize: "10px",
              background: "#ffffcc",
              padding: "4px",
              border: "1px solid #000",
              marginBottom: "8px",
            }}
          >
            <strong>Current:</strong>
            <br />
            {selectedProvider?.name || "None"} • {selectedModel?.name || "None"}
          </div>

          <ModelProviderSelector
            onSelectionChange={handleProviderModelChange}
            showLabels={false}
            compact={false}
            className="provider-selector"
          />
        </div>

        {/* Instructions Panel */}
        <div className="panel">
          <div className="title">Custom Instructions</div>
          <div className="subtitle">System prompt (optional)</div>
          <textarea
            ref={instructionsRef}
            className="instructions"
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            placeholder="e.g. You are a helpful assistant..."
            rows={3}
          />
        </div>

        {/* Upload Panel */}
        <div className="panel">
          <div className="title">Upload Files</div>
          <div className="subtitle">Add documents to your context</div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".txt,.pdf,.docx,.md"
            onChange={handleFileUpload}
            style={{ display: "none" }}
          />
          <button
            className="upload"
            onClick={() => fileInputRef.current?.click()}
          >
            📎 Choose Files
          </button>

          {uploadedFiles.length > 0 && (
            <div className="files">
              {uploadedFiles.map((file, idx) => (
                <div key={idx} className="file">
                  <span className="fileName">{file.name}</span>
                  <button
                    className="removeFile"
                    onClick={() => removeFile(idx)}
                  >
                    ×
                  </button>
                </div>
              ))}
              <button className="ingestFiles" onClick={startIngestion}>
                🔍 Process Files ({uploadedFiles.length})
              </button>
            </div>
          )}
        </div>

        {/* Actions Panel */}
        <div className="panel">
          <button className="clearChat" onClick={clearChat}>
            🗑️ Clear Chat
          </button>
        </div>
      </aside>

      {/* Resize Handle */}
      <div
        className="resizeHandle"
        onMouseDown={handleMouseDown}
        style={{ cursor: "col-resize" }}
      />

      {/* Main Chat */}
      <main className="main">
        <div className="messages">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`message ${msg.isUser ? "user" : "bot"}`}
            >
              <div className="content">{msg.content}</div>
            </div>
          ))}
          {isTyping && (
            <div className="message bot">
              <div className="content">Typing...</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="inputArea">
          <div className="inputWrapper">
            <textarea
              className="messageInput"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message... (Enter to send)"
              disabled={isTyping}
              rows={3}
            />
            <button
              className="sendButton"
              onClick={sendMessage}
              disabled={isTyping}
            >
              {isTyping ? "..." : "Send"}
            </button>
          </div>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="modal">
          <div className="modalContent">
            <div className="modalTitle">Processing Documents</div>
            <div className="progressBar">
              <div className="progressFill" style={{ width: `${progress}%` }} />
            </div>
            <div className="progressText">{Math.round(progress)}%</div>
            {ingestDone && (
              <div className="modalActions">
                <button
                  className="modalButton"
                  onClick={() => setShowModal(false)}
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
