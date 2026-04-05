import React from 'react';
import { useBudgeting } from '../../stores/budgetingStore';

export default function GlobalsEditor() {
  const { state, dispatch } = useBudgeting();

  if (!state.project) return <div className="flex-1 flex items-center justify-center text-gray-500">No project loaded.</div>;

  const { globals } = state.project;
  const update = (key: keyof typeof globals, value: string | number) => dispatch({ type: 'UPDATE_GLOBALS', payload: { [key]: value } });

  const totalShootDays = globals.shootWeeks * globals.payDaysPerWeek;
  const totalPrepDays = globals.prepWeeks * globals.payDaysPerWeek;
  const totalWrapDays = globals.wrapWeeks * globals.payDaysPerWeek;

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div><label className="block text-xs text-gray-400 mb-1">{label}</label>{children}</div>
  );

  const numInput = (key: keyof typeof globals, value: number, step = 1) => (
    <input type="number" value={value} step={step} onChange={e => update(key, parseFloat(e.target.value) || 0)}
      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-amber-500" />
  );

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-gray-900">
      <div className="px-5 py-3 border-b border-gray-700 flex-shrink-0">
        <h2 className="text-gray-100 font-semibold text-sm">Budget Globals</h2>
        <p className="text-gray-500 text-xs">Global settings that affect budget calculations</p>
      </div>
      <div className="flex-1 overflow-auto p-5">
        <div className="max-w-2xl space-y-6">
          <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">Currency</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Currency Code">
                <input value={globals.currency} onChange={e => update('currency', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-amber-500" placeholder="USD" />
              </Field>
              <Field label="Currency Symbol">
                <input value={globals.currencySymbol} onChange={e => update('currencySymbol', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-amber-500" placeholder="$" />
              </Field>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">Production Schedule</h3>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Prep Weeks">{numInput('prepWeeks', globals.prepWeeks)}</Field>
              <Field label="Shoot Weeks">{numInput('shootWeeks', globals.shootWeeks)}</Field>
              <Field label="Wrap Weeks">{numInput('wrapWeeks', globals.wrapWeeks)}</Field>
            </div>
            <div className="mt-4 p-3 bg-gray-700 rounded text-xs text-gray-400 space-y-1">
              <div>Prep Days: <span className="text-gray-200 font-semibold">{totalPrepDays}</span></div>
              <div>Shoot Days: <span className="text-gray-200 font-semibold">{totalShootDays}</span></div>
              <div>Wrap Days: <span className="text-gray-200 font-semibold">{totalWrapDays}</span></div>
              <div className="border-t border-gray-600 pt-1 mt-1">Total Production Days: <span className="text-amber-400 font-bold">{totalPrepDays + totalShootDays + totalWrapDays}</span></div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">Pay Structure</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Pay Days Per Week">{numInput('payDaysPerWeek', globals.payDaysPerWeek)}</Field>
              <Field label="Overtime Rate (multiplier)">{numInput('overtimeRate', globals.overtimeRate, 0.1)}</Field>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">Taxes & Contingency</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Tax Rate (%)">
                <input type="number" value={globals.taxRate} step={0.1} onChange={e => update('taxRate', parseFloat(e.target.value) || 0)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-amber-500" />
              </Field>
              <Field label="Contingency (%)">
                <input type="number" value={globals.contingencyPercent} step={0.5} onChange={e => update('contingencyPercent', parseFloat(e.target.value) || 0)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-amber-500" />
              </Field>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
