import { TrendingUp } from "lucide-react";

export default function TypingIndicator() {
  return (
    <div className="flex gap-3 items-center msg-enter">
      <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
        <TrendingUp size={13} className="text-emerald-400" />
      </div>
      <div className="bg-[#181818] border border-[#232323] rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 items-center">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:150ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}