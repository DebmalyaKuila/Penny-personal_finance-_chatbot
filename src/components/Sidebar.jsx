import { useState, useRef, useEffect } from "react";
import {
  PlusCircle, MessageSquare, Trash2, TrendingUp,
  X, Clock, AlertTriangle, MoreHorizontal, Pencil, Check,
} from "lucide-react";
import { createPortal } from "react-dom";

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onCancel} />
      <div className="relative bg-[#161616] border border-[#2a2a2a] rounded-2xl p-5 w-full max-w-sm shadow-2xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle size={16} className="text-red-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-200">{message}</p>
            <p className="text-xs text-zinc-500 mt-0.5">This can't be undone.</p>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={onCancel}
            className="flex-1 px-3 py-2 rounded-lg text-xs text-zinc-400 bg-[#1f1f1f] hover:bg-[#252525] border border-[#2a2a2a] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-3 py-2 rounded-lg text-xs text-white bg-red-500/80 hover:bg-red-500 border border-red-500/30 transition-colors"
          >
            Yes, delete
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function RenameDialog({ currentTitle, onConfirm, onCancel }) {
  const [val, setVal] = useState(currentTitle);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  function handleConfirm() {
    const trimmed = val.trim();
    if (!trimmed) return;
    onConfirm(trimmed);
  }

  function handleKey(e) {
    if (e.key === "Enter") handleConfirm();
    if (e.key === "Escape") onCancel();
  }

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onCancel} />
      <div className="relative bg-[#161616] border border-[#2a2a2a] rounded-2xl p-5 w-full max-w-sm shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <Pencil size={14} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-200">Rename conversation</p>
            <p className="text-xs text-zinc-500 mt-0.5">Give this chat a new name</p>
          </div>
        </div>
        <input
          ref={inputRef}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Enter new name..."
          className="w-full bg-[#1f1f1f] border border-[#2a2a2a] focus:border-emerald-500/40 rounded-xl px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 outline-none transition-colors"
        />
        <div className="flex gap-2 mt-3">
          <button
            onClick={onCancel}
            className="flex-1 px-3 py-2 rounded-lg text-xs text-zinc-400 bg-[#1f1f1f] hover:bg-[#252525] border border-[#2a2a2a] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!val.trim()}
            className="flex-1 px-3 py-2 rounded-lg text-xs text-black bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5"
          >
            <Check size={12} />
            Rename
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function ContextMenu({ position, onRename, onDelete, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return createPortal(
    <div
      ref={ref}
      style={{ top: position.y, left: position.x }}
      className="fixed z-[998] bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl shadow-2xl py-1 w-36 overflow-hidden"
    >
      <button
        onClick={() => { onRename(); onClose(); }}
        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-[#252525] transition-colors"
      >
        <Pencil size={12} />
        Rename
      </button>
      <button
        onClick={() => { onDelete(); onClose(); }}
        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
      >
        <Trash2 size={12} />
        Delete
      </button>
    </div>,
    document.body
  );
}

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
  onRename,
  onClearAll,
  open,
  onClose,
}) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-30
          w-72 flex flex-col bg-[#0a0a0a] border-r border-[#1a1a1a]
          transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#1a1a1a]">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <TrendingUp size={14} className="text-emerald-400" />
          </div>
          <span className="font-serif text-white text-base">Penny</span>
          <button
            onClick={onClose}
            className="ml-auto lg:hidden text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-3 pt-3 pb-2">
          <button
            onClick={() => { onNew(); onClose(); }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-zinc-400 hover:text-emerald-300 hover:bg-emerald-500/5 border border-[#1f1f1f] hover:border-emerald-500/20 transition-all"
          >
            <PlusCircle size={15} />
            New conversation
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-1">
          {chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <MessageSquare size={24} className="text-zinc-700" />
              <p className="text-xs text-zinc-600 leading-relaxed">
                No conversations yet.<br />Start one below!
              </p>
            </div>
          ) : (
            chats.map((chat) => (
              <ChatRow
                key={chat.id}
                chat={chat}
                active={chat.id === activeChatId}
                onSelect={() => { onSelect(chat.id); onClose(); }}
                onDelete={onDelete}
                onRename={onRename}
              />
            ))
          )}
        </div>

        {chats.length > 0 && (
          <div className="px-3 pb-4 pt-2 border-t border-[#1a1a1a]">
            <button
              onClick={() => setShowClearConfirm(true)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-zinc-600 hover:text-red-400 hover:bg-red-400/5 transition-all"
            >
              <Trash2 size={13} />
              Clear all history
            </button>
          </div>
        )}
      </aside>

      {showClearConfirm && (
        <ConfirmDialog
          message="Clear all history?"
          onConfirm={() => { onClearAll(); setShowClearConfirm(false); }}
          onCancel={() => setShowClearConfirm(false)}
        />
      )}
    </>
  );
}

function ChatRow({ chat, active, onSelect, onDelete, onRename }) {
  const [menu, setMenu] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const btnRef = useRef(null);

  function handleDots(e) {
    e.stopPropagation();
    const rect = btnRef.current.getBoundingClientRect();
    const x = Math.min(rect.right + 4, window.innerWidth - 152);
    const y = rect.top;
    setMenu({ x, y });
  }

  function handleRenameConfirm(newTitle) {
    onRename(chat.id, newTitle);
    setShowRename(false);
  }

  return (
    <>
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
          <p className={`text-xs truncate leading-snug ${active ? "text-zinc-200" : "text-zinc-400"}`}>
            {chat.title}
          </p>
          <span className="flex items-center gap-1 mt-0.5 text-[10px] text-zinc-700">
            <Clock size={9} />
            {timeAgo(chat.updatedAt)}
          </span>
        </div>
        <button
          ref={btnRef}
          onClick={handleDots}
          className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-zinc-300 transition-all shrink-0 mt-0.5 p-0.5 rounded"
        >
          <MoreHorizontal size={13} />
        </button>
      </div>

      {menu && (
        <ContextMenu
          position={menu}
          onClose={() => setMenu(null)}
          onRename={() => setShowRename(true)}
          onDelete={() => setConfirmDelete(true)}
        />
      )}

      {showRename && (
        <RenameDialog
          currentTitle={chat.title}
          onConfirm={handleRenameConfirm}
          onCancel={() => setShowRename(false)}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          message="Delete this chat?"
          onConfirm={() => { onDelete(chat.id); setConfirmDelete(false); }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </>
  );
}