import { useState, useRef, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { v4 as uuidv4 } from 'uuid'
import { useNavigate } from 'react-router-dom'
import { useScheduling } from '../../stores/schedulingStore'
import { getStripColors } from '../../utils/colors'
import type { StripBoardItem, BreakdownSheet, Element } from '../../types/scheduling'

// ---------- helpers ----------

function formatDayLabel(dayNumber: number, shootStart?: string): string {
  const base = `DAY ${dayNumber}`
  if (!shootStart) return base
  try {
    const start = new Date(shootStart + 'T00:00:00')
    let workdaysAdded = 0
    const d = new Date(start)
    while (workdaysAdded < dayNumber - 1) {
      d.setDate(d.getDate() + 1)
      const dow = d.getDay()
      if (dow !== 0 && dow !== 6) workdaysAdded++
    }
    const formatted = d.toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    })
    return `DAY ${dayNumber}  —  ${formatted}`
  } catch {
    return base
  }
}

function parsePageCount(pc: string): number {
  if (!pc) return 0
  const full = pc.match(/^(\d+)\s+(\d+)\/8$/)
  if (full) return parseInt(full[1]) + parseInt(full[2]) / 8
  const eighths = pc.match(/^(\d+)\/8$/)
  if (eighths) return parseInt(eighths[1]) / 8
  const whole = pc.match(/^(\d+)\s+0\/8$/)
  if (whole) return parseInt(whole[1])
  const n = parseFloat(pc)
  return isNaN(n) ? 0 : n
}

function GripIcon({ color = 'currentColor' }: { color?: string }) {
  return (
    <svg width="10" height="14" viewBox="0 0 10 14" fill={color} opacity={0.45}>
      <circle cx="3" cy="2" r="1.2" /><circle cx="7" cy="2" r="1.2" />
      <circle cx="3" cy="7" r="1.2" /><circle cx="7" cy="7" r="1.2" />
      <circle cx="3" cy="12" r="1.2" /><circle cx="7" cy="12" r="1.2" />
    </svg>
  )
}

// ---------- Scene Strip ----------
interface SceneStripProps {
  id: string
  breakdown: BreakdownSheet
  elements: Element[]
  onContextMenu: (e: React.MouseEvent) => void
  onClick: () => void
  overlay?: boolean
}

function SceneStrip({ id, breakdown, elements, onContextMenu, onClick, overlay }: SceneStripProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const colors = getStripColors(breakdown.intExt, breakdown.dayNight)
  const castEls = elements.filter(e => breakdown.elements.includes(e.id) && e.category === 'Cast')

  const baseStyle = { backgroundColor: colors.bg, color: colors.text }
  const sortableStyle = overlay
    ? { ...baseStyle, opacity: 0.92, boxShadow: '0 4px 24px rgba(0,0,0,0.5)' }
    : {
        ...baseStyle,
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.35 : 1,
      }

  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      style={sortableStyle}
      className="flex items-center h-7 text-xs border-b border-black/10 select-none cursor-pointer hover:brightness-95 transition-all"
      onClick={overlay ? undefined : onClick}
      onContextMenu={overlay ? undefined : onContextMenu}
    >
      <div
        {...(overlay ? {} : { ...attributes, ...listeners })}
        className="flex items-center justify-center w-6 h-full flex-shrink-0 cursor-grab active:cursor-grabbing hover:bg-black/10 flex-shrink-0"
        onClick={overlay ? undefined : e => e.stopPropagation()}
      >
        <GripIcon color={colors.text} />
      </div>

      {/* Left color accent */}
      <div
        className="w-1 self-stretch flex-shrink-0"
        style={{ backgroundColor: 'rgba(0,0,0,0.15)' }}
      />

      <div className="w-10 flex-shrink-0 px-1 font-black text-center truncate">
        {breakdown.sceneNumber || '?'}
      </div>

      <div className="w-16 flex-shrink-0 px-1 text-center font-semibold truncate opacity-90">
        {breakdown.intExt}
      </div>

      <div className="w-12 flex-shrink-0 px-1 text-center font-semibold opacity-90">
        {breakdown.dayNight}
      </div>

      <div className="flex-1 min-w-0 px-1 truncate" title={`${breakdown.setName} — ${breakdown.location}`}>
        <span className="font-semibold">{breakdown.setName}</span>
        {breakdown.location && (
          <span className="opacity-55 ml-1">{breakdown.location}</span>
        )}
      </div>

      <div className="flex-1 min-w-0 px-1 truncate opacity-70" title={breakdown.description}>
        {breakdown.description}
      </div>

      <div className="w-12 flex-shrink-0 px-1 text-center font-mono">
        {breakdown.pageCount}
      </div>

      <div className="w-24 flex-shrink-0 px-1 flex gap-0.5 flex-wrap overflow-hidden items-center">
        {castEls.slice(0, 6).map(el => {
          const num = el.name.match(/\((\d+)\)/)?.[1] ?? el.name.slice(0, 2)
          return (
            <span
              key={el.id}
              title={el.name}
              className="px-1 rounded font-bold"
              style={{
                backgroundColor: 'rgba(0,0,0,0.2)',
                color: colors.text,
                fontSize: '9px',
              }}
            >
              {num}
            </span>
          )
        })}
        {castEls.length > 6 && (
          <span style={{ fontSize: '9px', color: colors.text, opacity: 0.6 }}>
            +{castEls.length - 6}
          </span>
        )}
      </div>
    </div>
  )
}

// ---------- Day Break Strip ----------
interface DayBreakStripProps {
  id: string
  dayNumber: number
  label?: string
  shootStart?: string
  onContextMenu: (e: React.MouseEvent) => void
  overlay?: boolean
}

function DayBreakStrip({ id, dayNumber, label, shootStart, onContextMenu, overlay }: DayBreakStripProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = overlay
    ? { opacity: 0.92, boxShadow: '0 4px 24px rgba(0,0,0,0.5)' }
    : { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.35 : 1 }
  const displayLabel = label || formatDayLabel(dayNumber, shootStart)

  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      style={style}
      className="flex items-center h-7 bg-gray-700 border-b border-gray-600 select-none"
      onContextMenu={overlay ? undefined : onContextMenu}
    >
      <div
        {...(overlay ? {} : { ...attributes, ...listeners })}
        className="flex items-center justify-center w-6 h-full flex-shrink-0 cursor-grab active:cursor-grabbing hover:bg-gray-600"
      >
        <GripIcon color="#9ca3af" />
      </div>
      <div className="flex-1 text-center text-xs font-black tracking-widest uppercase text-amber-400 px-2">
        {displayLabel}
      </div>
    </div>
  )
}

// ---------- Banner Strip ----------
interface BannerStripProps {
  id: string
  text: string
  color?: string
  onContextMenu: (e: React.MouseEvent) => void
  overlay?: boolean
}

function BannerStrip({ id, text, color = '#78350f', onContextMenu, overlay }: BannerStripProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = overlay
    ? { backgroundColor: color, opacity: 0.92, boxShadow: '0 4px 24px rgba(0,0,0,0.5)' }
    : {
        backgroundColor: color,
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.35 : 1,
      }

  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      style={style}
      className="flex items-center h-6 border-b border-black/20 select-none"
      onContextMenu={overlay ? undefined : onContextMenu}
    >
      <div
        {...(overlay ? {} : { ...attributes, ...listeners })}
        className="flex items-center justify-center w-6 h-full flex-shrink-0 cursor-grab active:cursor-grabbing hover:bg-black/15"
      >
        <GripIcon color="#fde68a" />
      </div>
      <div className="flex-1 text-center text-xs font-bold text-amber-100 uppercase tracking-widest px-2">
        {text}
      </div>
    </div>
  )
}

// ---------- Context menu type ----------
interface ContextMenuState {
  x: number
  y: number
  itemId: string
  itemIndex: number
}

// ---------- Main component ----------
export default function StripBoard() {
  const { state, dispatch } = useScheduling()
  const navigate = useNavigate()
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  useEffect(() => {
    function close() { setContextMenu(null) }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [])

  if (!state.project) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        No project loaded.
      </div>
    )
  }

  const { project } = state
  const stripBoard = project.stripBoard

  function getItemId(item: StripBoardItem): string {
    if (item.type === 'scene') return item.breakdownId ?? uuidv4()
    return item.id ?? uuidv4()
  }

  const ids = stripBoard.map(getItemId)

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = ids.indexOf(String(active.id))
    const newIndex = ids.indexOf(String(over.id))
    if (oldIndex === -1 || newIndex === -1) return
    dispatch({ type: 'REORDER_STRIP_BOARD', payload: arrayMove(stripBoard, oldIndex, newIndex) })
  }

  const handleContextMenu = (e: React.MouseEvent, itemId: string, index: number) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ x: e.clientX, y: e.clientY, itemId, itemIndex: index })
  }

  const handleContextAction = (action: string) => {
    if (!contextMenu) return
    const { itemIndex, itemId } = contextMenu
    switch (action) {
      case 'insertDayBreak': {
        const n = stripBoard.filter(i => i.type === 'dayBreak').length + 1
        dispatch({ type: 'ADD_DAY_BREAK', payload: { afterIndex: itemIndex, dayNumber: n } })
        break
      }
      case 'insertBanner': {
        const text = window.prompt('Banner text:') || 'BANNER'
        dispatch({ type: 'ADD_BANNER', payload: { afterIndex: itemIndex, text, color: '#78350f' } })
        break
      }
      case 'delete': {
        const item = stripBoard[itemIndex]
        if (item.type === 'scene') {
          dispatch({ type: 'DELETE_BREAKDOWN', payload: item.breakdownId! })
        } else {
          dispatch({ type: 'DELETE_STRIP_ITEM', payload: itemId })
        }
        break
      }
      case 'moveTop': {
        const nb = [...stripBoard]
        const [m] = nb.splice(itemIndex, 1)
        nb.unshift(m)
        dispatch({ type: 'REORDER_STRIP_BOARD', payload: nb })
        break
      }
      case 'moveBottom': {
        const nb = [...stripBoard]
        const [m] = nb.splice(itemIndex, 1)
        nb.push(m)
        dispatch({ type: 'REORDER_STRIP_BOARD', payload: nb })
        break
      }
    }
    setContextMenu(null)
  }

  const scenes = stripBoard.filter(i => i.type === 'scene')
  const totalPages = scenes.reduce((sum, item) => {
    const bd = project.breakdowns.find(b => b.id === item.breakdownId)
    return sum + (bd ? parsePageCount(bd.pageCount) : 0)
  }, 0)
  const totalDays = stripBoard.filter(i => i.type === 'dayBreak').length

  const activeItem = activeId ? stripBoard.find(i => getItemId(i) === activeId) ?? null : null
  const activeBreakdown = activeItem?.type === 'scene'
    ? project.breakdowns.find(b => b.id === activeItem.breakdownId)
    : undefined

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-gray-800">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-2 bg-gray-900 border-b border-gray-700 flex-shrink-0">
        <button
          onClick={() => {
            const n = stripBoard.filter(i => i.type === 'dayBreak').length + 1
            dispatch({ type: 'ADD_DAY_BREAK', payload: { afterIndex: stripBoard.length - 1, dayNumber: n } })
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-amber-400 text-xs font-semibold rounded transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Day Break
        </button>

        <button
          onClick={() => navigate('/scheduling/breakdown/new')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-gray-900 text-xs font-bold rounded transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Scene
        </button>

        <div className="flex items-center gap-2 ml-2">
          <label className="text-xs text-gray-400 font-semibold whitespace-nowrap">Shoot Start:</label>
          <input
            type="date"
            value={project.shootStartDate ?? ''}
            onChange={e =>
              dispatch({ type: 'SET_PROJECT', payload: { ...project, shootStartDate: e.target.value } })
            }
            className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs text-gray-200 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-4 ml-auto text-xs text-gray-400">
          <span><span className="text-gray-200 font-bold">{scenes.length}</span> scenes</span>
          <span><span className="text-gray-200 font-bold">{totalPages.toFixed(2)}</span> pages</span>
          <span><span className="text-amber-400 font-bold">{totalDays}</span> day{totalDays !== 1 ? 's' : ''}</span>
          {totalDays > 0 && (
            <span>avg <span className="text-gray-200 font-bold">{(totalPages / totalDays).toFixed(2)}</span> pp/day</span>
          )}
        </div>
      </div>

      {/* Column headers */}
      <div className="flex items-center h-6 bg-gray-900 border-b border-gray-600 text-xs text-gray-500 font-semibold flex-shrink-0">
        <div className="w-6 flex-shrink-0" />
        <div className="w-1 flex-shrink-0" />
        <div className="w-10 flex-shrink-0 px-1 text-center">Sc#</div>
        <div className="w-16 flex-shrink-0 px-1 text-center">INT/EXT</div>
        <div className="w-12 flex-shrink-0 px-1 text-center">D/N</div>
        <div className="flex-1 px-1">Set / Location</div>
        <div className="flex-1 px-1">Description</div>
        <div className="w-12 flex-shrink-0 px-1 text-center">Pages</div>
        <div className="w-24 flex-shrink-0 px-1">Cast</div>
      </div>

      {/* Strip list */}
      <div className="flex-1 overflow-y-auto">
        {stripBoard.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-500">
            <svg className="w-12 h-12 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <p className="text-sm">No strips yet.</p>
            <button
              onClick={() => navigate('/scheduling/breakdown/new')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-gray-900 text-xs font-bold rounded"
            >
              Add First Scene
            </button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={ids} strategy={verticalListSortingStrategy}>
              {stripBoard.map((item, index) => {
                const itemId = getItemId(item)

                if (item.type === 'dayBreak') {
                  return (
                    <DayBreakStrip
                      key={itemId}
                      id={itemId}
                      dayNumber={item.dayNumber ?? 1}
                      label={item.label}
                      shootStart={project.shootStartDate}
                      onContextMenu={e => handleContextMenu(e, itemId, index)}
                    />
                  )
                }

                if (item.type === 'banner') {
                  return (
                    <BannerStrip
                      key={itemId}
                      id={itemId}
                      text={item.text ?? 'BANNER'}
                      color={item.color}
                      onContextMenu={e => handleContextMenu(e, itemId, index)}
                    />
                  )
                }

                if (item.type === 'scene') {
                  const breakdown = project.breakdowns.find(b => b.id === item.breakdownId)
                  if (!breakdown) return null
                  return (
                    <SceneStrip
                      key={itemId}
                      id={itemId}
                      breakdown={breakdown}
                      elements={project.elements}
                      onClick={() => navigate(`/scheduling/breakdown/${breakdown.id}`)}
                      onContextMenu={e => handleContextMenu(e, itemId, index)}
                    />
                  )
                }

                return null
              })}
            </SortableContext>

            <DragOverlay dropAnimation={null}>
              {activeItem?.type === 'scene' && activeBreakdown ? (
                <SceneStrip
                  id={activeId!}
                  breakdown={activeBreakdown}
                  elements={project.elements}
                  onClick={() => {}}
                  onContextMenu={() => {}}
                  overlay
                />
              ) : activeItem?.type === 'dayBreak' ? (
                <DayBreakStrip
                  id={activeId!}
                  dayNumber={activeItem.dayNumber ?? 1}
                  label={activeItem.label}
                  shootStart={project.shootStartDate}
                  onContextMenu={() => {}}
                  overlay
                />
              ) : activeItem?.type === 'banner' ? (
                <BannerStrip
                  id={activeId!}
                  text={activeItem.text ?? 'BANNER'}
                  color={activeItem.color}
                  onContextMenu={() => {}}
                  overlay
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {/* Summary footer */}
      <div className="h-7 bg-gray-900 border-t border-gray-700 flex items-center px-4 gap-6 text-xs text-gray-400 flex-shrink-0">
        <span>Total Scenes: <span className="text-gray-200 font-semibold">{scenes.length}</span></span>
        <span>Total Pages: <span className="text-gray-200 font-semibold">{totalPages.toFixed(2)}</span></span>
        <span>Shooting Days: <span className="text-amber-400 font-semibold">{totalDays}</span></span>
        {totalDays > 0 && (
          <span>
            Avg Pages/Day:{' '}
            <span className="text-gray-200 font-semibold">{(totalPages / totalDays).toFixed(2)}</span>
          </span>
        )}
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div
          ref={menuRef}
          className="fixed z-50 bg-gray-800 border border-gray-600 rounded-lg shadow-2xl py-1 min-w-[180px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={e => e.stopPropagation()}
        >
          {[
            { action: 'insertDayBreak', label: 'Insert Day Break After', danger: false },
            { action: 'insertBanner', label: 'Insert Banner After', danger: false },
            null,
            { action: 'moveTop', label: 'Move to Top', danger: false },
            { action: 'moveBottom', label: 'Move to Bottom', danger: false },
            null,
            { action: 'delete', label: 'Delete', danger: true },
          ].map((item, i) =>
            item === null ? (
              <div key={i} className="border-t border-gray-700 my-1" />
            ) : (
              <button
                key={item.action}
                onClick={() => handleContextAction(item.action)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700 transition-colors ${
                  item.danger ? 'text-red-400' : 'text-gray-300'
                }`}
              >
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  )
}
