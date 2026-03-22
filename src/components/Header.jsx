export default function Header({ onMenuClick, chatTitle }) {
  return (
    <header
      className="flex-shrink-0 flex items-center gap-3 px-4 py-3"
      style={{
        background: "rgba(19,15,30,0.8)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      {/* Mobile hamburger */}
      <button
        onClick={onMenuClick}
        className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors flex-shrink-0"
        style={{ color: "var(--color-muted)" }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" />
        </svg>
      </button>

      {/* Logo — hidden on desktop since sidebar shows it */}
      <div className="md:hidden flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
          style={{
            background: "linear-gradient(135deg, var(--color-accent), var(--color-p-400))",
            color: "#fff",
            fontFamily: "var(--font-display)",
          }}
        >
          ¢
        </div>
        <span className="font-semibold text-sm" style={{ fontFamily: "var(--font-display)", color: "var(--color-p-200)" }}>
          Penny
        </span>
      </div>

      {/* Chat title */}
      {chatTitle && (
        <p className="hidden md:block text-sm truncate flex-1" style={{ color: "var(--color-muted)" }}>
          {chatTitle}
        </p>
      )}

      <div className="ml-auto flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
        <span className="text-xs" style={{ color: "var(--color-muted)" }}>Online</span>
      </div>
    </header>
  );
}