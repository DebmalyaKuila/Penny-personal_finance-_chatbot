import { PlusCircle, MessageSquare, Trash2, TrendingUp, X, Clock } from "lucide-react";

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
}

export default function Sidebar({
  chats,
  activeChatId,
  onSelect,
  onNew,
  onDelete,
  onClearAll,
  open,
  onClose,
}) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-30
          w-72 flex flex-col bg-[#0a0a0a] border-r border-[#1a1a1a]
          transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#1a1a1a]">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <TrendingUp size={14} className="text-emerald-400" />
          </div>
          <span className="font-serif text-white text-base">Penny</span>

          {/* Close on mobile */}
          <button
            onClick={onClose}
            className="ml-auto lg:hidden text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* New chat button */}
        <div className="px-3 pt-3 pb-2">
          <button
            onClick={() => { onNew(); onClose(); }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-zinc-400 hover:text-emerald-300 hover:bg-emerald-500/5 border border-[#1f1f1f] hover:border-emerald-500/20 transition-all"
          >
            <PlusCircle size={15} />
            New conversation
          </button>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-1">
          {chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <MessageSquare size={24} className="text-zinc-700" />
              <p className="text-xs text-zinc-600 leading-relaxed">
                No conversations yet.
                <br />Start one below!
              </p>
            </div>
          ) : (
            chats.map((chat) => (
              <ChatRow
                key={chat.id}
                chat={chat}
                active={chat.id === activeChatId}
                onSelect={() => { onSelect(chat.id); onClose(); }}
                onDelete={() => onDelete(chat.id)}
              />
            ))
          )}
        </div>

        {/* Footer */}
        {chats.length > 0 && (
          <div className="px-3 pb-4 pt-2 border-t border-[#1a1a1a]">
            <button
              onClick={onClearAll}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-zinc-600 hover:text-red-400 hover:bg-red-400/5 transition-all"
            >
              <Trash2 size={13} />
              Clear all history
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

function ChatRow({ chat, active, onSelect, onDelete }) {
  return (
    <div
      className={`group flex items-start gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
        active
          ? "bg-emerald-500/8 border border-emerald-500/20"
          : "hover:bg-[#161616] border border-transparent"
      }`}
      onClick={onSelect}
    >
      <MessageSquare
        size={13}
        className={`mt-0.5 shrink-0 ${active ? "text-emerald-400" : "text-zinc-600"}`}
      />
      <div className="flex-1 min-w-0">
        <p
          className={`text-xs truncate leading-snug ${
            active ? "text-zinc-200" : "text-zinc-400"
          }`}
        >
          {chat.title}
        </p>
        <span className="flex items-center gap-1 mt-0.5 text-[10px] text-zinc-700">
          <Clock size={9} />
          {timeAgo(chat.updatedAt)}
        </span>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(chat.id); }}
        className="opacity-0 group-hover:opacity-100 text-zinc-700 hover:text-red-400 transition-all shrink-0 mt-0.5"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}