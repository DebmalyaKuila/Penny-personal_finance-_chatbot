import { useState, useEffect } from "react";

const STORAGE_KEY = "penny_chats";

function loadChats() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveChats(chats) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
}

export function useChatHistory() {
  const [chats, setChats] = useState(loadChats);
  const [activeChatId, setActiveChatId] = useState(null);

  // Persist whenever chats change
  useEffect(() => {
    saveChats(chats);
  }, [chats]);

  const activeChat = chats.find((c) => c.id === activeChatId) || null;

  function newChat() {
    setActiveChatId(null);
  }

  function saveMessages(messages) {
    if (!messages.length) return;

    const title =
      messages[0].content.slice(0, 42) +
      (messages[0].content.length > 42 ? "…" : "");

    if (activeChatId) {
      setChats((prev) =>
        prev.map((c) =>
          c.id === activeChatId ? { ...c, messages, title, updatedAt: Date.now() } : c
        )
      );
    } else {
      const id = Date.now().toString();
      const chat = { id, title, messages, createdAt: Date.now(), updatedAt: Date.now() };
      setChats((prev) => [chat, ...prev]);
      setActiveChatId(id);
    }
  }

  function deleteChat(id) {
    setChats((prev) => prev.filter((c) => c.id !== id));
    if (activeChatId === id) setActiveChatId(null);
  }

  function clearAll() {
    setChats([]);
    setActiveChatId(null);
  }

  return {
    chats,
    activeChatId,
    activeChat,
    setActiveChatId,
    newChat,
    saveMessages,
    deleteChat,
    clearAll,
  };
}