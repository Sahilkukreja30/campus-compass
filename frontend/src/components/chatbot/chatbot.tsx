import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Bot, User, Send } from "lucide-react";
import axios from "axios";

type Message = {
  id: number;
  role: "user" | "bot";
  text: string;
};

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend() {
    if (!input.trim()) return;
    setErr(null);

    const userMsg: Message = { id: Date.now(), role: "user", text: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const payload = {
      college_id: "iit_indore",
      query: userMsg.text,
      session_id: crypto.randomUUID(),
    };

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}api/ask`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      const botMsg: Message = {
        id: Date.now() + 1,
        role: "bot",
        text: res?.data?.answer ?? "…",
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      setErr("Sorry, something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="px-3 bg-gradient-to-br from-[#4e1eeb] to-[#e0dced] rounded-2xl">
      <Card className="w-full max-w-md mx-auto shadow-xl rounded-2xl bg-white/95 backdrop-blur">
        <CardHeader className="border-b bg-white/70 rounded-t-2xl p-3">
          <CardTitle className="flex items-center gap-2 text-[#0F2742] text-base">
            <Bot className="h-5 w-5" />
            Campus Assistant
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          <div className="h-[400px] flex flex-col">
            {/* scrollable messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} role={msg.role} text={msg.text} />
              ))}

              {loading && (
                <div className="flex gap-2 items-end">
                  <Avatar kind="bot" />
                  <div className="bg-gray-200 text-gray-800 rounded-2xl px-3 py-2 shadow-sm">
                    <TypingDots />
                  </div>
                </div>
              )}

              {err && (
                <div className="text-xs text-red-600/90 bg-red-50 border border-red-100 rounded-md px-2 py-1 w-fit">
                  {err}
                </div>
              )}
            </div>

            {/* input stays fixed at bottom */}
            <div className="border-t p-2 bg-white/70">
              <div className="flex items-end gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Type a message..."
                  rows={1}
                  className="flex-1 min-h-[40px] max-h-28 resize-y rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8b6cf1]"
                />
                <Button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="h-10 px-3 bg-[#8b6cf1] hover:bg-[#7952f7] disabled:opacity-60"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <style>{`
        @keyframes bounceDot { 0%, 80%, 100% { transform: translateY(0); opacity: .5 } 40% { transform: translateY(-4px); opacity: 1 } }
        .dot { width: 6px; height: 6px; border-radius: 9999px; background: #4b5563; display: inline-block; margin-right: 4px; animation: bounceDot 1.2s infinite; }
        .dot:nth-child(2) { animation-delay: .15s; }
        .dot:nth-child(3) { animation-delay: .3s; }
      `}</style>
    </div>
  );
}

function MessageBubble({ role, text }: { role: "user" | "bot"; text: string }) {
  const isUser = role === "user";
  const bubbleClass = useMemo(
    () =>
      [
        "max-w-[75%] rounded-2xl px-3 py-2 shadow-sm whitespace-pre-wrap break-words text-sm",
        isUser ? "bg-[#4e1eeb] text-white ml-auto" : "bg-gray-200 text-gray-900 mr-auto",
      ].join(" "),
    [isUser]
  );

  return (
    <div className={["flex items-end gap-2", isUser ? "justify-end" : "justify-start"].join(" ")}>
      {!isUser && <Avatar kind="bot" />}
      <div className={bubbleClass}>{text}</div>
      {isUser && <Avatar kind="user" />}
    </div>
  );
}

function Avatar({ kind }: { kind: "user" | "bot" }) {
  if (kind === "user") {
    return (
      <div className="h-6 w-6 rounded-full bg-[#4e1eeb] text-white flex items-center justify-center shadow">
        <User className="h-3 w-3" />
      </div>
    );
  }
  return (
    <div className="h-6 w-6 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center shadow">
      <Bot className="h-3 w-3" />
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1">
      <span className="dot" />
      <span className="dot" />
      <span className="dot" />
    </div>
  );
}
