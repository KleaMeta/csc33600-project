import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

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
    setMessages((prev) => [...prev, { role: "user", text: userMessage }, { role: "bot", text: "" }]);
    setInput("");
    setIsStreaming(true);

    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const contentType = res.headers.get("content-type") ?? "";

      if (contentType.includes("text/event-stream")) {
        // ── SSE streaming path ──
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          // SSE events are separated by double newlines
          const parts = buffer.split("\n\n");
          buffer = parts.pop(); // keep incomplete last chunk

          for (const part of parts) {
            for (const line of part.split("\n")) {
              if (!line.startsWith("data: ")) continue;
              const raw = line.slice(6).trim();
              if (raw === "[DONE]") return;
              try {
                const json = JSON.parse(raw);
                const token =
                  json.choices?.[0]?.delta?.content ?? // OpenAI
                  json.delta?.text ??                  // Anthropic
                  json.token ??                        // custom
                  "";
                if (token) appendToLast(token);
              } catch {
                // skip unparseable lines
              }
            }
          }
        }
      } else {
        // ── Plain JSON path ──
        const data = await res.json();
        // Try common reply field names
        const reply =
          data.reply ??
          data.message ??
          data.response ??
          data.content ??
          data.text ??
          JSON.stringify(data);

        // Simulate streaming by revealing one character at a time
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

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 16 }}>
      <div style={{ minHeight: 400 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            <b>{m.role}:</b>
            <div style={{ paddingLeft: 8 }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <input
          style={{ flex: 1 }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask something..."
          disabled={isStreaming}
        />
        <button onClick={sendMessage} disabled={isStreaming}>
          {isStreaming ? "…" : "Send"}
        </button>
      </div>
    </div>
  );
}