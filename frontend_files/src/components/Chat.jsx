import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Pacifico&family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [open, setOpen] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!document.querySelector(`link[href="${FONT_URL}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = FONT_URL;
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const appendToLast = (token) =>
    setMessages((prev) => {
      const next = [...prev];
      next[next.length - 1] = {
        ...next[next.length - 1],
        text: next[next.length - 1].text + token,
      };
      return next;
    });

  const sendMessage = async () => {
    if (!input.trim() || isStreaming) return;
    const userMessage = input;
    setMessages((prev) => [
      ...prev,
      { role: "user", text: userMessage },
      { role: "bot", text: "" },
    ]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setIsStreaming(true);

    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const contentType = res.headers.get("content-type") ?? "";

      if (contentType.includes("text/event-stream")) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop();

          for (const part of parts) {
            for (const line of part.split("\n")) {
              if (!line.startsWith("data: ")) continue;
              const raw = line.slice(6).trim();
              if (raw === "[DONE]") return;
              try {
                const json = JSON.parse(raw);
                const token =
                  json.choices?.[0]?.delta?.content ??
                  json.delta?.text ??
                  json.token ??
                  "";
                if (token) appendToLast(token);
              } catch { }
            }
          }
        }
      } else {
        const data = await res.json();
        const reply =
          data.reply ?? data.message ?? data.response ?? data.content ?? data.text ?? JSON.stringify(data);
        for (const char of reply) {
          appendToLast(char);
          await new Promise((r) => setTimeout(r, 8));
        }
      }
    } catch (err) {
      appendToLast(`\n\n_Error: ${err.message}_`);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInput = (e) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px";
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", position: "fixed", bottom: 24, right: 24, zIndex: 9999 }}>

      {/* Floating toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          position: "absolute", bottom: 24, right: 0,
          width: 52, height: 52, borderRadius: "50%",
          background: "#FF5733", border: "none", cursor: "pointer",
          boxShadow: "0 4px 16px rgba(255,87,51,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22, transition: "transform 0.2s",
          transform: open ? "rotate(90deg)" : "none",
          zIndex: 1,
        }}
      >
        {open ? "✕" : "🍳"}
      </button>

      {/* Chat panel */}
      {open && (
        <div style={{
          position: "fixed", bottom: 24, right: 24,
          width: 380, height: "min(420px, calc(100dvh - 120px))",
          background: "#FFFBF4",
          border: "0.5px solid #FAC775",
          borderRadius: 16,
          boxShadow: "0 8px 40px rgba(65,36,2,0.15)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
          position: "fixed", bottom: 24, right: 80
        }}>

          {/* Header */}
          <div style={{ background: "#FFF8ED", borderBottom: "0.5px solid #FAC775", padding: "0.9rem 1.25rem", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "#BA7517", fontWeight: 500, margin: "0 0 0.15rem" }}>Chef Assistant</p>
              <p style={{ fontFamily: "'Pacifico', cursive", fontSize: 16, color: "#412402", margin: 0, fontWeight: 400 }}>Ask me anything</p>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#BA7517", padding: 4, lineHeight: 1 }}>−</button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "1rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

              {messages.length === 0 && (
                <div style={{ textAlign: "center", padding: "4rem 1rem", color: "#BA7517" }}>
                  <div style={{ fontFamily: "'Pacifico', cursive", fontSize: 28, marginBottom: "0.5rem", color: "#EF9F27" }}>
                    Hello!
                  </div>
                  <p style={{ fontSize: 14, color: "#633806", margin: 0 }}>
                    Ask about chefs, cuisine, availability, or anything else.
                  </p>
                </div>
              )}

              {messages.map((m, i) => {
                const isUser = m.role === "user";
                return (
                  <div key={i} style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" }}>
                    {!isUser && (
                      <div style={{
                        width: 32, height: 32, borderRadius: "50%", background: "#EF9F27",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 14, flexShrink: 0, marginRight: 10, alignSelf: "flex-end",
                        marginBottom: 2,
                      }}>
                        🍳
                      </div>
                    )}
                    <div style={{
                      maxWidth: "72%",
                      background: isUser ? "#FF5733" : "#FFF8ED",
                      color: isUser ? "#fff" : "#412402",
                      border: isUser ? "none" : "0.5px solid #FAC775",
                      borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                      padding: "0.65rem 1rem",
                      fontSize: 14,
                      lineHeight: 1.65,
                      boxShadow: isUser ? "0 2px 8px rgba(255,87,51,0.2)" : "0 1px 4px rgba(0,0,0,0.06)",
                    }}>
                      {isUser ? (
                        m.text
                      ) : (
                        <div style={{ "--text-color": "#412402" }}>
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p: ({ children }) => <p style={{ margin: "0 0 0.5em" }}>{children}</p>,
                              ul: ({ children }) => <ul style={{ margin: "0.25em 0", paddingLeft: "1.25em" }}>{children}</ul>,
                              ol: ({ children }) => <ol style={{ margin: "0.25em 0", paddingLeft: "1.25em" }}>{children}</ol>,
                              code: ({ children }) => <code style={{ background: "#FAEEDA", borderRadius: 4, padding: "1px 5px", fontSize: 13, fontFamily: "monospace" }}>{children}</code>,
                              pre: ({ children }) => <pre style={{ background: "#FAEEDA", border: "0.5px solid #FAC775", borderRadius: 8, padding: "0.75rem", overflowX: "auto", fontSize: 13 }}>{children}</pre>,
                            }}
                          >
                            {m.text || (isStreaming && i === messages.length - 1 ? "▍" : "")}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
          </div>

          {/* Input */}
          <div style={{ borderTop: "0.5px solid #FAC775", background: "#FFF8ED", padding: "0.75rem 1rem", flexShrink: 0 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder="Message…"
                disabled={isStreaming}
                style={{
                  flex: 1,
                  resize: "none",
                  border: "0.5px solid #EF9F27",
                  borderRadius: 12,
                  padding: "0.65rem 1rem",
                  fontSize: 14,
                  fontFamily: "'DM Sans', sans-serif",
                  background: "#FFFBF4",
                  color: "#412402",
                  outline: "none",
                  lineHeight: 1.5,
                  overflowY: "hidden",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#FF5733")}
                onBlur={(e) => (e.target.style.borderColor = "#EF9F27")}
              />
              <button
                onClick={sendMessage}
                disabled={isStreaming || !input.trim()}
                style={{
                  background: isStreaming || !input.trim() ? "#FAC775" : "#FF5733",
                  color: "#fff",
                  border: "none",
                  borderRadius: 12,
                  width: 42,
                  height: 42,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: isStreaming || !input.trim() ? "default" : "pointer",
                  flexShrink: 0,
                  fontSize: 18,
                  transition: "background 0.15s",
                }}
              >
                {isStreaming ? (
                  <span style={{ width: 16, height: 16, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                ) : (
                  "↑"
                )}
              </button>
            </div>
            <p style={{ fontSize: 10, color: "#BA7517", textAlign: "center", margin: "0.4rem 0 0" }}>
              Enter to send · Shift+Enter for new line
            </p>
          </div>

        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        textarea::placeholder { color: #C49A3C; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}