import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useScheduling } from '../../stores/schedulingStore'
import { getStripColors, getCategoryColor } from '../../utils/colors'
import { v4 as uuidv4 } from 'uuid'
import type { BreakdownSheet as BreakdownSheetType, ElementCategory } from '../../types/scheduling'

const ALL_CATEGORIES: ElementCategory[] = [
  'Cast', 'Extras', 'Stunts', 'Vehicles', 'Props',
  'Wardrobe', 'Makeup/Hair', 'Livestock/Animals',
  'Sound Effects/Music', 'Special Effects', 'Special Equipment',
  'Art Department', 'Set Dressing', 'Greenery',
  'Visual Effects', 'Mechanical Effects', 'Miscellaneous',
  'Notes', 'Security',
]

const EMPTY: BreakdownSheetType = {
  id: '',
  sceneNumber: '',
  intExt: 'INT',
  dayNight: 'DAY',
  location: '',
  setName: '',
  description: '',
  scriptPage: 1,
  pageCount: '1',
  elements: [],
  notes: '',
  estimatedTime: '',
}

export default function BreakdownSheet() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { state, dispatch } = useScheduling()
  const project = state.project
  const isNew = id === 'new'

  const existing = project?.breakdowns.find(b => b.id === id)

  const [form, setForm] = useState<BreakdownSheetType>(() => {
    if (isNew) return { ...EMPTY, id: uuidv4() }
    return existing ? { ...existing } : { ...EMPTY, id: id ?? uuidv4() }
  })
  const [saved, setSaved] = useState(false)
  const [elementSearch, setElementSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<ElementCategory | 'all'>('all')

  useEffect(() => {
    if (!isNew && existing) setForm({ ...existing })
  }, [id])

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        No project loaded.
      </div>
    )
  }

  const colors = getStripColors(form.intExt, form.dayNight)

  function set<K extends keyof BreakdownSheetType>(key: K, value: BreakdownSheetType[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function toggleElement(eid: string) {
    setForm(prev => ({
      ...prev,
      elements: prev.elements.includes(eid)
        ? prev.elements.filter(e => e !== eid)
        : [...prev.elements, eid],
    }))
  }

  function handleSave() {
    if (isNew) {
      dispatch({ type: 'ADD_BREAKDOWN', payload: form })
      navigate(`/scheduling/breakdown/${form.id}`, { replace: true })
    } else {
      dispatch({ type: 'UPDATE_BREAKDOWN', payload: form })
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleDelete() {
    if (!window.confirm('Delete this scene breakdown? This cannot be undone.')) return
    dispatch({ type: 'DELETE_BREAKDOWN', payload: form.id })
    navigate('/scheduling/breakdown')
  }

  const allElements = project.elements
  const categoriesWithElements = ALL_CATEGORIES.filter(cat =>
    allElements.some(e => e.category === cat)
  )

  const filteredElements = allElements.filter(el => {
    const matchSearch = !elementSearch || el.name.toLowerCase().includes(elementSearch.toLowerCase())
    const matchCat = activeCategory === 'all' || el.category === activeCategory
    return matchSearch && matchCat
  })

  const selectedObjs = form.elements
    .map(eid => allElements.find(e => e.id === eid))
    .filter(Boolean) as typeof allElements

  const groupedSelected = ALL_CATEGORIES.reduce<Record<string, typeof allElements>>((acc, cat) => {
    const items = selectedObjs.filter(e => e.category === cat)
    if (items.length > 0) acc[cat] = items
    return acc
  }, {})

  return (
    <div className="flex flex-col h-full bg-gray-900 overflow-hidden">
      {/* Strip color preview top bar */}
      <div
        className="flex items-center justify-between px-6 py-3 border-b border-gray-700 flex-shrink-0 transition-colors duration-200"
        style={{ backgroundColor: colors.bg, color: colors.text }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/scheduling/breakdown')}
            className="flex items-center gap-1.5 text-sm font-medium opacity-75 hover:opacity-100 transition-opacity"
            style={{ color: colors.text }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            All Scenes
          </button>
          <span className="opacity-30">|</span>
          <span className="font-bold text-base">
            {form.sceneNumber ? `Scene ${form.sceneNumber}` : isNew ? 'New Scene' : 'Scene'}
          </span>
          <span className="text-sm opacity-70 font-medium">{form.intExt} · {form.dayNight}</span>
          {form.setName && (
            <span className="text-sm opacity-60 truncate max-w-xs">{form.setName}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isNew && (
            <button
              onClick={handleDelete}
              className="px-3 py-1.5 rounded text-xs font-semibold bg-black/20 hover:bg-red-700/60 transition-colors"
              style={{ color: colors.text }}
            >
              Delete
            </button>
          )}
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded text-sm font-bold bg-black/25 hover:bg-black/40 transition-colors"
            style={{ color: colors.text }}
          >
            {saved ? '✓ Saved!' : isNew ? 'Create Scene' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left: form fields */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Scene Details</h2>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Scene #
              </label>
              <input
                type="text"
                value={form.sceneNumber}
                onChange={e => set('sceneNumber', e.target.value)}
                placeholder="1, 1A, 42B"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white
                  placeholder-gray-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Int / Ext
              </label>
              <select
                value={form.intExt}
                onChange={e => set('intExt', e.target.value as BreakdownSheetType['intExt'])}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white
                  text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              >
                <option value="INT">INT</option>
                <option value="EXT">EXT</option>
                <option value="INT/EXT">INT/EXT</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Day / Night
              </label>
              <select
                value={form.dayNight}
                onChange={e => set('dayNight', e.target.value as BreakdownSheetType['dayNight'])}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white
                  text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              >
                <option value="DAY">DAY</option>
                <option value="NIGHT">NIGHT</option>
                <option value="DAWN">DAWN</option>
                <option value="DUSK">DUSK</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Pages
              </label>
              <input
                type="text"
                value={form.pageCount}
                onChange={e => set('pageCount', e.target.value)}
                placeholder="1 4/8"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white
                  placeholder-gray-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Set Name
              </label>
              <input
                type="text"
                value={form.setName}
                onChange={e => set('setName', e.target.value)}
                placeholder="JOHN'S APARTMENT - LIVING ROOM"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white
                  placeholder-gray-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Location
              </label>
              <input
                type="text"
                value={form.location}
                onChange={e => set('location', e.target.value)}
                placeholder="123 Main St / Stage 4"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white
                  placeholder-gray-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={3}
              placeholder="Brief synopsis of what happens in this scene..."
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white
                placeholder-gray-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Script Page
              </label>
              <input
                type="number"
                min={1}
                value={form.scriptPage}
                onChange={e => set('scriptPage', parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white
                  text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Estimated Time
              </label>
              <input
                type="text"
                value={form.estimatedTime ?? ''}
                onChange={e => set('estimatedTime', e.target.value)}
                placeholder="2h 30m"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white
                  placeholder-gray-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              rows={3}
              placeholder="Special requirements, safety concerns, logistics..."
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white
                placeholder-gray-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none"
            />
          </div>

          {/* Selected elements grouped by category */}
          {Object.keys(groupedSelected).length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-white mb-3">
                Scene Elements
                <span className="ml-2 px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full font-normal">
                  {form.elements.length}
                </span>
              </h3>
              <div className="space-y-3">
                {(Object.entries(groupedSelected) as [ElementCategory, typeof allElements][]).map(([cat, els]) => (
                  <div key={cat}>
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold mb-2 ${getCategoryColor(cat)}`}>
                      {cat}
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {els.map(el => (
                        <button
                          key={el.id}
                          onClick={() => toggleElement(el.id)}
                          title="Click to remove"
                          className="flex items-center gap-1 px-2.5 py-1 bg-gray-700 hover:bg-red-900/40 rounded-full text-xs text-white transition-colors group"
                        >
                          {el.name}
                          <span className="text-gray-500 group-hover:text-red-400 transition-colors">×</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: element picker */}
        <div className="w-72 flex-shrink-0 border-l border-gray-700 bg-gray-800 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-700">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Add Elements</p>
            <input
              type="text"
              placeholder="Search elements..."
              value={elementSearch}
              onChange={e => setElementSearch(e.target.value)}
              className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-white
                placeholder-gray-500 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Category tabs */}
          <div className="flex flex-wrap gap-1 px-3 py-2 border-b border-gray-700">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                activeCategory === 'all'
                  ? 'bg-amber-500 text-gray-900'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              All
            </button>
            {categoriesWithElements.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(activeCategory === cat ? 'all' : cat)}
                className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                  activeCategory === cat
                    ? 'bg-amber-500 text-gray-900'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Element list */}
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {allElements.length === 0 ? (
              <p className="text-gray-500 text-xs text-center py-8">
                No elements yet. Add elements in the Element Manager.
              </p>
            ) : filteredElements.length === 0 ? (
              <p className="text-gray-500 text-xs text-center py-4">No matches.</p>
            ) : (
              filteredElements.map(el => {
                const isSelected = form.elements.includes(el.id)
                return (
                  <button
                    key={el.id}
                    onClick={() => toggleElement(el.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded text-left transition-colors text-sm ${
                      isSelected
                        ? 'bg-amber-500/15 border border-amber-500/30 text-white'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${getCategoryColor(el.category).split(' ')[0]}`} />
                    <span className="flex-1 truncate">{el.name}</span>
                    {isSelected && (
                      <svg className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                )
              })
            )}
          </div>

          <div className="px-4 py-2.5 border-t border-gray-700 text-xs text-gray-500">
            {form.elements.length} element{form.elements.length !== 1 ? 's' : ''} selected
          </div>
        </div>
      </div>
    </div>
  )
}
