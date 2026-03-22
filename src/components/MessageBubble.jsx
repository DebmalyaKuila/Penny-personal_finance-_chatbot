import { TrendingUp, User } from "lucide-react";

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 msg-enter ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
          isUser
            ? "bg-zinc-800 border border-zinc-700"
            : "bg-emerald-500/10 border border-emerald-500/30"
        }`}
      >
        {isUser ? (
          <User size={13} className="text-zinc-400" />
        ) : (
          <TrendingUp size={13} className="text-emerald-400" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-emerald-500/10 text-zinc-200 border border-emerald-500/20 rounded-tr-sm"
            : "bg-[#181818] text-zinc-300 border border-[#232323] rounded-tl-sm"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}