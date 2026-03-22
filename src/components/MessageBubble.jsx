import { TrendingUp, User, RotateCcw } from "lucide-react";

function parseTable(lines) {
  const rows = lines.map((l) =>
    l.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim())
  );
  const header = rows[0];
  const body = rows.slice(2);
  return { header, body };
}

function isTableLine(line) {
  return line.trim().startsWith("|");
}

function isSeparatorLine(line) {
  return /^\|?\s*[-:]+\s*(\|\s*[-:]+\s*)+\|?$/.test(line.trim());
}

function parseMarkdown(text) {
  const lines = text.split("\n");
  const result = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "") {
      result.push(<br key={i} />);
      i++;
      continue;
    }

    if (isTableLine(line)) {
      const tableLines = [];
      while (i < lines.length && isTableLine(lines[i])) {
        tableLines.push(lines[i]);
        i++;
      }
      if (tableLines.length >= 3 && isSeparatorLine(tableLines[1])) {
        const { header, body } = parseTable(tableLines);
        result.push(
          <div key={`table-${i}`} className="overflow-x-auto my-3 rounded-xl border border-[#2a2a2a]">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-[#1a1a1a]">
                  {header.map((h, hi) => (
                    <th key={hi} className={`px-3 py-2.5 text-zinc-300 font-medium border-b border-[#2a2a2a] whitespace-nowrap ${hi === 0 ? "text-left" : "text-right"}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {body.map((row, ri) => {
                  const isTotalRow =
                    row[0]?.toLowerCase().includes("total") ||
                    row[0]?.toLowerCase().includes("surplus") ||
                    row[0]?.toLowerCase().includes("remaining") ||
                    row[0]?.toLowerCase().includes("balance") ||
                    row[0]?.toLowerCase().includes("net");
                  return (
                    <tr key={ri} className={`border-b border-[#1f1f1f] last:border-0 transition-colors ${isTotalRow ? "bg-emerald-500/8 text-emerald-300" : ri % 2 === 0 ? "bg-[#111111]" : "bg-[#131313]"}`}>
                      {row.map((cell, ci) => (
                        <td key={ci} className={`px-3 py-2.5 ${ci === 0 ? "text-left" : "text-right"} ${isTotalRow ? "font-medium" : "text-zinc-400"}`}>
                          {inlineFormat(cell)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
        continue;
      }
      tableLines.forEach((tl, ti) => {
        result.push(<p key={`tl-${i}-${ti}`} className="leading-relaxed">{inlineFormat(tl)}</p>);
      });
      continue;
    }

    if (line.startsWith("### ")) {
      result.push(<p key={i} className="font-semibold text-zinc-200 mt-2 mb-0.5">{inlineFormat(line.slice(4))}</p>);
      i++; continue;
    }

    if (line.startsWith("## ")) {
      result.push(<p key={i} className="font-semibold text-zinc-100 mt-2 mb-0.5">{inlineFormat(line.slice(3))}</p>);
      i++; continue;
    }

    if (/^[\*\-]\s/.test(line) && !line.startsWith("**")) {
      const items = [];
      while (i < lines.length && /^[\*\-]\s/.test(lines[i]) && !lines[i].startsWith("**")) {
        items.push(<li key={i} className="ml-3 leading-relaxed">{inlineFormat(lines[i].slice(2))}</li>);
        i++;
      }
      result.push(<ul key={`ul-${i}`} className="list-disc list-outside ml-2 my-1 flex flex-col gap-0.5">{items}</ul>);
      continue;
    }

    result.push(<p key={i} className="leading-relaxed">{inlineFormat(line)}</p>);
    i++;
  }

  return result;
}

function inlineFormat(text) {
  const cleaned = text.replace(/(?<!\*)\*(?!\*)/g, "");
  const parts = cleaned.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={idx} className="text-zinc-100 font-semibold">{part.slice(2, -2)}</strong>;
    }
    return <span key={idx}>{part}</span>;
  });
}

export default function MessageBubble({ message, streaming, onRetry }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 msg-enter ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isUser ? "bg-zinc-800 border border-zinc-700" : "bg-emerald-500/10 border border-emerald-500/30"}`}>
        {isUser
          ? <User size={13} className="text-zinc-400" />
          : <TrendingUp size={13} className="text-emerald-400" />
        }
      </div>

      {/* Bubble + retry */}
      <div className={`flex flex-col gap-1.5 max-w-[80%] ${isUser ? "items-end" : "items-start"}`}>
        <div className={`rounded-2xl px-4 py-3 text-sm ${isUser ? "bg-emerald-500/10 text-zinc-200 border border-emerald-500/20 rounded-tr-sm" : "bg-[#181818] text-zinc-300 border border-[#232323] rounded-tl-sm"}`}>
          <div className="flex flex-col gap-1">
            {isUser
              ? <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
              : parseMarkdown(message.content)
            }
          </div>
          {streaming && (
            <span className="inline-block w-[2px] h-[14px] bg-emerald-400 ml-[2px] align-middle animate-pulse" />
          )}
        </div>

        {/* Retry — only on assistant messages, never during streaming */}
        {!isUser && onRetry && !streaming && (
          <button
            onClick={onRetry}
            title="Regenerate response"
            className="flex items-center gap-1 text-[10px] text-zinc-600 hover:text-emerald-400 transition-colors px-1"
          >
            <RotateCcw size={10} />
            regenerate
          </button>
        )}
      </div>
    </div>
  );
}