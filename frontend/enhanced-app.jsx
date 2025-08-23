import React, { useState, useRef, useEffect } from "react";

// Enhanced App.jsx with dynamic provider/model selection
// Frontend calls: POST http://localhost:3001/api/chat with streaming support

const API_BASE = "http://localhost:3001"; // your existing backend

export default function App() {
  const [messages, setMessages] = useState([
    { id: 1, content: "What's quantum computing? Answer in one sentence.", isUser: true },
    { id: 2, content: "Quantum computing uses quantum effects like superposition and entanglement so it can solve certain problems far faster than classical computers.", isUser: false },
  ]);

  // Chat + UI state
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [customInstructions, setCustomInstructions] = useState("");
  const [sidebarWidth, setSidebarWidth] = useState(380);
  const [isResizing, setIsResizing] = useState(false);

  // Enhanced Provider/Model state
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [providersLoading, setProvidersLoading] = useState(true);

  // Legacy compatibility
  const [provider, setProvider] = useState("anthropic");
  const [graniteModel, setGraniteModel] = useState("ibm/granite-3-3-8b-instruct");

  // Ingestion modal state
  const [showModal, setShowModal] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ingestDone, setIngestDone] = useState(false);

  // Streaming state
  const [streamingMessageId, setStreamingMessageId] = useState(null);
  const [streamingContent, setStreamingContent] = useState("");

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const instructionsRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Fetch providers and models on mount
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        // Try to fetch from the new endpoint first
        const response = await fetch(`${API_BASE}/api/providers/models`);
        if (response.ok) {
          const data = await response.json();
          setProviders(data.providers || []);
          
          // Set default selection
          if (data.defaultSelection) {
            const defaultProvider = data.providers.find(p => p.id === data.defaultSelection.providerId);
            const defaultModel = defaultProvider?.models.find(m => m.id === data.defaultSelection.modelId);
            
            if (defaultProvider && defaultModel) {
              setSelectedProvider(defaultProvider);
              setSelectedModel(defaultModel);
              setProvider(defaultProvider.id);
            }
          }
        } else {
          // Fallback to static providers if new endpoint doesn't exist
          const fallbackProviders = [
            { id: "anthropic", name: "Anthropic", isEnabled: true, models: [
              { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet", isDefault: true }
            ]},
            { id: "granite", name: "Granite", isEnabled: true, models: [
              { id: "ibm/granite-3-3-8b-instruct", name: "Granite 3.0 8B", isDefault: true }
            ]},
            { id: "openai", name: "OpenAI", isEnabled: true, models: [
              { id: "gpt-4o", name: "GPT-4o", isDefault: true }
            ]},
          ];
          setProviders(fallbackProviders);
          setSelectedProvider(fallbackProviders[0]);
          setSelectedModel(fallbackProviders[0].models[0]);
        }
      } catch (error) {
        console.error("Error fetching providers:", error);
        // Set minimal fallback
        setProviders([]);
      } finally {
        setProvidersLoading(false);
      }
    };

    fetchProviders();
  }, []);

  // Update legacy provider state when selection changes
  useEffect(() => {
    if (selectedProvider) {
      setProvider(selectedProvider.id);
      if (selectedProvider.id === "granite" && selectedModel) {
        setGraniteModel(selectedModel.id);
      }
    }
  }, [selectedProvider, selectedModel]);

  // ----- helpers -----
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [messages, streamingContent]);

  // Auto-grow instructions textarea
  const autoResize = (el) => { if (!el) return; el.style.height = "auto"; el.style.height = el.scrollHeight + "px"; };
  useEffect(() => { autoResize(instructionsRef.current); }, [customInstructions]);

  // Sidebar resize
  const handleMouseDown = (e) => { setIsResizing(true); e.preventDefault(); };
  const handleMouseMove = (e) => { if (!isResizing) return; const w = Math.max(300, Math.min(560, e.clientX)); setSidebarWidth(w); };
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

  // Handle provider selection
  const handleProviderChange = (providerId) => {
    const newProvider = providers.find(p => p.id === providerId);
    if (newProvider) {
      setSelectedProvider(newProvider);
      // Auto-select the default model or first model
      const defaultModel = newProvider.models?.find(m => m.isDefault) || newProvider.models?.[0];
      setSelectedModel(defaultModel || null);
    }
  };

  // Handle model selection
  const handleModelChange = (modelId) => {
    if (selectedProvider) {
      const newModel = selectedProvider.models?.find(m => m.id === modelId);
      setSelectedModel(newModel || null);
    }
  };

  // Get current provider display name
  const getCurrentProviderName = () => {
    return selectedProvider?.name || provider;
  };

  // Get current model display name
  const getCurrentModelName = () => {
    return selectedModel?.name || (provider === "granite" ? graniteModel : "Default");
  };

  // Build provider-agnostic chat messages (OpenAI style)
  const toChatMessages = () => {
    const history = messages.map(m => ({ role: m.isUser ? "user" : "assistant", content: m.content }));
    const sys = customInstructions?.trim() ? [{ role: "system", content: customInstructions.trim() }] : [];
    return [...sys, ...history];
  };

  const addMessage = (content, isUser = true) =>
    setMessages(prev => [...prev, { id: Date.now(), content, isUser }]);

  const formatMessage = (content) => {
    if (!content) return "";
    
    // Simple approach: just format the text with proper line breaks and basic structure
    const lines = content.split('\n').filter(line => line.trim());
    const result = [];
    let currentList = [];
    let listType = null; // 'numbered' or 'bullet'
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check if it's a numbered item (1. 2. 3. etc.)
      const numberedMatch = line.match(/^(\d+)\.\s*(.+)/);
      if (numberedMatch) {
        if (listType !== 'numbered') {
          // Start new numbered list
          if (currentList.length > 0) {
            result.push(createList(currentList, listType));
            currentList = [];
          }
          listType = 'numbered';
        }
        currentList.push(numberedMatch[2]);
        continue;
      }
      
      // Check if it's a bullet item
      const bulletMatch = line.match(/^[-•]\s*(.+)/);
      if (bulletMatch) {
        if (listType !== 'bullet') {
          // Start new bullet list
          if (currentList.length > 0) {
            result.push(createList(currentList, listType));
            currentList = [];
          }
          listType = 'bullet';
        }
        currentList.push(bulletMatch[1]);
        continue;
      }
      
      // Regular line - end any current list and add as paragraph
      if (currentList.length > 0) {
        result.push(createList(currentList, listType));
        currentList = [];
        listType = null;
      }
      
      if (line) {
        result.push(<p key={`p-${i}`} style={{ margin: '0 0 8px 0', lineHeight: '1.5' }}>{line}</p>);
      }
    }
    
    // Handle any remaining list
    if (currentList.length > 0) {
      result.push(createList(currentList, listType));
    }
    
    return <div>{result}</div>;
  };
  
  const createList = (items, type) => {
    const ListComponent = type === 'numbered' ? 'ol' : 'ul';
    return (
      <ListComponent key={`list-${Date.now()}`} style={{ margin: '8px 0', paddingLeft: '24px' }}>
        {items.map((item, i) => (
          <li key={i} style={{ margin: '4px 0', lineHeight: '1.5' }}>
            <span dangerouslySetInnerHTML={{ 
              __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
            }} />
          </li>
        ))}
      </ListComponent>
    );
  };

  const sendMessage = async () => {
    const user = inputValue.trim();
    if (!user) return;

    // Optimistically render user's message
    addMessage(user, true);
    setInputValue("");
    setIsTyping(true);

    // Create streaming message placeholder
    const streamingId = Date.now() + 1;
    setStreamingMessageId(streamingId);
    setStreamingContent("");

    // IMPORTANT: include the just-typed turn in the payload (state updates are async)
    const base = toChatMessages();
    const messagesToSend = [...base, { role: "user", content: user }];

    // Create abort controller for this request
    abortControllerRef.current = new AbortController();

    // Determine if we should use streaming (for Anthropic and Granite)
    const useStreaming = provider === "anthropic" || provider === "granite";
    const endpoint = useStreaming ? "/api/chat/stream" : "/api/chat";

    // Prepare payload with model information
    const payload = { 
      provider, 
      messages: messagesToSend
    };

    // Add model-specific parameters
    if (selectedModel) {
      payload.modelId = selectedModel.id;
    }
    
    if (provider === "granite") {
      payload.graniteModel = selectedModel?.id || graniteModel;
    }

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: abortControllerRef.current.signal
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData?.error || `${res.status} ${res.statusText}`);
      }

      if (useStreaming) {
        // Handle streaming response
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let accumulatedContent = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            
            // Keep the last incomplete line in buffer
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.trim() === '') continue;
              
              try {
                const parsed = JSON.parse(line);
                
                if (parsed.type === "delta" && parsed.text) {
                  accumulatedContent += parsed.text;
                  setStreamingContent(accumulatedContent);
                } else if (parsed.type === "done") {
                  // Stream is complete
                  break;
                } else if (parsed.type === "error") {
                  throw new Error(parsed.error || "Stream error");
                }
              } catch (e) {
                // If line is not valid JSON, skip it
                console.warn("Invalid JSON in stream:", line);
              }
            }
          }
        } finally {
          reader.releaseLock();
        }

        // Add final message and clean up streaming state
        if (accumulatedContent.trim()) {
          addMessage(accumulatedContent, false);
        } else {
          addMessage("(no response received)", false);
        }
        
      } else {
        // Handle regular JSON response (OpenAI fallback)
        const data = await res.json();
        addMessage(data.text || JSON.stringify(data), false);
      }
      
    } catch (err) {
      if (err.name !== 'AbortError') {
        addMessage(`(error) ${String(err.message || err)}`, false);
      }
    } finally {
      setIsTyping(false);
      setStreamingMessageId(null);
      setStreamingContent("");
      abortControllerRef.current = null;
    }
  };

  const handleKeyPress = (e) => { 
    if (e.key === "Enter" && !e.shiftKey) { 
      e.preventDefault(); 
      sendMessage(); 
    } 
  };

  // Stop streaming function
  const stopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  // ----- ingestion modal -----
  const startIngestion = () => {
    setProgress(0);
    setIngestDone(false);
    setShowModal(true);
    // fake progress animation
    let p = 0;
    const id = setInterval(() => {
      p = Math.min(100, p + Math.floor(Math.random() * 9) + 3);
      setProgress(p);
      if (p >= 100) {
        clearInterval(id);
        setTimeout(() => setIngestDone(true), 350);
      }
    }, 260);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files).filter(f => f.type === "application/pdf");
    if (!files.length) { setShowModal(false); return; }
    // Show modal immediately and start progress
    startIngestion();
    // Update UI list
    setUploadedFiles(prev => prev.concat(files).slice(0, 5));
  };

  // ----- render -----
  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar" style={{ width: sidebarWidth }}>
        {/* Provider selector */}
        <div className="panel">
          <div className="title">Model Provider</div>
          {providersLoading ? (
            <div className="loading">Loading providers...</div>
          ) : (
            <>
              <div className="seg">
                {providers.filter(p => p.isEnabled).map((p) => (
                  <label key={p.id} className={`segBtn ${selectedProvider?.id === p.id ? "active" : ""}`}>
                    <input 
                      type="radio" 
                      name="provider" 
                      value={p.id} 
                      checked={selectedProvider?.id === p.id} 
                      onChange={() => handleProviderChange(p.id)} 
                    />
                    {p.name}
                  </label>
                ))}
              </div>
              
              {/* Model Selection */}
              {selectedProvider && selectedProvider.models && selectedProvider.models.length > 0 && (
                <div className="field">
                  <div className="label">Model ({selectedProvider.models.length} available)</div>
                  <select 
                    className="modelSelect" 
                    value={selectedModel?.id || ""} 
                    onChange={(e) => handleModelChange(e.target.value)}
                  >
                    {selectedProvider.models.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name}
                        {model.isDefault ? " (default)" : ""}
                        {model.maxTokens ? ` • ${model.maxTokens >= 1000000 ? (model.maxTokens/1000000).toFixed(1)+'M' : (model.maxTokens/1000).toFixed(0)+'K'} tokens` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Legacy Granite model input for backwards compatibility */}
              {provider === "granite" && !selectedModel && (
                <div className="field">
                  <div className="label">Granite model_id</div>
                  <input className="textInput" value={graniteModel} onChange={(e) => setGraniteModel(e.target.value)} placeholder="ibm/granite-3-3-8b-instruct" />
                </div>
              )}

              {/* Current Selection Display */}
              {selectedProvider && selectedModel && (
                <div className="currentSelection">
                  <div className="selectionTitle">Current: {getCurrentProviderName()}</div>
                  <div className="selectionModel">{getCurrentModelName()}</div>
                  {selectedModel.description && (
                    <div className="selectionDesc">{selectedModel.description}</div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Uploads */}
        <div className="panel">
          <div className="title">Upload Documents</div>
          <div className="subtitle">Max 5 PDF files</div>
          <button
            className="upload"
            onClick={() => {
              setProgress(0);
              setIngestDone(false);
              setShowModal(true); // show immediately
              fileInputRef.current?.click();
            }}
          >
            [ + ] Upload PDFs
          </button>
          <input ref={fileInputRef} type="file" accept=".pdf" multiple onChange={handleFileUpload} style={{ display: "none" }} />
          <div className="files">
            {uploadedFiles.map((f, i) => (
              <div key={i} className="file">
                <span className="fname">{f.name}</span>
                <button
                  className="fdel"
                  aria-label="Remove file"
                  title="Remove"
                  onClick={() => setUploadedFiles(prev => prev.filter((_, idx) => idx !== i))}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="panel grow">
          <div className="title">Custom Instructions</div>
          <textarea
            ref={instructionsRef}
            className="textarea"
            value={customInstructions}
            onChange={(e) => { setCustomInstructions(e.target.value); autoResize(e.target); }}
            placeholder="Type here…"
            rows={6}
          />
        </div>
      </aside>

      {/* Divider */}
      <div className="divider" onMouseDown={handleMouseDown}><div className="grip" /></div>

      {/* Chat */}
      <main className="main">
        <div className="chat">
          <header className="chatHdr">
            <div>AI Chat</div>
            {selectedProvider && selectedModel && (
              <div className="chatModel">
                {selectedProvider.name} • {selectedModel.name}
              </div>
            )}
          </header>

          <section className="msgs">
            {messages.map((m) => (
              <div key={m.id} className={`bubble ${m.isUser ? "user" : "ai"}`}>
                <span className="tail" />
                <div className="bubble-content">
                  {m.isUser ? m.content : formatMessage(m.content)}
                </div>
              </div>
            ))}
            {/* Show streaming message */}
            {streamingMessageId && (
              <div className="bubble ai streaming">
                <span className="tail" />
                <div className="bubble-content">
                  {formatMessage(streamingContent)}
                  <span className="cursor">|</span>
                </div>
              </div>
            )}
            {isTyping && !streamingMessageId && (
              <div className="bubble ai typing">
                <span className="tail" />
                <div className="bubble-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </section>

          <footer className="inputRow">
            <textarea
              className="msgInput"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message…"
              rows={2}
              disabled={isTyping}
            />
            {isTyping && streamingMessageId ? (
              <button className="send stop" onClick={stopStreaming}>Stop</button>
            ) : (
              <button className="send" onClick={sendMessage} disabled={isTyping}>Send</button>
            )}
          </footer>
        </div>
      </main>

      {/* Ingestion Modal */}
      {showModal && (
        <div className="modalOverlay">
          <div className="modal">
            {!ingestDone ? (
              <>
                <div className="modalTitle">Ingesting PDFs…</div>
                <div className="progress"><div className="bar" style={{ width: `${progress}%` }} /></div>
                <div className="progressMeta">{progress}%</div>
                <div className="hint">Chunking, embedding & indexing your documents…</div>
              </>
            ) : (
              <>
                <div className="modalTitle">Ingestion Complete</div>
                <div className="matches">
                  <div className="matchTitle">Indexed Files</div>
                  {uploadedFiles.length === 0 && <div className="match">(none)</div>}
                  {uploadedFiles.map((f, i) => (<div key={i} className="match">✓ {f.name}</div>))}
                </div>
                <button className="okBtn" onClick={() => setShowModal(false)}>OK</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Styles */}
      <style>{`
        :root { --border:#000; --bg:#fff; --bg-2:#f6f6f6; --text:#111; --shadow:4px 4px 0 var(--border); }
        *{ box-sizing:border-box; }
        html,body,#root{ height:100%; }
        body{ margin:0; font-family: ui-monospace, Menlo, Consolas, 'Courier New', monospace; color:var(--text); background:var(--bg);} 
        .app{ height:100dvh; display:flex; overflow:hidden; }

        /* Sidebar */
        .sidebar{ display:flex; flex-direction:column; border-right:2px solid var(--border); background:var(--bg);} 
        .panel{ border-bottom:2px solid var(--border); padding:14px;} 
        .panel.grow{ flex:1; display:flex; flex-direction:column;} 
        .title{ font-weight:800; margin-bottom:8px; }
        .subtitle{ color:#555; font-size:12px; margin-bottom:10px; }
        .loading{ color:#666; font-size:12px; padding:8px; }

        /* Provider segmented buttons */
        .seg{ display:grid; grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)); gap:8px; margin-bottom:10px; }
        .segBtn{ border:2px solid var(--border); padding:8px; text-align:center; cursor:pointer; user-select:none; box-shadow:var(--shadow); background:var(--bg-2); font-weight:800; font-size:11px; }
        .segBtn input{ display:none; }
        .segBtn.active{ background:var(--text); color:var(--bg); }

        /* Text inputs and selects */
        .field{ margin-bottom:10px; }
        .label{ font-size:12px; margin-bottom:4px; font-weight:600; }
        .textInput, .modelSelect{ width:100%; border:2px solid var(--border); padding:10px; background:var(--text); color:var(--bg); box-shadow: inset 2px 2px 0 var(--border); font-family: inherit; font-size:12px; }
        .textInput::placeholder{ color:#cfcfcf; }
        .modelSelect{ background:var(--bg-2); color:var(--text); cursor:pointer; }
        .modelSelect option{ background:var(--bg); color:var(--text); }

        /* Current Selection Display */
        .currentSelection{ margin-top:10px; border:2px solid var(--border); padding:8px; background:var(--bg-2); box-shadow:var(--shadow); }
        .selectionTitle{ font-weight:800; font-size:11px; margin-bottom:2px; }
        .selectionModel{ font-weight:600; font-size:12px; margin-bottom:4px; }
        .selectionDesc{ font-size:10px; color:#666; line-height:1.3; }

        /* Uploads */
        .upload{ width:100%; border:2px dashed var(--border); background:var(--bg-2); color:var(--text); padding:12px; box-shadow:var(--shadow); cursor:pointer; font-weight:700; }
        .upload:hover{ background:var(--text); color:var(--bg);} 
        .upload:active{ transform: translate(1px,1px); box-shadow:2px 2px 0 var(--border);} 
        .files{ margin-top:10px; display:grid; gap:8px;} 
        .file{ display:flex; align-items:center; justify-content:space-between; border:2px solid var(--border); padding:6px 8px; box-shadow:var(--shadow); background:var(--bg); color:var(--text);} 
        .fname{ overflow:hidden; white-space:nowrap; text-overflow:ellipsis; padding-right:8px; }
        .fdel{ border:2px solid var(--border); background:var(--text); color:var(--bg); width:28px; height:24px; border-radius:12px; font-weight:800; display:flex; align-items:center; justify-content:center; box-shadow:var(--shadow); cursor:pointer; }
        .fdel:hover{ transform: translate(1px,1px); box-shadow:2px 2px 0 var(--border); }

        /* Divider */
        .divider{ width:10px; background:var(--bg); border-right:2px solid var(--border); border-left:2px solid var(--border); cursor:col-resize; position:relative; }
        .grip{ position:absolute; left:50%; top:50%; translate:-50% -50%; width:18px; height:54px; background:#ddd; border:2px solid var(--border); box-shadow:var(--shadow);} 

        /* Main */
        .main{ flex:1; display:flex; padding:16px; }
        .chat{ flex:1; border:2px solid var(--border); background:var(--bg); display:grid; grid-template-rows:auto 1fr auto; box-shadow:var(--shadow); }
        .chatHdr{ padding:10px 12px; border-bottom:2px solid var(--border); font-weight:800; display:flex; justify-content:space-between; align-items:center; }
        .chatModel{ font-size:11px; color:#666; font-weight:600; }

        .msgs{ padding:16px; display:flex; flex-direction:column; gap:12px; overflow-y:auto; background:var(--bg-2); }
        .bubble{ position:relative; max-width: clamp(260px, 75%, 820px); padding:0; border:2px solid var(--border); box-shadow:var(--shadow); line-height:1.5; }
        .bubble-content{ padding:12px 16px; word-wrap:break-word; white-space:pre-wrap; }
        .bubble.ai{ align-self:flex-start; background:var(--bg); color:var(--text); }
        .bubble.user{ align-self:flex-end; background:var(--text); color:var(--bg); }
        .bubble .tail{ position:absolute; width:10px; height:10px; border:2px solid var(--border); background:currentColor; display:none; }
        .bubble.ai .tail{ display:block; left:-8px; top:16px; background:var(--bg); }
        .bubble.user .tail{ display:block; right:-8px; top:16px; background:var(--text); }

        /* Typing indicator */
        .bubble.typing .bubble-content{ display:flex; align-items:center; padding:16px; }
        .typing-indicator{ display:flex; gap:4px; }
        .typing-indicator span{ width:8px; height:8px; border-radius:50%; background:var(--text); animation:typing 1.4s infinite ease-in-out; }
        .typing-indicator span:nth-child(1){ animation-delay:-0.32s; }
        .typing-indicator span:nth-child(2){ animation-delay:-0.16s; }
        @keyframes typing {
          0%, 80%, 100% { transform:scale(0); opacity:0.5; }
          40% { transform:scale(1); opacity:1; }
        }

        /* Streaming animation */
        .bubble.streaming .cursor{ 
          animation: blink 1s infinite; 
          margin-left: 2px;
          font-weight: bold;
          color: var(--text);
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }

        /* Better text formatting */
        .bubble-content{ padding:12px 16px; word-wrap:break-word; white-space:pre-wrap; }
        .bubble-content p{ margin:0 0 12px 0; line-height:1.5; }
        .bubble-content p:last-child{ margin-bottom:0; }
        .bubble-content ol, .bubble-content ul{ margin:12px 0; padding-left:24px; line-height:1.5; }
        .bubble-content li{ margin:8px 0; }
        .bubble-content ol li{ list-style-type:decimal; }
        .bubble-content ul li{ list-style-type:disc; }
        .bubble-content strong{ font-weight:800; }
        .bubble-content em{ font-style:italic; }
        .bubble-content code{ background:rgba(0,0,0,0.1); padding:2px 4px; border-radius:3px; font-family:inherit; }
        
        /* Specific handling for AI responses */
        .bubble.ai .bubble-content ol{ counter-reset:list-counter; }
        .bubble.ai .bubble-content ol li{ 
          counter-increment:list-counter; 
          position:relative; 
          list-style:none; 
        }
        .bubble.ai .bubble-content ol li::before{ 
          content:counter(list-counter) ". "; 
          font-weight:700; 
          color:var(--text);
          position:absolute;
          left:-24px;
        }

        /* Message spacing improvements */
        .bubble + .bubble{ margin-top:8px; }
        .bubble.user + .bubble.ai, .bubble.ai + .bubble.user{ margin-top:16px; }

        .inputRow{ display:grid; grid-template-columns:1fr auto; gap:10px; padding:12px; border-top:2px solid var(--border); background:var(--bg); }
        .msgInput,.textarea{ border:2px solid var(--border); padding:10px; resize:none; background:var(--text); color:var(--bg); box-shadow: inset 2px 2px 0 var(--border); }
        .msgInput:disabled{ opacity: 0.6; }
        .textarea{ min-height:260px; overflow:hidden; }
        .msgInput::placeholder,.textarea::placeholder{ color:#cfcfcf; }
        .send{ border:2px solid var(--border); padding:0 16px; background:var(--text); color:var(--bg); font-weight:800; box-shadow:var(--shadow); cursor:pointer; }
        .send:disabled{ opacity: 0.6; cursor: not-allowed; }
        .send.stop{ background: #dc2626; color: white; }

        /* Modal */
        .modalOverlay{ position:fixed; inset:0; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:9999; }
        .modal{ width:min(640px,92vw); background:var(--bg); border:2px solid var(--border); box-shadow:var(--shadow); padding:16px; color:var(--text); }
        .modalTitle{ font-weight:800; margin-bottom:12px; }
        .progress{ height:28px; border:2px solid var(--border); background:var(--bg-2); box-shadow:var(--shadow); position:relative; overflow:hidden; }
        .bar{ height:100%; background:var(--text); transition: width 200ms steps(6, end); }
        .progressMeta{ margin-top:8px; font-weight:700; }
        .hint{ margin-top:6px; color:#444; font-size:12px; }
        .matches{ margin-top:10px; border:2px solid var(--border); padding:10px; box-shadow:var(--shadow); background:var(--bg-2); }
        .matchTitle{ font-weight:800; margin-bottom:6px; }
        .match{ border:2px solid var(--border); padding:6px 8px; background:var(--bg); box-shadow:var(--shadow); margin-bottom:6px; }
        .okBtn{ margin-top:12px; border:2px solid var(--border); padding:8px 16px; background:var(--text); color:var(--bg); font-weight:800; box-shadow:var(--shadow); cursor:pointer; }
      `}</style>
    </div>
  );
}