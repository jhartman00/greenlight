import { useState, useEffect } from 'react';
import { useBudgeting } from '../../stores/budgetingStore';
import { formatCurrency } from '../../utils/calculations';
import type { BudgetGlobals } from '../../types/budgeting';

const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'CAD', symbol: 'CA$', label: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar' },
];

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
      {hint && <p className="text-xs text-gray-500 mb-1.5">{hint}</p>}
      {children}
    </div>
  );
}

function NumInput({ value, onChange, min, max, step }: {
  value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number;
}) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      step={step ?? 1}
      onChange={e => onChange(parseFloat(e.target.value) || 0)}
      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-amber-500"
    />
  );
}

export default function GlobalsEditor() {
  const { state, dispatch } = useBudgeting();
  const project = state.project;
  const [form, setForm] = useState<BudgetGlobals | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (project) setForm({ ...project.globals });
  }, [project?.id]);

  if (!project || !form) return <div className="p-6 text-gray-400">No project loaded.</div>;

  const sym = form.currencySymbol;
  const totalWeeks = form.prepWeeks + form.shootWeeks + form.wrapWeeks;

  const handleCurrencyChange = (code: string) => {
    const cur = CURRENCIES.find(c => c.code === code);
    if (cur) setForm(f => f && { ...f, currency: cur.code, currencySymbol: cur.symbol });
  };

  const handleSave = () => {
    dispatch({ type: 'UPDATE_GLOBALS', payload: form });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const shootDiff = form.shootWeeks - project.globals.shootWeeks;
  const weeklyBurn = project.grandTotal / (project.globals.shootWeeks || 1);
  const impact = shootDiff !== 0 ? { dir: shootDiff > 0 ? 'increase' : 'decrease', amount: Math.abs(shootDiff * weeklyBurn), weeks: shootDiff } : null;

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <div className="flex items-center justify-between px-6 py-4 bg-gray-800 border-b border-gray-700">
        <div>
          <h1 className="text-xl font-bold text-white">Budget Globals</h1>
          <p className="text-sm text-gray-400 mt-0.5">Production-wide settings that affect all calculations</p>
        </div>
        <button
          onClick={handleSave}
          className={`px-5 py-2 rounded-lg font-semibold text-sm transition-colors ${saved ? 'bg-green-600 text-white' : 'bg-amber-500 hover:bg-amber-400 text-gray-900'}`}
        >
          {saved ? 'Saved!' : 'Apply Changes'}
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl space-y-8">
          <section>
            <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-4">Currency</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Currency">
                <select
                  value={form.currency}
                  onChange={e => handleCurrencyChange(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-amber-500"
                >
                  {CURRENCIES.map(c => (
                    <option key={c.code} value={c.code} className="bg-gray-800">{c.symbol} — {c.label} ({c.code})</option>
                  ))}
                </select>
              </Field>
              <Field label="Preview">
                <div className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-amber-400 font-mono">{form.currencySymbol}1,000,000</div>
              </Field>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-4">Production Schedule</h2>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Prep Weeks"><NumInput value={form.prepWeeks} onChange={v => setForm(f => f && { ...f, prepWeeks: v })} min={0} /></Field>
              <Field label="Shoot Weeks"><NumInput value={form.shootWeeks} onChange={v => setForm(f => f && { ...f, shootWeeks: v })} min={0} /></Field>
              <Field label="Wrap Weeks"><NumInput value={form.wrapWeeks} onChange={v => setForm(f => f && { ...f, wrapWeeks: v })} min={0} /></Field>
            </div>
            {impact && (
              <div className={`mt-3 p-3 rounded-lg text-sm ${impact.dir === 'increase' ? 'bg-red-900/30 text-red-300 border border-red-800' : 'bg-green-900/30 text-green-300 border border-green-800'}`}>
                Changing shoot weeks by {impact.weeks > 0 ? '+' : ''}{impact.weeks} will approximately {impact.dir} budget by ~{formatCurrency(impact.amount, sym)}
              </div>
            )}
            <div className="mt-3 p-3 bg-gray-800 rounded-lg text-sm text-gray-400 flex gap-6">
              <span>Total: <span className="text-gray-200 font-semibold">{totalWeeks} weeks</span></span>
              <span>Prep: <span className="text-gray-200">{form.prepWeeks}w</span></span>
              <span>Shoot: <span className="text-gray-200">{form.shootWeeks}w</span></span>
              <span>Wrap: <span className="text-gray-200">{form.wrapWeeks}w</span></span>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-4">Pay Rates</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Pay Days per Week"><NumInput value={form.payDaysPerWeek} onChange={v => setForm(f => f && { ...f, payDaysPerWeek: v })} min={1} max={7} /></Field>
              <Field label="Overtime Rate" hint="Multiplier, e.g. 1.5 = time-and-a-half"><NumInput value={form.overtimeRate} onChange={v => setForm(f => f && { ...f, overtimeRate: v })} min={1} max={3} step={0.25} /></Field>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-4">Tax &amp; Contingency</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Tax Rate (%)"><NumInput value={form.taxRate} onChange={v => setForm(f => f && { ...f, taxRate: v })} min={0} max={100} step={0.1} /></Field>
              <Field label="Contingency (%)" hint="Typically 10%"><NumInput value={form.contingencyPercent} onChange={v => setForm(f => f && { ...f, contingencyPercent: v })} min={0} max={50} /></Field>
            </div>
            <div className="mt-4 p-4 bg-gray-800 rounded-lg grid grid-cols-3 gap-4 text-sm">
              <div><div className="text-gray-400 text-xs mb-1">Grand Total</div><div className="text-white font-mono font-semibold">{formatCurrency(project.grandTotal, sym)}</div></div>
              <div><div className="text-gray-400 text-xs mb-1">Contingency ({form.contingencyPercent}%)</div><div className="text-white font-mono font-semibold">{formatCurrency(project.grandTotal * form.contingencyPercent / 100, sym)}</div></div>
              <div><div className="text-gray-400 text-xs mb-1">Total w/ Contingency</div><div className="text-amber-400 font-mono font-bold text-base">{formatCurrency(project.grandTotal * (1 + form.contingencyPercent / 100), sym)}</div></div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
