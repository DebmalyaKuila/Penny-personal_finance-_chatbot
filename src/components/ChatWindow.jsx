import { useState, useRef, useEffect } from "react";
import { Send, TrendingUp, Sparkles, Menu, IndianRupee } from "lucide-react";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import SuggestionChips from "./SuggestionChips";
import { buildSystemPrompt } from "../values/SystemPrompt";
import { SUGGESTIONS } from "../values/shared";

const GEMINI_URL = `${import.meta.env.VITE_GEMINI_URL}?key=${import.meta.env.VITE_GEMINI_API_KEY}`;

const TICK_MS = 16;
const CHARS_PER_TICK = 3;
const MAX_CONTINUATIONS = 3;

async function fetchGemini(contents, systemPrompt) {
  const response = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: { maxOutputTokens: 8192, temperature: 0.7 },
    }),
  });

if (!response.ok) {
    throw new Error("Something went wrong. Please try again later.");
  }

  const data = await response.json();
  const candidate = data.candidates?.[0];
  const text = candidate?.content?.parts?.map((p) => p.text).join("") || "";
  const finishReason = candidate?.finishReason || "STOP";
  return { text, finishReason };
}

async function fetchFullResponse(conversationMessages, systemPrompt) {
  const contents = conversationMessages.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  let fullText = "";
  let attempts = 0;

  while (attempts <= MAX_CONTINUATIONS) {
    const currentContents =
      attempts === 0
        ? contents
        : [
            ...contents,
            { role: "model", parts: [{ text: fullText }] },
            {
              role: "user",
              parts: [{ text: "Please continue your response from where you left off." }],
            },
          ];

    const { text, finishReason } = await fetchGemini(currentContents, systemPrompt);
    fullText += text;
    attempts++;

    if (
      finishReason === "STOP" ||
      finishReason === "END_TURN" ||
      (finishReason === "MAX_TOKENS" && attempts > MAX_CONTINUATIONS)
    ) {
      break;
    }
    if (finishReason !== "MAX_TOKENS") break;
  }

  return fullText || "Sorry, I couldn't generate a response.";
}

export default function ChatWindow({ initialMessages, onMessagesChange, onMenuClick, onProfileClick, profile }) {
  const [messages, setMessages] = useState(initialMessages || []);
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText, loading]);

  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].role === "assistant") {
      onMessagesChange(messages);
    }
  }, [messages]);

  useEffect(() => {
    return () => { if (streamRef.current) clearInterval(streamRef.current); };
  }, []);

  function animateText(fullText, onDone) {
    let index = 0;
    setStreamingText("");
    setIsStreaming(true);

    streamRef.current = setInterval(() => {
      index += CHARS_PER_TICK;
      if (index >= fullText.length) {
        setStreamingText(fullText);
        clearInterval(streamRef.current);
        setIsStreaming(false);
        onDone(fullText);
      } else {
        setStreamingText(fullText.slice(0, index));
      }
    }, TICK_MS);
  }

  // Core dispatch — takes a messages array and fires the API
  async function dispatch(msgList) {
    setError(null);
    setLoading(true);

    try {
      const geminiMessages = msgList.map(({ role, content }) => ({ role, content }));
      const assistantText = await fetchFullResponse(geminiMessages, buildSystemPrompt(profile));
      setLoading(false);

      animateText(assistantText, (fullText) => {
        setStreamingText("");
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: fullText, id: Date.now() },
        ]);
        inputRef.current?.focus();
      });
    } catch (e) {
      setLoading(false);
      setError(e.message || "Something went wrong. Please try again.");
    }
  }

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading || isStreaming) return;

    setInput("");
    const userMsg = { role: "user", content: userText, id: Date.now() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    await dispatch(updatedMessages);
  };

  // Retry: slice history up to and including the chosen user message,
  // drop any assistant reply that followed, re-send
  const handleRetry = (msgId) => {
    if (loading || isStreaming) return;

    const idx = messages.findIndex((m) => m.id === msgId);
    if (idx === -1) return;

    // Keep everything up to and including this user message
    const sliced = messages.slice(0, idx + 1);
    setMessages(sliced);
    dispatch(sliced);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isEmpty = messages.length === 0 && !isStreaming;
  const hasProfile = profile && Object.values(profile).some(Boolean);

  return (
    <div className="flex flex-col h-full w-full bg-[#111111]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-[#1a1a1a] bg-[#0e0e0e] shrink-0">
        <button onClick={onMenuClick} className="lg:hidden text-zinc-500 hover:text-zinc-300 transition-colors">
          <Menu size={20} />
        </button>
        <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 items-center justify-center hidden lg:flex">
          <TrendingUp size={15} className="text-emerald-400" />
        </div>
        <div>
          <h1 className="font-serif text-white text-base leading-none">Penny</h1>
          <p className="text-[11px] text-zinc-500 mt-0.5 font-light">Personal finance companion</p>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={onProfileClick}
            title="Financial Profile"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all text-xs ${
              hasProfile
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/15"
                : "border-[#252525] bg-[#1a1a1a] text-zinc-500 hover:text-zinc-300 hover:border-zinc-600"
            }`}
          >
            <IndianRupee size={13} />
            <span className="hidden sm:inline">{hasProfile ? "Profile set" : "Set profile"}</span>
          </button>

          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-zinc-500">Online</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-0 py-6">
        <div className="w-full max-w-3xl mx-auto flex flex-col gap-5 h-full">
          {isEmpty ? (
            <EmptyState onSuggest={sendMessage} />
          ) : (
            <>
            {messages.map((msg, idx) => (
                            <MessageBubble
                              key={msg.id}
                              message={msg}
                              onRetry={
                                msg.role === "assistant" &&
                                idx === messages.length - 1 &&
                                !loading &&
                                !isStreaming
                                  ? () => handleRetry(msg.id)
                                  : null
                              }
                            />
              ))}
              {loading && <TypingIndicator />}
              {isStreaming && streamingText && (
                <MessageBubble
                  message={{ role: "assistant", content: streamingText, id: "streaming" }}
                  streaming
                />
              )}
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
              disabled={!input.trim() || loading || isStreaming}
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