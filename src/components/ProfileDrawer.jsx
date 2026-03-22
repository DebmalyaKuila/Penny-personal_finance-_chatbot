import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, IndianRupee, Check } from "lucide-react";

const FIELDS = [
  {
    key: "inhandSalary",
    label: "In-hand Monthly Salary",
    hint: "Your take-home pay after all deductions",
    period: "/ month",
  },
  {
    key: "ctc",
    label: "Annual Income (CTC)",
    hint: "Your total cost to company (annual)",
    period: "/ year",
  },
  {
    key: "domesticExpense",
    label: "Estimated Domestic Expense",
    hint: "Rent, groceries, utilities, transport etc.",
    period: "/ month",
  },
  {
    key: "personalExpense",
    label: "Personal Expenses",
    hint: "Shopping, eating out, personal care etc.",
    period: "/ month",
  },
  {
    key: "monthlyEmi",
    label: "Monthly EMI",
    hint: "Total of all EMIs you currently pay",
    period: "/ month",
  },
  {
    key: "totalDebt",
    label: "Total Debt",
    hint: "Outstanding loans, credit card dues etc.",
    period: "total",
  },
  {
    key: "monthlySavings",
    label: "Monthly Savings Target",
    hint: "Amount you aim to save each month",
    period: "/ month",
  },
  {
    key: "annualSavings",
    label: "Annual Savings Target",
    hint: "One-time or lump-sum savings goal (excl. monthly)",
    period: "/ year",
  },
  {
    key: "additionalMonthly",
    label: "Additional Income (Monthly)",
    hint: "Freelance, rental, side hustle etc.",
    period: "/ month",
  },
  {
    key: "additionalAnnual",
    label: "Additional Income (Annual)",
    hint: "Bonus, dividends, annual gigs etc.",
    period: "/ year",
  },
];

function formatINR(val) {
  if (!val) return "";
  return Number(val).toLocaleString("en-IN");
}

export default function ProfileDrawer({ open, onClose, profile, onSave }) {
  const [form, setForm] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (open) { setForm(profile || {}); setSaved(false); }
  }, [open, profile]);

  function handleChange(key, raw) {
    const digits = raw.replace(/[^0-9]/g, "");
    setForm((prev) => ({ ...prev, [key]: digits }));
  }

  function handleSave() {
    onSave(form);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 800);
  }

  const hasAny = Object.values(form).some(Boolean);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-start justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative h-full w-full max-w-sm bg-[#0e0e0e] border-l border-[#1f1f1f] flex flex-col shadow-2xl animate-slideIn">

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#1a1a1a] shrink-0">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <IndianRupee size={14} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-200">Financial Profile</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Penny uses this to personalise advice</p>
          </div>
          <button onClick={onClose} className="ml-auto text-zinc-600 hover:text-zinc-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Fields */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
          {FIELDS.map(({ key, label, hint, period }) => (
            <div key={key}>
              <div className="flex items-baseline justify-between mb-1">
                <label className="text-xs font-medium text-zinc-300">{label}</label>
                <span className="text-[10px] text-zinc-600">{period}</span>
              </div>
              <div className="flex items-center gap-2 bg-[#161616] border border-[#252525] focus-within:border-emerald-500/40 rounded-xl px-3 py-2.5 transition-colors">
                <span className="text-zinc-600 text-sm shrink-0">₹</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={form[key] ? formatINR(form[key]) : ""}
                  onChange={(e) => handleChange(key, e.target.value.replace(/,/g, ""))}
                  placeholder="0"
                  className="flex-1 bg-transparent text-sm text-zinc-200 placeholder-zinc-700 outline-none"
                />
              </div>
              <p className="text-[10px] text-zinc-600 mt-1">{hint}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 pt-3 border-t border-[#1a1a1a] flex flex-col gap-2 shrink-0">
          {hasAny && (
            <button
              onClick={() => { onSave({}); setForm({}); }}
              className="w-full px-4 py-2 rounded-xl text-xs text-zinc-600 hover:text-red-400 hover:bg-red-400/5 transition-all"
            >
              Clear profile
            </button>
          )}
          <button
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-black bg-emerald-500 hover:bg-emerald-400 transition-colors"
          >
            {saved ? <><Check size={15} /> Saved!</> : "Save Profile"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}