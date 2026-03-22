import { TrendingUp, User } from "lucide-react";

function parseMarkdown(text) {
  const lines = text.split("\n");
  const result = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Empty line
    if (line.trim() === "") {
      result.push(<br key={i} />);
      i++;
      continue;
    }

    // Heading ## or ###
    if (line.startsWith("### ")) {
      result.push(
        <p key={i} className="font-semibold text-zinc-200 mt-2 mb-0.5">
          {inlineFormat(line.slice(4))}
        </p>
      );
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      result.push(
        <p key={i} className="font-semibold text-zinc-100 mt-2 mb-0.5">
          {inlineFormat(line.slice(3))}
        </p>
      );
      i++;
      continue;
    }

    // Bullet point: lines starting with * or - (but not **)
    if (/^[\*\-]\s/.test(line) && !line.startsWith("**")) {
      const items = [];
      while (i < lines.length && /^[\*\-]\s/.test(lines[i]) && !lines[i].startsWith("**")) {
        items.push(
          <li key={i} className="ml-3 leading-relaxed">
            {inlineFormat(lines[i].slice(2))}
          </li>
        );
        i++;
      }
      result.push(
        <ul key={`ul-${i}`} className="list-disc list-outside ml-2 my-1 flex flex-col gap-0.5">
          {items}
        </ul>
      );
      continue;
    }

    // Regular paragraph
    result.push(
      <p key={i} className="leading-relaxed">
        {inlineFormat(line)}
      </p>
    );
    i++;
  }

  return result;
}

function inlineFormat(text) {
  // Split on **bold** and *italic*
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={idx} className="text-zinc-100 font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={idx} className="text-zinc-300 italic">{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

export default function MessageBubble({ message, streaming }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 msg-enter ${isUser ? "flex-row-reverse" : ""}`}>
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

      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
          isUser
            ? "bg-emerald-500/10 text-zinc-200 border border-emerald-500/20 rounded-tr-sm"
            : "bg-[#181818] text-zinc-300 border border-[#232323] rounded-tl-sm"
        }`}
      >
        <div className="flex flex-col gap-1">
          {isUser ? (
            <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
          ) : (
            parseMarkdown(message.content)
          )}
        </div>
        {streaming && (
          <span className="inline-block w-0.5 h-3.5 bg-emerald-400 ml-0.5 align-middle animate-pulse" />
        )}
      </div>
    </div>
  );
}