export default function SuggestionChips({ suggestions, onSelect, grid }) {
  return (
    <div
      className={`px-5 pb-3 ${
        grid
          ? "grid grid-cols-2 gap-2"
          : "flex gap-2 overflow-x-auto pb-3 scrollbar-none"
      }`}
    >
      {suggestions.map((s) => (
        <button
          key={s}
          onClick={() => onSelect(s)}
          className={`text-xs text-zinc-400 bg-[#181818] border border-[#252525] rounded-xl px-3 py-2 hover:border-emerald-500/40 hover:text-emerald-300 transition-colors text-left whitespace-nowrap ${
            grid ? "whitespace-normal" : ""
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  );
}