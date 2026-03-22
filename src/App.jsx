import { useState } from "react";
import ChatWindow from "./components/ChatWindow";
import Sidebar from "./components/Sidebar";
import ProfileDrawer from "./components/ProfileDrawer";
import { useChatHistory } from "./hooks/useChatHistory";
import { useFinanceProfile } from "./hooks/useFinanceProfile";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const history = useChatHistory();
  const { profile, saveProfile } = useFinanceProfile();

  return (
    <div className="flex h-screen w-screen bg-[#0c0c0c] overflow-hidden">
      <Sidebar
        chats={history.chats}
        activeChatId={history.activeChatId}
        onSelect={history.setActiveChatId}
        onNew={history.newChat}
        onDelete={history.deleteChat}
        onRename={history.renameChat}
        onClearAll={history.clearAll}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <ChatWindow
          key={history.activeChatId ?? "new"}
          initialMessages={history.activeChat?.messages || []}
          onMessagesChange={history.saveMessages}
          onMenuClick={() => setSidebarOpen(true)}
          onProfileClick={() => setProfileOpen(true)}
          profile={profile}
        />
      </div>

      <ProfileDrawer
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        profile={profile}
        onSave={saveProfile}
      />
    </div>
  );
}