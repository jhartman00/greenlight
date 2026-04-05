import { useLocation } from 'react-router-dom'
import { useScheduling } from '../../stores/schedulingStore'
import { useBudgeting } from '../../stores/budgetingStore'

const PAGE_TITLES: Record<string, string> = {
  '/scheduling/breakdown': 'Breakdown List',
  '/scheduling/stripboard': 'Strip Board',
  '/scheduling/elements': 'Element Manager',
  '/scheduling/dood': 'Day Out of Days',
  '/scheduling/calendar': 'Calendar',
  '/budgeting': 'Top Sheet',
  '/budgeting/accounts': 'Accounts',
  '/budgeting/globals': 'Globals',
  '/budgeting/fringes': 'Fringes',
  '/budgeting/reports': 'Budget Reports',
  '/budgeting/actuals': 'Actuals Tracker',
}

function deriveTitle(pathname: string): string {
  // Exact match first
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]

  // Check breakdown detail route: /scheduling/breakdown/:id
  if (/^\/scheduling\/breakdown\/.+/.test(pathname)) return 'Breakdown Sheet'

  // Check account detail route: /budgeting/account/:groupId/:accountId
  if (/^\/budgeting\/account\/.+/.test(pathname)) return 'Account Detail'

  // Fallback: capitalise path segments
  const segment = pathname.split('/').filter(Boolean).pop() ?? ''
  return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
}

function deriveSection(pathname: string): 'Scheduling' | 'Budgeting' | null {
  if (pathname.startsWith('/scheduling')) return 'Scheduling'
  if (pathname.startsWith('/budgeting')) return 'Budgeting'
  return null
}

export default function Header() {
  const location = useLocation()
  const { state: schedState } = useScheduling()
  const { state: budgetState } = useBudgeting()

  const section = deriveSection(location.pathname)
  const pageTitle = deriveTitle(location.pathname)

  const projectName =
    section === 'Scheduling'
      ? schedState.project?.name
      : section === 'Budgeting'
      ? budgetState.project?.name
      : undefined

  return (
    <header className="h-12 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4 flex-shrink-0">
      {/* Left: page title + section badge */}
      <div className="flex items-center gap-3 min-w-0">
        <h1 className="text-gray-100 text-sm font-semibold truncate">{pageTitle}</h1>
        {section && (
          <span className="hidden sm:inline-flex text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-400 font-medium uppercase tracking-wider flex-shrink-0">
            {section}
          </span>
        )}
      </div>

      {/* Right: project name + auto-save indicator */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {projectName && (
          <span className="hidden md:block text-xs text-gray-400 truncate max-w-[180px]" title={projectName}>
            {projectName}
          </span>
        )}
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
          Auto-saved
        </span>
      </div>
    </header>
  )
}
