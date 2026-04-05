import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useScheduling } from '../../stores/schedulingStore'
import { getCategoryColor, getCategoryBgHex } from '../../utils/colors'
import type { Element, ElementCategory } from '../../types/scheduling'

const ALL_CATEGORIES: ElementCategory[] = [
  'Cast', 'Extras', 'Stunts', 'Vehicles', 'Props',
  'Wardrobe', 'Makeup/Hair', 'Livestock/Animals',
  'Sound Effects/Music', 'Special Effects', 'Special Equipment',
  'Art Department', 'Set Dressing', 'Greenery',
  'Visual Effects', 'Mechanical Effects', 'Miscellaneous',
  'Notes', 'Security',
]

interface EditingState {
  id: string
  name: string
  notes: string
}

interface AddingState {
  category: ElementCategory
  name: string
  notes: string
}

export default function ElementManager() {
  const { state, dispatch } = useScheduling()
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<EditingState | null>(null)
  const [adding, setAdding] = useState<AddingState | null>(null)
  const [collapsed, setCollapsed] = useState<Set<ElementCategory>>(new Set())
  const [globalAddCategory, setGlobalAddCategory] = useState<ElementCategory>('Cast')
  const [showGlobalAdd, setShowGlobalAdd] = useState(false)

  const project = state.project
  if (!project) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        No project loaded.
      </div>
    )
  }

  const allElements = project.elements
  const allBreakdowns = project.breakdowns

  // Count which scenes each element appears in
  function sceneCount(elementId: string): number {
    return allBreakdowns.filter(b => b.elements.includes(elementId)).length
  }

  function toggleCollapse(cat: ElementCategory) {
    setCollapsed(prev => {
      const next = new Set(prev)
      next.has(cat) ? next.delete(cat) : next.add(cat)
      return next
    })
  }

  function startAdding(category: ElementCategory) {
    setAdding({ category, name: '', notes: '' })
    setEditing(null)
  }

  function commitAdd() {
    if (!adding || !adding.name.trim()) {
      setAdding(null)
      return
    }
    const el: Element = {
      id: uuidv4(),
      category: adding.category,
      name: adding.name.trim(),
      notes: adding.notes.trim() || undefined,
    }
    dispatch({ type: 'ADD_ELEMENT', payload: el })
    setAdding(null)
  }

  function startEditing(el: Element) {
    setEditing({ id: el.id, name: el.name, notes: el.notes ?? '' })
    setAdding(null)
  }

  function commitEdit() {
    if (!editing) return
    const el = allElements.find(e => e.id === editing.id)
    if (!el) { setEditing(null); return }
    if (!editing.name.trim()) { setEditing(null); return }
    dispatch({
      type: 'UPDATE_ELEMENT',
      payload: { ...el, name: editing.name.trim(), notes: editing.notes.trim() || undefined },
    })
    setEditing(null)
  }

  function handleDelete(id: string) {
    const uses = sceneCount(id)
    const msg = uses > 0
      ? `This element appears in ${uses} scene(s). Delete anyway?`
      : 'Delete this element?'
    if (!window.confirm(msg)) return
    dispatch({ type: 'DELETE_ELEMENT', payload: id })
    if (editing?.id === id) setEditing(null)
  }

  function handleGlobalAdd() {
    const el: Element = {
      id: uuidv4(),
      category: globalAddCategory,
      name: '',
      notes: undefined,
    }
    dispatch({ type: 'ADD_ELEMENT', payload: el })
    setShowGlobalAdd(false)
    // open editor for the just-created element
    setEditing({ id: el.id, name: '', notes: '' })
  }

  const q = search.toLowerCase()

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-800 border-b border-gray-700">
        <div>
          <h1 className="text-xl font-bold text-white">Element Manager</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {allElements.length} elements across {ALL_CATEGORIES.filter(c => allElements.some(e => e.category === c)).length} categories
          </p>
        </div>
        <div className="flex items-center gap-2">
          {showGlobalAdd ? (
            <div className="flex items-center gap-2">
              <select
                value={globalAddCategory}
                onChange={e => setGlobalAddCategory(e.target.value as ElementCategory)}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
              >
                {ALL_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <button
                onClick={handleGlobalAdd}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-gray-900 font-semibold rounded-lg text-sm"
              >
                Add
              </button>
              <button
                onClick={() => setShowGlobalAdd(false)}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowGlobalAdd(true)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-gray-900 font-semibold rounded-lg text-sm transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Element
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="px-6 py-3 bg-gray-800 border-b border-gray-700">
        <div className="relative max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search elements..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white
              placeholder-gray-400 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Category sections */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {ALL_CATEGORIES.map(cat => {
          const catElements = allElements.filter(e => {
            if (e.category !== cat) return false
            if (!search) return true
            return e.name.toLowerCase().includes(q) || (e.notes?.toLowerCase().includes(q) ?? false)
          })

          // Don't show empty categories unless we're adding to them or no search
          const isAddingHere = adding?.category === cat
          if (catElements.length === 0 && !isAddingHere && search) return null
          if (catElements.length === 0 && !isAddingHere && !search) {
            // show collapsed placeholder
          }

          const isCollapsed = collapsed.has(cat)
          const hexColor = getCategoryBgHex(cat)
          const twColor = getCategoryColor(cat)

          return (
            <div key={cat} className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
              {/* Category header */}
              <div
                className="flex items-center justify-between px-4 py-2.5 cursor-pointer select-none"
                style={{ backgroundColor: hexColor + '22' }}
                onClick={() => toggleCollapse(cat)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: hexColor }}
                  />
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${twColor}`}>{cat}</span>
                  <span className="text-xs text-gray-400 font-medium">
                    {catElements.length} element{catElements.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={e => { e.stopPropagation(); startAdding(cat) }}
                    className="flex items-center gap-1 px-2.5 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add
                  </button>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Elements */}
              {!isCollapsed && (
                <div className="divide-y divide-gray-700/50">
                  {/* Inline add form */}
                  {isAddingHere && (
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-700/50">
                      <input
                        autoFocus
                        type="text"
                        placeholder="Element name..."
                        value={adding!.name}
                        onChange={e => setAdding(prev => prev ? { ...prev, name: e.target.value } : null)}
                        onKeyDown={e => { if (e.key === 'Enter') commitAdd(); if (e.key === 'Escape') setAdding(null) }}
                        className="flex-1 px-3 py-1.5 bg-gray-600 border border-gray-500 rounded text-white text-sm
                          placeholder-gray-400 focus:outline-none focus:border-amber-500"
                      />
                      <input
                        type="text"
                        placeholder="Notes (optional)"
                        value={adding!.notes}
                        onChange={e => setAdding(prev => prev ? { ...prev, notes: e.target.value } : null)}
                        onKeyDown={e => { if (e.key === 'Enter') commitAdd(); if (e.key === 'Escape') setAdding(null) }}
                        className="w-48 px-3 py-1.5 bg-gray-600 border border-gray-500 rounded text-white text-sm
                          placeholder-gray-400 focus:outline-none focus:border-amber-500"
                      />
                      <button
                        onClick={commitAdd}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-gray-900 text-xs font-semibold rounded transition-colors"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => setAdding(null)}
                        className="px-3 py-1.5 bg-gray-600 hover:bg-gray-500 text-gray-300 text-xs rounded transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {catElements.length === 0 && !isAddingHere && (
                    <div className="px-4 py-3 text-xs text-gray-500 italic">
                      No elements. Click &ldquo;Add&rdquo; to create one.
                    </div>
                  )}

                  {catElements.map(el => {
                    const isEditingThis = editing?.id === el.id
                    const uses = sceneCount(el.id)

                    if (isEditingThis) {
                      return (
                        <div key={el.id} className="flex items-center gap-2 px-4 py-2.5 bg-gray-700/60">
                          <input
                            autoFocus
                            type="text"
                            value={editing!.name}
                            onChange={e => setEditing(prev => prev ? { ...prev, name: e.target.value } : null)}
                            onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditing(null) }}
                            className="flex-1 px-3 py-1.5 bg-gray-600 border border-amber-500 rounded text-white text-sm
                              focus:outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Notes"
                            value={editing!.notes}
                            onChange={e => setEditing(prev => prev ? { ...prev, notes: e.target.value } : null)}
                            onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditing(null) }}
                            className="w-48 px-3 py-1.5 bg-gray-600 border border-gray-500 rounded text-white text-sm
                              placeholder-gray-400 focus:outline-none focus:border-amber-500"
                          />
                          <button
                            onClick={commitEdit}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-gray-900 text-xs font-semibold rounded"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditing(null)}
                            className="px-2 py-1.5 text-gray-400 hover:text-white text-xs"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleDelete(el.id)}
                            className="px-2 py-1.5 text-red-400 hover:text-red-300 text-xs"
                          >
                            Delete
                          </button>
                        </div>
                      )
                    }

                    return (
                      <div
                        key={el.id}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-700/40 group transition-colors"
                      >
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: hexColor }}
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-white text-sm font-medium">{el.name}</span>
                          {el.notes && (
                            <span className="ml-2 text-gray-500 text-xs">{el.notes}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {uses > 0 && (
                            <span className="text-xs px-2 py-0.5 bg-amber-500/15 text-amber-400 rounded-full font-medium">
                              {uses} scene{uses !== 1 ? 's' : ''}
                            </span>
                          )}
                          <button
                            onClick={() => startEditing(el)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-white transition-all rounded"
                            title="Edit"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(el.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 transition-all rounded"
                            title="Delete"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
