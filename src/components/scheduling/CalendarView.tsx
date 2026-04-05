import { useState, useMemo } from 'react'
import { useScheduling } from '../../stores/schedulingStore'
import { getStripColors } from '../../utils/colors'
import type { StripBoardItem, BreakdownSheet } from '../../types/scheduling'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

function toDateKey(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

interface ShootingDay {
  dayNumber: number
  date: string
  breakdownIds: string[]
}

function buildShootingDays(stripBoard: StripBoardItem[], shootStartDate?: string): ShootingDay[] {
  const days: ShootingDay[] = []
  let currentIds: string[] = []
  let dayNum = 1

  for (const item of stripBoard) {
    if (item.type === 'dayBreak') {
      if (currentIds.length > 0) {
        days.push({ dayNumber: dayNum, date: '', breakdownIds: [...currentIds] })
        dayNum++
        currentIds = []
      }
    } else if (item.type === 'scene' && item.breakdownId) {
      currentIds.push(item.breakdownId)
    }
  }
  if (currentIds.length > 0) {
    days.push({ dayNumber: dayNum, date: '', breakdownIds: [...currentIds] })
  }

  if (shootStartDate) {
    try {
      const d = new Date(shootStartDate + 'T00:00:00')
      while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1)
      for (const day of days) {
        day.date = toDateKey(d.getFullYear(), d.getMonth(), d.getDate())
        d.setDate(d.getDate() + 1)
        while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1)
      }
    } catch {
      // leave empty
    }
  }
  return days
}

export default function CalendarView() {
  const { state } = useScheduling()
  const project = state.project

  const today = new Date()
  const [viewYear, setViewYear] = useState(() => {
    if (project?.shootStartDate) return parseInt(project.shootStartDate.slice(0, 4))
    return today.getFullYear()
  })
  const [viewMonth, setViewMonth] = useState(() => {
    if (project?.shootStartDate) return parseInt(project.shootStartDate.slice(5, 7)) - 1
    return today.getMonth()
  })
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const shootingDays = useMemo(() => {
    if (!project) return []
    return buildShootingDays(project.stripBoard, project.shootStartDate)
  }, [project?.stripBoard, project?.shootStartDate])

  const dateToDay = useMemo(() => {
    const map = new Map<string, ShootingDay>()
    for (const day of shootingDays) {
      if (day.date) map.set(day.date, day)
    }
    return map
  }, [shootingDays])

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        No project loaded.
      </div>
    )
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
    setSelectedDate(null)
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
    setSelectedDate(null)
  }

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDow = getFirstDayOfWeek(viewYear, viewMonth)
  const todayKey = toDateKey(today.getFullYear(), today.getMonth(), today.getDate())

  const calendarCells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (calendarCells.length % 7 !== 0) calendarCells.push(null)

  const selectedDay = selectedDate ? dateToDay.get(selectedDate) ?? null : null
  const selectedBreakdowns: BreakdownSheet[] = selectedDay
    ? selectedDay.breakdownIds
        .map(id => project.breakdowns.find(b => b.id === id))
        .filter(Boolean) as BreakdownSheet[]
    : []

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-800 border-b border-gray-700 flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white">Shooting Calendar</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {shootingDays.filter(d => d.date).length} days scheduled
            {project.shootStartDate && (
              <> &middot; Starting{' '}
                {new Date(project.shootStartDate + 'T00:00:00').toLocaleDateString('en-US', {
                  month: 'long', day: 'numeric', year: 'numeric',
                })}
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setViewYear(today.getFullYear())
              setViewMonth(today.getMonth())
              setSelectedDate(null)
            }}
            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg transition-colors"
          >
            Today
          </button>
          <button
            onClick={prevMonth}
            className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-white font-bold text-lg min-w-[200px] text-center">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </span>
          <button
            onClick={nextMonth}
            className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Calendar grid */}
        <div className="flex-1 overflow-auto p-4">
          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAY_NAMES.map(dn => (
              <div key={dn} className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wider py-2">
                {dn}
              </div>
            ))}
          </div>

          {/* Cells */}
          <div className="grid grid-cols-7 gap-1">
            {calendarCells.map((day, idx) => {
              if (day === null) return <div key={`e-${idx}`} className="h-24 rounded-lg" />

              const key = toDateKey(viewYear, viewMonth, day)
              const shootDay = dateToDay.get(key)
              const isToday = key === todayKey
              const isSelected = key === selectedDate
              const isWeekend = idx % 7 === 0 || idx % 7 === 6

              return (
                <div
                  key={key}
                  onClick={() => setSelectedDate(isSelected ? null : key)}
                  className={`h-24 rounded-lg p-1.5 cursor-pointer border transition-all overflow-hidden ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500/10'
                      : isToday
                        ? 'border-amber-500/50 bg-gray-800'
                        : shootDay
                          ? 'border-gray-600 bg-gray-800 hover:border-amber-500/40'
                          : isWeekend
                            ? 'border-gray-700/30 bg-gray-800/20 hover:bg-gray-800/40'
                            : 'border-gray-700/40 bg-gray-800/50 hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                        isToday
                          ? 'bg-amber-500 text-gray-900'
                          : isWeekend
                            ? 'text-gray-600'
                            : 'text-gray-300'
                      }`}
                    >
                      {day}
                    </span>
                    {shootDay && (
                      <span className="text-xs font-bold text-amber-400 bg-amber-500/15 px-1.5 py-0.5 rounded">
                        D{shootDay.dayNumber}
                      </span>
                    )}
                  </div>

                  {shootDay && (
                    <div className="flex flex-col gap-0.5 overflow-hidden">
                      {shootDay.breakdownIds.slice(0, 3).map(bId => {
                        const bd = project.breakdowns.find(b => b.id === bId)
                        if (!bd) return null
                        const colors = getStripColors(bd.intExt, bd.dayNight)
                        return (
                          <div
                            key={bId}
                            className="flex items-center gap-1 px-1 py-0.5 rounded text-xs truncate"
                            style={{ backgroundColor: colors.bg, color: colors.text }}
                          >
                            <span className="font-black flex-shrink-0">{bd.sceneNumber}</span>
                            <span className="truncate opacity-80 text-xs">{bd.setName}</span>
                          </div>
                        )
                      })}
                      {shootDay.breakdownIds.length > 3 && (
                        <div className="text-xs text-gray-400 px-1">
                          +{shootDay.breakdownIds.length - 3} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Side panel */}
        <div className="w-72 flex-shrink-0 border-l border-gray-700 bg-gray-800 flex flex-col overflow-hidden">
          {selectedDate && selectedDay ? (
            <>
              <div className="px-4 py-3 border-b border-gray-700">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-amber-400 font-bold text-sm">Day {selectedDay.dayNumber}</span>
                  <span className="text-gray-500 text-xs">—</span>
                  <span className="text-gray-300 text-sm">
                    {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'short', month: 'short', day: 'numeric',
                    })}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {selectedBreakdowns.length} scene{selectedBreakdowns.length !== 1 ? 's' : ''} scheduled
                </p>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {selectedBreakdowns.length === 0 ? (
                  <p className="text-gray-500 text-xs text-center py-4">No scenes assigned to this day.</p>
                ) : selectedBreakdowns.map(bd => {
                  const colors = getStripColors(bd.intExt, bd.dayNight)
                  const castCount = project.elements.filter(
                    e => bd.elements.includes(e.id) && e.category === 'Cast'
                  ).length
                  return (
                    <div key={bd.id} className="rounded-lg overflow-hidden border border-gray-700">
                      <div
                        className="px-3 py-2 flex items-center gap-2"
                        style={{ backgroundColor: colors.bg, color: colors.text }}
                      >
                        <span className="font-black text-sm">{bd.sceneNumber}</span>
                        <span className="text-xs font-semibold opacity-85">{bd.intExt}</span>
                        <span className="text-xs opacity-70">{bd.dayNight}</span>
                        <span className="ml-auto font-mono text-xs opacity-70">{bd.pageCount}</span>
                      </div>
                      <div className="px-3 py-2 bg-gray-700/50">
                        <p className="text-white text-sm font-medium truncate">{bd.setName}</p>
                        {bd.location && (
                          <p className="text-gray-400 text-xs truncate mt-0.5">{bd.location}</p>
                        )}
                        {bd.description && (
                          <p className="text-gray-300 text-xs mt-1 line-clamp-2">{bd.description}</p>
                        )}
                        {castCount > 0 && (
                          <p className="text-red-400 text-xs mt-1.5 font-medium">{castCount} cast member{castCount !== 1 ? 's' : ''}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-500 px-6">
              <svg className="w-10 h-10 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-center">
                {shootingDays.some(d => d.date)
                  ? 'Click a highlighted day to see the shooting schedule.'
                  : 'Set a Shoot Start Date in the Strip Board to assign calendar dates.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
