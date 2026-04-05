import { NavLink } from 'react-router-dom'

const FilmSlateIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
    <path d="M17 2L12 7 7 2" />
    <path d="M2 7l5-5M7 7l5-5M12 7l5-5M17 7l5-5" />
  </svg>
)

const DollarSignIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
)

interface NavItem {
  to: string
  label: string
  icon: string
  end?: boolean
}

const schedulingNav: NavItem[] = [
  { to: '/scheduling/breakdown', label: 'Breakdowns', icon: '📋' },
  { to: '/scheduling/stripboard', label: 'Strip Board', icon: '🎬' },
  { to: '/scheduling/elements', label: 'Elements', icon: '🎭' },
  { to: '/scheduling/dood', label: 'Day Out of Days', icon: '📅' },
  { to: '/scheduling/calendar', label: 'Calendar', icon: '🗓️' },
  { to: '/scheduling/reports', label: 'Reports', icon: '📄' },
]

const budgetingNav: NavItem[] = [
  { to: '/budgeting', label: 'Top Sheet', icon: '📊', end: true },
  { to: '/budgeting/accounts', label: 'Accounts', icon: '📁' },
  { to: '/budgeting/globals', label: 'Globals', icon: '⚙️' },
  { to: '/budgeting/fringes', label: 'Fringes', icon: '📐' },
  { to: '/budgeting/reports', label: 'Reports', icon: '📈' },
  { to: '/budgeting/actuals', label: 'Actuals', icon: '💰' },
]

function NavSection({
  title,
  icon,
  items,
}: {
  title: string
  icon: React.ReactNode
  items: NavItem[]
}) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-1.5 px-3 mb-1.5">
        <span className="text-amber-500/70">{icon}</span>
        <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
          {title}
        </span>
      </div>
      <ul className="flex flex-col gap-0.5">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                [
                  'flex items-center gap-2.5 px-3 py-1.5 text-sm transition-colors rounded-r-sm',
                  isActive
                    ? 'bg-amber-500/20 text-amber-400 border-l-2 border-amber-500 pl-[10px]'
                    : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800 border-l-2 border-transparent pl-[10px]',
                ].join(' ')
              }
            >
              <span className="text-base leading-none">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Sidebar() {
  const handleResetDemoData = () => {
    localStorage.clear()
    window.location.reload()
  }

  return (
    <aside className="w-56 bg-gray-900 border-r border-gray-700 flex flex-col flex-shrink-0 overflow-hidden">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-gray-700 flex items-center gap-3">
        <span className="text-amber-500">
          <FilmSlateIcon />
        </span>
        <div className="min-w-0">
          <div className="text-amber-500 font-extrabold text-sm tracking-widest uppercase leading-tight">
            Movie Magic
          </div>
          <div className="text-gray-500 text-xs tracking-wide">Production Suite</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <NavSection
          title="Scheduling"
          icon={<FilmSlateIcon />}
          items={schedulingNav}
        />
        <div className="border-t border-gray-800 my-3 mx-3" />
        <NavSection
          title="Budgeting"
          icon={<DollarSignIcon />}
          items={budgetingNav}
        />
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-700 p-3">
        <button
          onClick={handleResetDemoData}
          className="w-full text-xs text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors px-2 py-1.5 rounded text-left"
          title="Clears all localStorage data and reloads the app"
        >
          Reset Demo Data
        </button>
      </div>
    </aside>
  )
}
