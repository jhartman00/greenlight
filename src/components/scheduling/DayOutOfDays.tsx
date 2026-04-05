import { useMemo } from 'react'
import { useScheduling } from '../../stores/schedulingStore'
import type { StripBoardItem } from '../../types/scheduling'

// Work codes used in Day Out of Days reports
type WorkCode = 'SW' | 'W' | 'WF' | 'SWF' | 'H' | ''

interface ShootingDay {
  dayNumber: number
  sceneIds: string[]   // breakdown IDs in this day
}

/**
 * Parse the strip board into shooting days.
 * Everything between two day-break markers belongs to the earlier day.
 * Scenes before the first day break are "Day 1" by convention.
 */
function parseShootingDays(stripBoard: StripBoardItem[]): ShootingDay[] {
  const days: ShootingDay[] = []
  let currentDay: ShootingDay = { dayNumber: 1, sceneIds: [] }

  for (const item of stripBoard) {
    if (item.type === 'dayBreak') {
      // save what we have so far
      if (currentDay.sceneIds.length > 0) {
        days.push(currentDay)
      }
      currentDay = { dayNumber: (item.dayNumber ?? days.length + 1) + 1, sceneIds: [] }
    } else if (item.type === 'scene' && item.breakdownId) {
      currentDay.sceneIds.push(item.breakdownId)
    }
  }
  // push the final day if it has scenes
  if (currentDay.sceneIds.length > 0) {
    days.push(currentDay)
  }
  return days
}

/**
 * Determine work code for a cast member on a given day.
 * SW = Start Work (first day working)
 * WF = Work Finish (last day working)
 * SWF = both start and finish same day
 * W = working
 * H = Hold (between first and last working day, not actively shooting)
 */
function getWorkCode(
  dayIndex: number,
  workingDayIndices: number[],
): WorkCode {
  if (workingDayIndices.length === 0) return ''

  const firstDay = workingDayIndices[0]
  const lastDay = workingDayIndices[workingDayIndices.length - 1]
  const isWorking = workingDayIndices.includes(dayIndex)
  const isFirst = dayIndex === firstDay
  const isLast = dayIndex === lastDay

  if (!isWorking) {
    // Hold if between first and last working day
    if (dayIndex > firstDay && dayIndex < lastDay) return 'H'
    return ''
  }

  if (isFirst && isLast) return 'SWF'
  if (isFirst) return 'SW'
  if (isLast) return 'WF'
  return 'W'
}

function workCodeStyle(code: WorkCode): string {
  switch (code) {
    case 'SW': return 'bg-green-700 text-green-100'
    case 'WF': return 'bg-red-700 text-red-100'
    case 'SWF': return 'bg-purple-700 text-purple-100'
    case 'W': return 'bg-amber-500 text-gray-900'
    case 'H': return 'bg-gray-600 text-gray-300'
    default: return ''
  }
}

export default function DayOutOfDays() {
  const { state } = useScheduling()
  const project = state.project

  const { days, castMembers, grid } = useMemo(() => {
    if (!project) return { days: [], castMembers: [], grid: [] }

    const days = parseShootingDays(project.stripBoard)
    const castMembers = project.elements.filter(e => e.category === 'Cast')

    // For each cast member, find which day indices they work
    const grid = castMembers.map(cast => {
      const workingDayIndices: number[] = []
      days.forEach((day, idx) => {
        const worksThisDay = day.sceneIds.some(bId => {
          const bd = project.breakdowns.find(b => b.id === bId)
          return bd?.elements.includes(cast.id) ?? false
        })
        if (worksThisDay) workingDayIndices.push(idx)
      })

      const codes: WorkCode[] = days.map((_, idx) =>
        getWorkCode(idx, workingDayIndices)
      )

      return { cast, codes, workingDayIndices }
    })

    return { days, castMembers, grid }
  }, [project])

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        No project loaded.
      </div>
    )
  }

  if (days.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-400">
        <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-sm">No shooting days yet.</p>
        <p className="text-xs text-gray-500">Add day breaks in the Strip Board to generate the DOOD report.</p>
      </div>
    )
  }

  if (castMembers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-400">
        <p className="text-sm">No cast elements found.</p>
        <p className="text-xs text-gray-500">Add Cast elements in the Element Manager and assign them to scenes.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <div className="px-6 py-4 bg-gray-800 border-b border-gray-700 flex-shrink-0">
        <h1 className="text-xl font-bold text-white">Day Out of Days</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {castMembers.length} cast member{castMembers.length !== 1 ? 's' : ''} &middot; {days.length} shooting day{days.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-6 py-2.5 bg-gray-800 border-b border-gray-700 flex-shrink-0">
        <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Legend:</span>
        {([
          ['SW', 'Start Work'],
          ['W', 'Work'],
          ['WF', 'Work Finish'],
          ['SWF', 'Start/Work/Finish'],
          ['H', 'Hold'],
        ] as [WorkCode, string][]).map(([code, label]) => (
          <div key={code} className="flex items-center gap-1.5">
            <span className={`inline-flex items-center justify-center w-8 h-5 rounded text-xs font-bold ${workCodeStyle(code)}`}>
              {code}
            </span>
            <span className="text-xs text-gray-400">{label}</span>
          </div>
        ))}
      </div>

      {/* DOOD Table */}
      <div className="flex-1 overflow-auto">
        <table className="text-xs border-collapse min-w-full">
          <thead className="sticky top-0 z-10">
            <tr className="bg-gray-800 border-b border-gray-700">
              <th className="px-4 py-2.5 text-left text-gray-400 font-semibold whitespace-nowrap w-48 sticky left-0 bg-gray-800 z-20 border-r border-gray-700">
                Cast Member
              </th>
              {days.map(day => (
                <th
                  key={day.dayNumber}
                  className="px-2 py-2.5 text-center text-gray-400 font-semibold w-14 whitespace-nowrap"
                >
                  <div className="text-amber-400 font-bold">D{day.dayNumber - 1 || day.dayNumber}</div>
                  <div className="text-gray-500 font-normal">{day.sceneIds.length} sc</div>
                </th>
              ))}
              <th className="px-3 py-2.5 text-center text-gray-400 font-semibold whitespace-nowrap w-16 border-l border-gray-700">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/40">
            {grid.map(({ cast, codes }, rowIdx) => {
              const workDays = codes.filter(c => c !== '' && c !== 'H').length
              const holdDays = codes.filter(c => c === 'H').length
              const isEven = rowIdx % 2 === 0

              return (
                <tr
                  key={cast.id}
                  className={isEven ? 'bg-gray-900' : 'bg-gray-800/40'}
                >
                  {/* Cast name - sticky */}
                  <td className={`px-4 py-2 sticky left-0 border-r border-gray-700 font-medium text-white whitespace-nowrap ${isEven ? 'bg-gray-900' : 'bg-gray-800/90'}`}>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                      <span className="truncate max-w-[160px]" title={cast.name}>{cast.name}</span>
                    </div>
                  </td>

                  {/* Day cells */}
                  {codes.map((code, dayIdx) => (
                    <td key={dayIdx} className="px-1 py-1.5 text-center">
                      {code ? (
                        <span
                          className={`inline-flex items-center justify-center w-10 h-6 rounded font-bold text-xs ${workCodeStyle(code)}`}
                        >
                          {code}
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-10 h-6 text-gray-700">—</span>
                      )}
                    </td>
                  ))}

                  {/* Totals */}
                  <td className="px-3 py-2 text-center border-l border-gray-700">
                    <div className="text-white font-bold">{workDays}W</div>
                    {holdDays > 0 && (
                      <div className="text-gray-500 text-xs">{holdDays}H</div>
                    )}
                  </td>
                </tr>
              )
            })}

            {/* Day totals row */}
            <tr className="bg-gray-700 border-t border-gray-600">
              <td className="px-4 py-2 sticky left-0 bg-gray-700 border-r border-gray-600 text-gray-300 font-bold text-xs uppercase tracking-wider">
                Day Totals
              </td>
              {days.map((_day, dayIdx) => {
                const count = grid.filter(({ codes }) => codes[dayIdx] !== '' && codes[dayIdx] !== 'H').length
                return (
                  <td key={dayIdx} className="px-1 py-2 text-center">
                    <span className={`font-bold text-sm ${count > 0 ? 'text-amber-400' : 'text-gray-600'}`}>
                      {count > 0 ? count : '—'}
                    </span>
                  </td>
                )
              })}
              <td className="px-3 py-2 text-center border-l border-gray-600">
                <span className="text-amber-400 font-bold">
                  {grid.reduce((sum, { codes }) =>
                    sum + codes.filter(c => c !== '' && c !== 'H').length, 0
                  )}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
