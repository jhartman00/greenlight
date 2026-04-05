import { useScheduling } from '../../stores/schedulingStore';

function parsePageCount(pc: string): number {
  if (!pc) return 0;
  const m1 = pc.match(/^(\d+)\s+(\d+)\/8$/);
  if (m1) return parseInt(m1[1]) + parseInt(m1[2]) / 8;
  const m2 = pc.match(/^(\d+)\/8$/);
  if (m2) return parseInt(m2[1]) / 8;
  return parseFloat(pc) || 0;
}

export default function Reports() {
  const { state } = useScheduling();
  const { project } = state;

  if (!project) {
    return <div className="p-6 text-gray-400">No project loaded.</div>;
  }

  const { breakdowns, stripBoard, elements } = project;

  // Build day groups from stripBoard
  const days: { dayNum: number; scenes: typeof breakdowns }[] = [];
  let currentDay: typeof breakdowns = [];
  let dayNum = 0;

  for (const item of stripBoard) {
    if (item.type === 'scene') {
      const bd = breakdowns.find(b => b.id === item.breakdownId);
      if (bd) currentDay.push(bd);
    } else if (item.type === 'dayBreak') {
      dayNum++;
      days.push({ dayNum, scenes: currentDay });
      currentDay = [];
    }
  }
  if (currentDay.length > 0) {
    days.push({ dayNum: dayNum + 1, scenes: currentDay });
  }

  const totalPages = breakdowns.reduce((s, b) => s + parsePageCount(b.pageCount), 0);
  const totalDays = stripBoard.filter(i => i.type === 'dayBreak').length;

  const handlePrint = () => window.print();

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-800 border-b border-gray-700 no-print">
        <div>
          <h1 className="text-xl font-bold text-white">Scheduling Reports</h1>
          <p className="text-sm text-gray-400 mt-0.5">{project.name}</p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-gray-900 font-semibold rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-8">
        {/* Summary */}
        <section>
          <h2 className="text-lg font-bold text-amber-400 mb-4 border-b border-gray-700 pb-2">
            Production Summary — {project.name}
          </h2>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Total Scenes', value: breakdowns.length },
              { label: 'Total Script Pages', value: totalPages.toFixed(2) },
              { label: 'Shooting Days', value: totalDays },
              { label: 'Avg Pages/Day', value: totalDays > 0 ? (totalPages / totalDays).toFixed(2) : '—' },
            ].map(stat => (
              <div key={stat.label} className="bg-gray-800 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Scene count by INT/EXT and Day/Night */}
        <section>
          <h2 className="text-lg font-bold text-amber-400 mb-4 border-b border-gray-700 pb-2">
            Scene Breakdown by Type
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-2">Interior / Exterior</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-1 text-gray-400 font-medium">Type</th>
                    <th className="text-right py-1 text-gray-400 font-medium">Scenes</th>
                    <th className="text-right py-1 text-gray-400 font-medium">Pages</th>
                  </tr>
                </thead>
                <tbody>
                  {(['INT', 'EXT', 'INT/EXT'] as const).map(ie => {
                    const scenes = breakdowns.filter(b => b.intExt === ie);
                    const pages = scenes.reduce((s, b) => s + parsePageCount(b.pageCount), 0);
                    return (
                      <tr key={ie} className="border-b border-gray-800">
                        <td className="py-1.5 text-gray-200">{ie}</td>
                        <td className="text-right py-1.5 text-gray-300">{scenes.length}</td>
                        <td className="text-right py-1.5 text-gray-300">{pages.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-2">Day / Night</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-1 text-gray-400 font-medium">Time</th>
                    <th className="text-right py-1 text-gray-400 font-medium">Scenes</th>
                    <th className="text-right py-1 text-gray-400 font-medium">Pages</th>
                  </tr>
                </thead>
                <tbody>
                  {(['DAY', 'NIGHT', 'DAWN', 'DUSK'] as const).map(dn => {
                    const scenes = breakdowns.filter(b => b.dayNight === dn);
                    if (scenes.length === 0) return null;
                    const pages = scenes.reduce((s, b) => s + parsePageCount(b.pageCount), 0);
                    return (
                      <tr key={dn} className="border-b border-gray-800">
                        <td className="py-1.5 text-gray-200">{dn}</td>
                        <td className="text-right py-1.5 text-gray-300">{scenes.length}</td>
                        <td className="text-right py-1.5 text-gray-300">{pages.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Day-by-Day schedule */}
        <section>
          <h2 className="text-lg font-bold text-amber-400 mb-4 border-b border-gray-700 pb-2">
            Day-by-Day Schedule
          </h2>
          <div className="space-y-4">
            {days.map(({ dayNum, scenes }) => {
              const dayPages = scenes.reduce((s, b) => s + parsePageCount(b.pageCount), 0);
              return (
                <div key={dayNum} className="bg-gray-800 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 bg-gray-700">
                    <span className="font-bold text-white text-sm">DAY {dayNum}</span>
                    <span className="text-xs text-gray-300">
                      {scenes.length} scene{scenes.length !== 1 ? 's' : ''} · {dayPages.toFixed(2)} pages
                    </span>
                  </div>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left px-3 py-1.5 text-gray-400">Sc#</th>
                        <th className="text-left px-3 py-1.5 text-gray-400">I/E</th>
                        <th className="text-left px-3 py-1.5 text-gray-400">D/N</th>
                        <th className="text-left px-3 py-1.5 text-gray-400">Set</th>
                        <th className="text-left px-3 py-1.5 text-gray-400">Description</th>
                        <th className="text-right px-3 py-1.5 text-gray-400">Pages</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scenes.map(bd => (
                        <tr key={bd.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                          <td className="px-3 py-1.5 font-mono text-amber-400 font-bold">{bd.sceneNumber}</td>
                          <td className="px-3 py-1.5 text-gray-300">{bd.intExt}</td>
                          <td className="px-3 py-1.5 text-gray-300">{bd.dayNight}</td>
                          <td className="px-3 py-1.5 text-gray-200 max-w-[160px] truncate">{bd.setName}</td>
                          <td className="px-3 py-1.5 text-gray-400 max-w-[240px] truncate">{bd.description}</td>
                          <td className="px-3 py-1.5 text-right text-gray-300 font-mono">{bd.pageCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        </section>

        {/* Cast list */}
        <section>
          <h2 className="text-lg font-bold text-amber-400 mb-4 border-b border-gray-700 pb-2">
            Cast List
          </h2>
          <div className="space-y-1">
            {elements.filter(e => e.category === 'Cast').map(cast => {
              const sceneCount = breakdowns.filter(b => b.elements.includes(cast.id)).length;
              return (
                <div key={cast.id} className="flex items-center justify-between px-3 py-1.5 bg-gray-800 rounded text-sm">
                  <span className="text-gray-200">{cast.name}</span>
                  <span className="text-gray-400">{sceneCount} scene{sceneCount !== 1 ? 's' : ''}</span>
                </div>
              );
            })}
            {elements.filter(e => e.category === 'Cast').length === 0 && (
              <p className="text-gray-500 text-sm">No cast members added.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
