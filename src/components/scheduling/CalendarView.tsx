import { useState } from 'react';
import { useScheduling } from '../../stores/schedulingStore';

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function CalendarView() {
  const { state } = useScheduling();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  if (!state.project) return (
    <div className="flex-1 flex items-center justify-center text-gray-500">No project loaded.</div>
  );

  const { project } = state;

  const dayInfo: Record<number, { dayNumber: number; sceneIds: string[] }> = {};
  let currentDay = 0;
  let sceneBuffer: string[] = [];

  for (const item of project.stripBoard) {
    if (item.type === 'dayBreak') {
      if (sceneBuffer.length > 0) {
        dayInfo[currentDay] = { dayNumber: currentDay, sceneIds: [...sceneBuffer] };
        sceneBuffer = [];
      }
      currentDay = item.dayNumber;
      sceneBuffer = [];
    } else if (item.type === 'scene') {
      sceneBuffer.push(item.breakdownId);
    }
  }
  if (sceneBuffer.length > 0 && currentDay > 0) {
    dayInfo[currentDay] = { dayNumber: currentDay, sceneIds: sceneBuffer };
  }

  const totalShootDays = Object.keys(dayInfo).length;
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const shootDayMap: Record<number, typeof dayInfo[number]> = {};
  let shootDayIdx = 1;
  for (let d = 1; d <= daysInMonth && shootDayIdx <= totalShootDays; d++) {
    const dow = new Date(year, month, d).getDay();
    if (dow !== 0 && dow !== 6) {
      if (dayInfo[shootDayIdx]) {
        shootDayMap[d] = dayInfo[shootDayIdx];
        shootDayIdx++;
      }
    }
  }

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelectedDay(null);
  };

  const selectedInfo = selectedDay ? shootDayMap[selectedDay] : null;

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-gray-900">
      <div className="px-5 py-3 border-b border-gray-700 flex-shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-gray-100 font-semibold text-sm">Calendar View</h2>
          <p className="text-gray-500 text-xs">{totalShootDays} shoot days - Weekends skipped</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="p-1.5 bg-gray-700 rounded hover:bg-gray-600 text-gray-300 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <span className="text-gray-200 font-semibold text-sm min-w-36 text-center">
            {MONTH_NAMES[month]} {year}
          </span>
          <button onClick={nextMonth} className="p-1.5 bg-gray-700 rounded hover:bg-gray-600 text-gray-300 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-5">
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-xs font-semibold text-gray-500 py-1">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="h-20 bg-gray-800 rounded opacity-30" />
          ))}

          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
            const info = shootDayMap[day];
            const dow = new Date(year, month, day).getDay();
            const isWeekend = dow === 0 || dow === 6;
            const isSelected = selectedDay === day;
            const isToday = year === now.getFullYear() && month === now.getMonth() && day === now.getDate();

            let bgClass = 'bg-gray-800';
            if (isWeekend) bgClass = 'bg-gray-800 opacity-40';
            else if (info && isSelected) bgClass = 'bg-gray-600 ring-2 ring-amber-500';
            else if (info) bgClass = 'bg-gray-700 border border-amber-700 cursor-pointer hover:bg-gray-600';

            return (
              <div
                key={day}
                onClick={() => info && setSelectedDay(day)}
                className={`h-20 rounded p-1.5 flex flex-col transition-colors ${bgClass}`}
              >
                <div className={`text-xs font-semibold mb-1 ${isToday ? 'text-amber-400' : isWeekend ? 'text-gray-600' : 'text-gray-400'}`}>
                  {day}
                </div>
                {info && (
                  <>
                    <div className="text-xs font-bold text-amber-400">Day {info.dayNumber}</div>
                    <div className="text-xs text-gray-400">{info.sceneIds.length} scene{info.sceneIds.length !== 1 ? 's' : ''}</div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {selectedInfo && (
          <div className="mt-5 bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-amber-400 font-bold text-sm mb-3">Shoot Day {selectedInfo.dayNumber}</h3>
            <div className="space-y-2">
              {selectedInfo.sceneIds.map(bdId => {
                const bd = project.breakdowns.find(b => b.id === bdId);
                if (!bd) return null;
                return (
                  <div key={bdId} className="flex items-start gap-3 text-xs">
                    <span className="font-bold text-gray-300 w-8 flex-shrink-0">Sc {bd.sceneNumber}</span>
                    <span className="text-gray-400 w-20 flex-shrink-0">{bd.intExt} {bd.dayNight}</span>
                    <span className="text-gray-200">{bd.setName}</span>
                    <span className="text-gray-500 ml-auto flex-shrink-0">{bd.pageCount}p</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
