
import { useScheduling } from '../../stores/schedulingStore';

type WorkCode = 'W' | 'SW' | 'WF' | 'SWF' | 'H';

export default function DayOutOfDays() {
  const { state } = useScheduling();

  if (!state.project) return <div className="flex-1 flex items-center justify-center text-gray-500">No project loaded.</div>;

  const { project } = state;
  const dayBreaks = project.stripBoard.filter(i => i.type === 'dayBreak');
  const totalDays = dayBreaks.length;

  if (totalDays === 0) return (
    <div className="flex-1 flex items-center justify-center text-gray-500">No shoot days found. Add day breaks to the strip board.</div>
  );

  const castElements = project.elements.filter(e => e.category === 'Cast');

  const dayScenes: string[][] = Array.from({ length: totalDays }, () => []);
  let currentDay = -1;
  for (const item of project.stripBoard) {
    if (item.type === 'dayBreak') { currentDay++; }
    else if (item.type === 'scene' && currentDay >= 0) { dayScenes[currentDay].push(item.breakdownId); }
  }

  const getCode = (castId: string, dayIdx: number): WorkCode => {
    const scenesForDay = dayScenes[dayIdx];
    const hasWork = scenesForDay.some(bdId => {
      const bd = project.breakdowns.find(b => b.id === bdId);
      return bd?.elements.includes(castId);
    });
    if (!hasWork) return 'H';

    const isFirst = !dayScenes.slice(0, dayIdx).some(dayBds =>
      dayBds.some(bdId => project.breakdowns.find(b => b.id === bdId)?.elements.includes(castId))
    );
    const isLast = !dayScenes.slice(dayIdx + 1).some(dayBds =>
      dayBds.some(bdId => project.breakdowns.find(b => b.id === bdId)?.elements.includes(castId))
    );
    if (isFirst && isLast) return 'SWF';
    if (isFirst) return 'SW';
    if (isLast) return 'WF';
    return 'W';
  };

  const codeColors: Record<WorkCode, string> = {
    'W': 'bg-green-700 text-green-100',
    'SW': 'bg-blue-700 text-blue-100',
    'WF': 'bg-orange-700 text-orange-100',
    'SWF': 'bg-purple-700 text-purple-100',
    'H': 'bg-gray-800 text-gray-600',
  };

  const handleExportCSV = () => {
    const header = ['Character', ...dayBreaks.map((_: unknown, i: number) => `Day ${i + 1}`)];
    const rows = castElements.map(el => {
      const codes = Array.from({ length: totalDays }, (_, i) => getCode(el.id, i));
      return [el.name, ...codes];
    });
    const csv = [header, ...rows].map((r: string[]) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `dood-${project.name}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-gray-900">
      <div className="px-5 py-3 border-b border-gray-700 flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="text-gray-100 font-semibold text-sm">Day Out of Days</h2>
          <p className="text-gray-500 text-xs">{castElements.length} cast members - {totalDays} shoot days</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-3 text-xs text-gray-400">
            <span><span className="inline-block text-center bg-green-700 text-green-100 rounded px-1 mr-1">W</span>Work</span>
            <span><span className="inline-block text-center bg-blue-700 text-blue-100 rounded px-1 mr-1">SW</span>Start</span>
            <span><span className="inline-block text-center bg-orange-700 text-orange-100 rounded px-1 mr-1">WF</span>Finish</span>
            <span><span className="inline-block text-center bg-purple-700 text-purple-100 rounded px-1 mr-1">SWF</span>Only</span>
            <span><span className="inline-block text-center bg-gray-800 text-gray-600 rounded px-1 mr-1">H</span>Hold</span>
          </div>
          <button onClick={handleExportCSV} className="px-3 py-1.5 bg-amber-500 text-gray-900 rounded text-xs font-semibold hover:bg-amber-400">
            Export CSV
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <table className="text-xs border-collapse">
          <thead>
            <tr>
              <th className="sticky left-0 bg-gray-900 z-10 px-3 py-2 text-left text-gray-400 font-semibold border-b border-r border-gray-700 min-w-40">Character</th>
              {dayBreaks.map((_: unknown, i: number) => (
                <th key={i} className="px-2 py-2 text-center text-gray-400 font-semibold border-b border-gray-700 min-w-12">
                  <div>Day</div><div className="text-gray-200">{i + 1}</div>
                </th>
              ))}
              <th className="px-3 py-2 text-center text-gray-400 font-semibold border-b border-l border-gray-700">Total W</th>
            </tr>
          </thead>
          <tbody>
            {castElements.map(el => {
              const codes = Array.from({ length: totalDays }, (_, i) => getCode(el.id, i));
              const workDays = codes.filter(c => c !== 'H').length;
              return (
                <tr key={el.id} className="border-b border-gray-800 hover:bg-gray-800">
                  <td className="sticky left-0 bg-gray-900 z-10 px-3 py-2 text-gray-200 font-medium border-r border-gray-700 whitespace-nowrap">{el.name}</td>
                  {codes.map((code, i) => (
                    <td key={i} className="px-1 py-1 text-center">
                      <span className={`inline-block text-xs px-1 py-0.5 rounded font-bold min-w-8 ${codeColors[code]}`}>{code}</span>
                    </td>
                  ))}
                  <td className="px-3 py-2 text-center text-gray-200 font-semibold border-l border-gray-700">{workDays}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
