import { useState, useRef, useEffect } from "react";
import { Send, TrendingUp, Sparkles, Menu } from "lucide-react";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import SuggestionChips from "./SuggestionChips";

const GEMINI_URL = `${import.meta.env.VITE_GEMINI_URL}?key=${import.meta.env.VITE_GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `You are Penny, a warm, knowledgeable, and concise personal finance assistant. You help users with budgeting, saving, investing, debt management, credit scores, tax basics, and financial goal-setting.

Personality:
- Friendly but professional — like a financially savvy best friend
- Use simple, clear language. Avoid heavy jargon unless asked.
- Be encouraging, not judgmental about financial mistakes
- Keep responses focused and scannable: use short paragraphs or bullet points when listing steps
- When giving advice, always acknowledge that you're an AI and recommend consulting a professional for major decisions
- Never ask for personal account numbers, passwords, or sensitive data

Topics you cover well:
- Budgeting (50/30/20 rule, zero-based budgeting, envelope method)
- Saving strategies (emergency funds, sinking funds, high-yield savings)
- Investing basics (index funds, ETFs, compound interest, risk tolerance)
- Debt payoff (avalanche vs snowball method, refinancing)
- Credit scores (factors, how to improve, what hurts them)
- Financial goals (FIRE movement, house down payments, retirement)
- Indian personal finance context (PPF, NPS, ELSS, SIPs, EPF) when relevant

If someone asks something outside finance, gently redirect them back to financial topics.`;

const SUGGESTIONS = [
  "How do I start budgeting?",
  "Explain the 50/30/20 rule",
  "How to build an emergency fund?",
  "Debt avalanche vs snowball?",
  "How does a SIP work?",
  "Tips to improve my credit score",
];

export default function ChatWindow({ initialMessages, onMessagesChange, onMenuClick }) {
  const [messages, setMessages] = useState(initialMessages || []);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

useEffect(() => {
  if (messages.length > 0 && messages[messages.length - 1].role === "assistant") {
    onMessagesChange(messages);
  }
}, [messages]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;

    setInput("");
    setError(null);

    const userMsg = { role: "user", content: userText, id: Date.now() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      // Build Gemini conversation history (exclude the latest user msg, it goes in contents)
      const history = updatedMessages.slice(0, -1).map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      }));

      const response = await fetch(GEMINI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: SYSTEM_PROMPT }],
          },
          contents: [
            ...history,
            { role: "user", parts: [{ text: userText }] },
          ],
          generationConfig: {
            maxOutputTokens: 1024,
            temperature: 0.7,
          },
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err?.error?.message || "API error");
      }

      const data = await response.json();
      const assistantText =
        data.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ||
        "Sorry, I couldn't generate a response.";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: assistantText, id: Date.now() },
      ]);
    } catch (e) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full w-full bg-[#111111]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-[#1a1a1a] bg-[#0e0e0e] shrink-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <Menu size={20} />
        </button>
        <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 items-center justify-center hidden lg:flex">
          <TrendingUp size={15} className="text-emerald-400" />
        </div>
        <div>
          <h1 className="font-serif text-white text-base leading-none">Penny</h1>
          <p className="text-[11px] text-zinc-500 mt-0.5 font-light">
            Personal finance companion
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] text-zinc-500">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-0 py-6">
        <div className="w-full max-w-3xl mx-auto flex flex-col gap-5 h-full">
          {isEmpty ? (
            <EmptyState onSuggest={sendMessage} />
          ) : (
            <>
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {loading && <TypingIndicator />}
              {error && (
                <p className="text-center text-xs text-red-400 bg-red-400/10 rounded-lg px-4 py-2">
                  {error}
                </p>
              )}
            </>
          )}
          <div ref={bottomRef} />
        </div>
      </div>


      {/* Input bar */}
      <div className="shrink-0 bg-[#0e0e0e] border-t border-[#1a1a1a] px-4 sm:px-6 lg:px-0 py-4">
        <div className="w-full max-w-3xl mx-auto">
          <div className="flex items-end gap-2 bg-[#1a1a1a] rounded-xl px-4 py-3 border border-[#252525] focus-within:border-emerald-500/40 transition-colors">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask Penny anything about money..."
              className="flex-1 bg-transparent text-sm text-zinc-200 placeholder-zinc-600 resize-none outline-none leading-relaxed max-h-28"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-black disabled:opacity-30 disabled:cursor-not-allowed hover:bg-emerald-400 transition-colors shrink-0"
            >
              <Send size={14} />
            </button>
          </div>
          <p className="text-center text-[10px] text-zinc-700 mt-2">
            Penny is an AI. Not a licensed financial advisor.
          </p>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onSuggest }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center gap-8 px-4 py-8">
      <div>
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5">
          <Sparkles size={24} className="text-emerald-400" />
        </div>
        <h2 className="font-serif text-white text-2xl mb-2">Hi, I'm Penny 👋</h2>
        <p className="text-zinc-500 text-sm max-w-xs mx-auto leading-relaxed">
          Your friendly finance companion. Ask me about budgeting, saving, investing, or anything money-related.
        </p>
      </div>
      <SuggestionChips
        suggestions={[
          "How do I start budgeting?",
          "Explain the 50/30/20 rule",
          "How to build an emergency fund?",
          "Debt avalanche vs snowball?",
          "How does a SIP work?",
          "Tips to improve my credit score",
        ]}
        onSelect={onSuggest}
        grid
      />
    </div>
  );
}