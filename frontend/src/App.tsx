// src/App.tsx
import React, { useEffect, useRef, useState } from "react";
import "./styles/app.css"; // <-- new stylesheet you’ll add in step 2

type ProviderId = "anthropic" | "granite" | "openai";

const PROVIDERS: { id: ProviderId; label: string }[] = [
  { id: "anthropic", label: "Anthropic" },
  { id: "granite", label: "Granite" },
  { id: "openai", label: "OpenAI" },
];

const API_BASE = "http://localhost:3001"; // change if your backend runs elsewhere

type Msg = { id: number; content: string; isUser: boolean };

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

  // Chat + UI state
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [customInstructions, setCustomInstructions] = useState("");
  const [sidebarWidth, setSidebarWidth] = useState(380);
  const [isResizing, setIsResizing] = useState(false);

  // Provider state
  const [provider, setProvider] = useState<ProviderId>("anthropic");
  const [graniteModel, setGraniteModel] = useState(
    "ibm/granite-3-3-8b-instruct"
  );

  // Ingestion modal state
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

  // ----- helpers -----
  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  // Auto-grow instructions textarea
  const autoResize = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };
  useEffect(() => {
    autoResize(instructionsRef.current);
  }, [customInstructions]);

  // Sidebar resize
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

  // Build provider-agnostic chat messages (OpenAI style)
  const toChatMessages = () => {
    const history = messages.map((m) => ({
      role: m.isUser ? "user" : "assistant",
      content: m.content,
    }));
    const sys = customInstructions?.trim()
      ? [{ role: "system", content: customInstructions.trim() }]
      : [];
    return [...sys, ...history];
  };

  const addMessage = (content: string, isUser = true) =>
    setMessages((prev) => [...prev, { id: Date.now(), content, isUser }]);

  // Render lists/paragraphs nicely from plain text
  const createList = (items: string[], type: "numbered" | "bullet") => {
    const ListComp = type === "numbered" ? "ol" : "ul";
    return (
      <ListComp
        key={`list-${Date.now()}`}
        style={{ margin: "8px 0", paddingLeft: "24px" }}
      >
        {items.map((item, i) => (
          <li key={i} style={{ margin: "4px 0", lineHeight: "1.5" }}>
            <span
              dangerouslySetInnerHTML={{
                __html: item.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
              }}
            />
          </li>
        ))}
      </ListComp>
    );
  };

  const formatMessage = (content: string) => {
    if (!content) return "";
    const lines = content.split("\n").filter((l) => l.trim());
    const out: React.ReactNode[] = [];
    let list: string[] = [];
    let listType: "numbered" | "bullet" | null = null;

    lines.forEach((raw, idx) => {
      const line = raw.trim();
      const numbered = line.match(/^(\d+)\.\s*(.+)/);
      const bullet = line.match(/^[-•]\s*(.+)/);

      if (numbered) {
        if (listType !== "numbered") {
          if (list.length) out.push(createList(list, listType!));
          list = [];
          listType = "numbered";
        }
        list.push(numbered[2]);
        return;
      }
      if (bullet) {
        if (listType !== "bullet") {
          if (list.length) out.push(createList(list, listType!));
          list = [];
          listType = "bullet";
        }
        list.push(bullet[1]);
        return;
      }
      if (list.length) {
        out.push(createList(list, listType!));
        list = [];
        listType = null;
      }
      out.push(
        <p key={`p-${idx}`} style={{ margin: "0 0 8px 0", lineHeight: "1.5" }}>
          {line}
        </p>
      );
    });

    if (list.length) out.push(createList(list, listType!));
    return <div>{out}</div>;
  };

  const sendMessage = async () => {
    const user = inputValue.trim();
    if (!user) return;

    addMessage(user, true);
    setInputValue("");
    setIsTyping(true);

    const streamingId = Date.now() + 1;
    setStreamingMessageId(streamingId);
    setStreamingContent("");

    const base = toChatMessages();
    const messagesToSend = [...base, { role: "user", content: user }];

    abortControllerRef.current = new AbortController();

    const useStreaming = provider === "anthropic" || provider === "granite";
    const endpoint = useStreaming ? "/api/chat/stream" : "/api/chat";

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          graniteModel,
          messages: messagesToSend,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) {
        let msg = `${res.status} ${res.statusText}`;
        try {
          const j = await res.json();
          if (j?.error) msg = j.error;
        } catch {}
        throw new Error(msg);
      }

      if (useStreaming && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let accumulated = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const ln of lines) {
              if (!ln.trim()) continue;
              try {
                const parsed = JSON.parse(ln);
                if (parsed.type === "delta" && parsed.text) {
                  accumulated += parsed.text;
                  setStreamingContent(accumulated);
                } else if (parsed.type === "done") {
                  // finished
                } else if (parsed.type === "error") {
                  throw new Error(parsed.error || "Stream error");
                }
              } catch {
                // ignore bad chunks
              }
            }
          }
        } finally {
          reader.releaseLock();
        }

        addMessage(
          accumulated.trim() ? accumulated : "(no response received)",
          false
        );
      } else {
        const data = await res.json();
        addMessage(data.text || JSON.stringify(data), false);
      }
    } catch (err: any) {
      if (err?.name !== "AbortError")
        addMessage(`(error) ${String(err?.message || err)}`, false);
    } finally {
      setIsTyping(false);
      setStreamingMessageId(null);
      setStreamingContent("");
      abortControllerRef.current = null;
    }
  };

  const handleKeyPress: React.KeyboardEventHandler<HTMLTextAreaElement> = (
    e
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const stopStreaming = () => abortControllerRef.current?.abort();

  // ----- ingestion modal -----
  const startIngestion = () => {
    setProgress(0);
    setIngestDone(false);
    setShowModal(true);
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

  const handleFileUpload: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = Array.from(e.target.files ?? []).filter(
      (f) => f.type === "application/pdf"
    );
    if (!files.length) {
      setShowModal(false);
      return;
    }
    startIngestion();
    setUploadedFiles((prev) => prev.concat(files).slice(0, 5));
  };

  // ----- render -----
  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar" style={{ width: sidebarWidth }}>
        <div className="panel">
          <div className="title">Model Provider</div>
          <div className="seg">
            {PROVIDERS.map((p) => (
              <label
                key={p.id}
                className={`segBtn ${provider === p.id ? "active" : ""}`}
              >
                <input
                  type="radio"
                  name="provider"
                  value={p.id}
                  checked={provider === p.id}
                  onChange={() => setProvider(p.id)}
                />
                {p.label}
              </label>
            ))}
          </div>

          {provider === "granite" && (
            <div className="field">
              <div className="label">Granite model_id</div>
              <input
                className="textInput"
                value={graniteModel}
                onChange={(e) => setGraniteModel(e.target.value)}
                placeholder="ibm/granite-3-3-8b-instruct"
              />
            </div>
          )}
        </div>

        <div className="panel">
          <div className="title">Upload Documents</div>
          <div className="subtitle">Max 5 PDF files</div>
          <button
            className="upload"
            onClick={() => {
              setProgress(0);
              setIngestDone(false);
              setShowModal(true);
              fileInputRef.current?.click();
            }}
          >
            [ + ] Upload PDFs
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            multiple
            onChange={handleFileUpload}
            style={{ display: "none" }}
          />
          <div className="files">
            {uploadedFiles.map((f, i) => (
              <div key={i} className="file">
                <span className="fname">{f.name}</span>
                <button
                  className="fdel"
                  aria-label="Remove file"
                  title="Remove"
                  onClick={() =>
                    setUploadedFiles((prev) =>
                      prev.filter((_, idx) => idx !== i)
                    )
                  }
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="panel grow">
          <div className="title">Custom Instructions</div>
          <textarea
            ref={instructionsRef}
            className="textarea"
            value={customInstructions}
            onChange={(e) => {
              setCustomInstructions(e.target.value);
              autoResize(e.target);
            }}
            placeholder="Type here…"
            rows={6}
          />
        </div>
      </aside>

      {/* Divider */}
      <div className="divider" onMouseDown={handleMouseDown}>
        <div className="grip" />
      </div>

      {/* Chat */}
      <main className="main">
        <div className="chat">
          <header className="chatHdr">
            <div>AI Chat</div>
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
              onKeyDown={(e) => {
                // onKeyPress is deprecated; use onKeyDown
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Type a message…"
              rows={2}
              disabled={isTyping}
            />
            {isTyping && streamingMessageId ? (
              <button className="send stop" onClick={stopStreaming}>
                Stop
              </button>
            ) : (
              <button
                className="send"
                onClick={sendMessage}
                disabled={isTyping}
              >
                Send
              </button>
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
                <div className="progress">
                  <div className="bar" style={{ width: `${progress}%` }} />
                </div>
                <div className="progressMeta">{progress}%</div>
                <div className="hint">
                  Chunking, embedding & indexing your documents…
                </div>
              </>
            ) : (
              <>
                <div className="modalTitle">Ingestion Complete</div>
                <div className="matches">
                  <div className="matchTitle">Indexed Files</div>
                  {uploadedFiles.length === 0 && (
                    <div className="match">(none)</div>
                  )}
                  {uploadedFiles.map((f, i) => (
                    <div key={i} className="match">
                      ✓ {f.name}
                    </div>
                  ))}
                </div>
                <button className="okBtn" onClick={() => setShowModal(false)}>
                  OK
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
