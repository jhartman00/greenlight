import { useState } from 'react';
import { useScheduling } from '../../stores/schedulingStore';
import type { BreakdownSheet, Element } from '../../types/scheduling';

type ReportTab = 'summary' | 'daybyDay' | 'cast' | 'location' | 'element';

function parsePageCount(pageCount: string): number {
  const parts = pageCount.trim().split(' ');
  let total = 0;
  for (const part of parts) {
    if (part.includes('/')) {
      const [num, den] = part.split('/').map(Number);
      total += num / (den || 1);
    } else {
      total += parseFloat(part) || 0;
    }
  }
  return total;
}

type ShootDay = { dayNumber: number; label?: string; sceneIds: string[] };

export default function SchedulingReports() {
  const { state } = useScheduling();
  const [activeTab, setActiveTab] = useState<ReportTab>('summary');

  if (!state.project) {
    return <div className="flex-1 flex items-center justify-center text-gray-500">No project loaded.</div>;
  }

  const { project } = state;
  const { breakdowns, stripBoard, elements } = project;

  const days: ShootDay[] = [];
  let currentDay: ShootDay | null = null;
  for (const item of stripBoard) {
    if (item.type === 'dayBreak') {
      if (currentDay) days.push(currentDay);
      currentDay = { dayNumber: item.dayNumber, label: item.label, sceneIds: [] };
    } else if (item.type === 'scene') {
      if (!currentDay) currentDay = { dayNumber: 1, sceneIds: [] };
      currentDay.sceneIds.push(item.breakdownId);
    }
  }
  if (currentDay) days.push(currentDay);

  const totalPages = breakdowns.reduce((s, b) => s + parsePageCount(b.pageCount), 0);
  const totalDays = days.length;
  const avgPages = totalDays > 0 ? totalPages / totalDays : 0;
  const castElements = elements.filter(e => e.category === 'Cast');

  const tabClass = (t: ReportTab) =>
    `px-4 py-2 text-xs font-semibold transition-colors ${activeTab === t ? 'text-amber-400 border-b-2 border-amber-500' : 'text-gray-400 hover:text-gray-200'}`;

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-gray-900">
      <div className="px-5 py-3 border-b border-gray-700 flex-shrink-0 flex items-center justify-between no-print">
        <div>
          <h2 className="text-gray-100 font-semibold text-sm">Scheduling Reports</h2>
          <p className="text-gray-500 text-xs">{project.name}</p>
        </div>
        <button onClick={() => window.print()} className="px-3 py-1.5 bg-gray-700 text-gray-300 rounded text-xs hover:bg-gray-600">
          Print Report
        </button>
      </div>

      <div className="flex border-b border-gray-700 px-4 flex-shrink-0 no-print">
        <button className={tabClass('summary')} onClick={() => setActiveTab('summary')}>Schedule Summary</button>
        <button className={tabClass('daybyDay')} onClick={() => setActiveTab('daybyDay')}>Day-by-Day</button>
        <button className={tabClass('cast')} onClick={() => setActiveTab('cast')}>Cast List</button>
        <button className={tabClass('location')} onClick={() => setActiveTab('location')}>Locations</button>
        <button className={tabClass('element')} onClick={() => setActiveTab('element')}>Elements</button>
      </div>

      <div className="flex-1 overflow-auto p-5">
        {activeTab === 'summary' && (
          <SummaryReport
            projectName={project.name}
            sceneCount={breakdowns.length}
            totalPages={totalPages}
            totalDays={totalDays}
            avgPages={avgPages}
            castCount={castElements.length}
          />
        )}
        {activeTab === 'daybyDay' && <DayByDayReport days={days} breakdowns={breakdowns} elements={elements} />}
        {activeTab === 'cast' && <CastReport castElements={castElements} breakdowns={breakdowns} days={days} />}
        {activeTab === 'location' && <LocationReport breakdowns={breakdowns} days={days} />}
        {activeTab === 'element' && <ElementReport elements={elements} breakdowns={breakdowns} />}
      </div>
    </div>
  );
}

function SummaryReport({ projectName, sceneCount, totalPages, totalDays, avgPages, castCount }: {
  projectName: string; sceneCount: number; totalPages: number; totalDays: number; avgPages: number; castCount: number;
}) {
  return (
    <div className="max-w-2xl">
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-gray-100">{projectName}</h1>
        <p className="text-gray-400 text-sm">Schedule Summary — {new Date().toLocaleDateString()}</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Total Scenes', value: sceneCount },
          { label: 'Total Pages', value: totalPages.toFixed(2) },
          { label: 'Shoot Days', value: totalDays },
          { label: 'Avg Pages / Day', value: avgPages.toFixed(2) },
          { label: 'Principal Cast', value: castCount },
          { label: 'Script Pages (Est.)', value: Math.ceil(totalPages) },
        ].map(stat => (
          <div key={stat.label} className="bg-gray-800 rounded p-4 border border-gray-700">
            <div className="text-2xl font-bold text-amber-400 font-mono">{stat.value}</div>
            <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DayByDayReport({ days, breakdowns, elements }: { days: ShootDay[]; breakdowns: BreakdownSheet[]; elements: Element[] }) {
  const castElements = elements.filter(e => e.category === 'Cast');
  return (
    <div className="space-y-4 max-w-4xl">
      <h2 className="text-gray-100 font-semibold mb-4">Day-by-Day Shooting Report</h2>
      {days.map(day => {
        const dayScenes = day.sceneIds.map(id => breakdowns.find(b => b.id === id)).filter((b): b is BreakdownSheet => !!b);
        const dayPages = dayScenes.reduce((s, b) => s + parsePageCount(b.pageCount), 0);
        const castNeeded = [...new Set(dayScenes.flatMap(b => b.elements.filter(eid => castElements.some(c => c.id === eid))))];
        const castNames = castNeeded.map(eid => castElements.find(c => c.id === eid)?.name ?? '').filter(Boolean);
        const locations = [...new Set(dayScenes.map(b => b.location))];
        return (
          <div key={day.dayNumber} className="bg-gray-800 rounded border border-gray-700 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-gray-700">
              <span className="text-amber-400 font-bold text-sm">Day {day.dayNumber}</span>
              {day.label && <span className="text-gray-300 text-xs">{day.label}</span>}
              <span className="text-gray-400 text-xs font-mono">{dayPages.toFixed(2)} pgs</span>
            </div>
            {dayScenes.length === 0 ? (
              <p className="px-4 py-3 text-gray-500 text-xs italic">No scenes scheduled</p>
            ) : (
              <table className="w-full text-xs">
                <thead className="border-b border-gray-600">
                  <tr className="text-gray-400">
                    <th className="px-3 py-1.5 text-left w-14">Sc #</th>
                    <th className="px-3 py-1.5 text-left w-24">I/E D/N</th>
                    <th className="px-3 py-1.5 text-left">Set / Location</th>
                    <th className="px-3 py-1.5 text-left">Description</th>
                    <th className="px-3 py-1.5 text-right w-16">Pages</th>
                  </tr>
                </thead>
                <tbody>
                  {dayScenes.map(scene => (
                    <tr key={scene.id} className="border-b border-gray-700 hover:bg-gray-750">
                      <td className="px-3 py-1.5 font-semibold text-amber-300">{scene.sceneNumber}</td>
                      <td className="px-3 py-1.5 text-gray-400">{scene.intExt} {scene.dayNight}</td>
                      <td className="px-3 py-1.5 text-gray-300">{scene.setName}</td>
                      <td className="px-3 py-1.5 text-gray-400 break-words">{scene.description}</td>
                      <td className="px-3 py-1.5 text-right font-mono text-gray-300">{scene.pageCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="px-4 py-2 border-t border-gray-700 flex flex-wrap gap-4 text-xs text-gray-500">
              <span>Locations: <span className="text-gray-300">{locations.join(', ')}</span></span>
              {castNames.length > 0 && <span>Cast: <span className="text-gray-300">{castNames.join(', ')}</span></span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CastReport({ castElements, breakdowns, days }: { castElements: Element[]; breakdowns: BreakdownSheet[]; days: ShootDay[] }) {
  const castData = castElements.map(cast => {
    const scenesWithCast = breakdowns.filter(b => b.elements.includes(cast.id));
    const workDays = new Set<number>();
    for (const scene of scenesWithCast) {
      for (const day of days) {
        if (day.sceneIds.includes(scene.id)) workDays.add(day.dayNumber);
      }
    }
    const totalPages = scenesWithCast.reduce((s, b) => s + parsePageCount(b.pageCount), 0);
    return { cast, sceneCount: scenesWithCast.length, workDays: [...workDays].sort((a, b) => a - b), totalPages };
  }).sort((a, b) => b.workDays.length - a.workDays.length);

  return (
    <div className="max-w-4xl">
      <h2 className="text-gray-100 font-semibold mb-4">Cast List Report</h2>
      <table className="w-full text-xs">
        <thead className="bg-gray-800 border-b border-gray-600 sticky top-0">
          <tr className="text-gray-400 font-semibold">
            <th className="px-3 py-2 text-left">Character</th>
            <th className="px-3 py-2 text-right w-24">Work Days</th>
            <th className="px-3 py-2 text-right w-20">Scenes</th>
            <th className="px-3 py-2 text-right w-20">Pages</th>
            <th className="px-3 py-2 text-left">Day Numbers</th>
          </tr>
        </thead>
        <tbody>
          {castData.map(({ cast, sceneCount, workDays, totalPages }) => (
            <tr key={cast.id} className="border-b border-gray-800 hover:bg-gray-800">
              <td className="px-3 py-2 text-gray-200 font-medium">{cast.name}</td>
              <td className="px-3 py-2 text-right text-amber-400 font-mono font-bold">{workDays.length}</td>
              <td className="px-3 py-2 text-right text-gray-300 font-mono">{sceneCount}</td>
              <td className="px-3 py-2 text-right text-gray-300 font-mono">{totalPages.toFixed(2)}</td>
              <td className="px-3 py-2">
                {workDays.map(d => (
                  <span key={d} className="inline-block bg-gray-700 text-gray-300 rounded px-1.5 py-0.5 mr-1 mb-0.5 font-mono text-xs">{d}</span>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LocationReport({ breakdowns, days }: { breakdowns: BreakdownSheet[]; days: ShootDay[] }) {
  const locationMap = new Map<string, { scenes: BreakdownSheet[]; shootDays: Set<number> }>();
  for (const b of breakdowns) {
    if (!locationMap.has(b.location)) locationMap.set(b.location, { scenes: [], shootDays: new Set() });
    locationMap.get(b.location)!.scenes.push(b);
  }
  for (const data of locationMap.values()) {
    for (const scene of data.scenes) {
      for (const day of days) {
        if (day.sceneIds.includes(scene.id)) data.shootDays.add(day.dayNumber);
      }
    }
  }
  const locations = [...locationMap.entries()].sort((a, b) => b[1].shootDays.size - a[1].shootDays.size);

  return (
    <div className="max-w-4xl space-y-3">
      <h2 className="text-gray-100 font-semibold mb-4">Location Report</h2>
      {locations.map(([location, { scenes, shootDays }]) => {
        const pages = scenes.reduce((s, b) => s + parsePageCount(b.pageCount), 0);
        const sets = [...new Set(scenes.map(b => b.setName))];
        return (
          <div key={location} className="bg-gray-800 rounded border border-gray-700 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-gray-700">
              <span className="text-gray-100 font-semibold text-sm">{location}</span>
              <div className="flex gap-4 text-xs text-gray-400">
                <span>{shootDays.size} shoot {shootDays.size === 1 ? 'day' : 'days'}</span>
                <span>{scenes.length} scenes</span>
                <span className="font-mono">{pages.toFixed(2)} pgs</span>
              </div>
            </div>
            <div className="px-4 py-2.5">
              <p className="text-xs text-gray-500 mb-1.5">Sets: <span className="text-gray-300">{sets.join(', ')}</span></p>
              <div className="flex flex-wrap gap-1.5">
                {scenes.map(s => (
                  <span key={s.id} className="text-xs bg-gray-700 text-amber-300 rounded px-2 py-0.5">Sc {s.sceneNumber}</span>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ElementReport({ elements, breakdowns }: { elements: Element[]; breakdowns: BreakdownSheet[] }) {
  const categories = [...new Set(elements.map(e => e.category))].sort() as string[];
  return (
    <div className="max-w-4xl space-y-4">
      <h2 className="text-gray-100 font-semibold mb-4">Element Report</h2>
      {categories.map(cat => {
        const catElements = elements.filter(e => e.category === cat);
        return (
          <div key={cat} className="bg-gray-800 rounded border border-gray-700 overflow-hidden">
            <div className="px-4 py-2 bg-gray-700 border-b border-gray-600 flex items-center gap-2">
              <span className="text-amber-400 font-semibold text-xs uppercase tracking-wide">{cat}</span>
              <span className="text-gray-500 text-xs">({catElements.length})</span>
            </div>
            <table className="w-full text-xs">
              <thead className="border-b border-gray-700">
                <tr className="text-gray-400">
                  <th className="px-3 py-1.5 text-left">Name</th>
                  <th className="px-3 py-1.5 text-left">Notes</th>
                  <th className="px-3 py-1.5 text-right w-20">Scenes</th>
                  <th className="px-3 py-1.5 text-left">Scene #s</th>
                </tr>
              </thead>
              <tbody>
                {catElements.map(el => {
                  const used = breakdowns.filter(b => b.elements.includes(el.id));
                  return (
                    <tr key={el.id} className="border-b border-gray-700 hover:bg-gray-750">
                      <td className="px-3 py-1.5 text-gray-200">{el.name}</td>
                      <td className="px-3 py-1.5 text-gray-500 italic">{el.notes ?? '—'}</td>
                      <td className="px-3 py-1.5 text-right text-amber-300 font-mono">{used.length}</td>
                      <td className="px-3 py-1.5 text-gray-400">{used.map(b => b.sceneNumber).join(', ')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
