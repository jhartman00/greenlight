
import { useState } from 'react';
import { NavLink, useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import { useScheduling } from '../../stores/schedulingStore';

const FilmSlateIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="7" width="20" height="15" rx="2"/><path d="M17 2L12 7 7 2"/>
    <path d="M2 7l5-5M7 7l5-5M12 7l5-5M17 7l5-5"/>
  </svg>
);

const ChevronLeftIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M15 18l-6-6 6-6"/>
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M9 18l6-6-6-6"/>
  </svg>
);

function abbrev(label: string): string {
  return label.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const { state: schedState } = useScheduling();
  const base = `/project/${projectId}`;
  const isScheduling = location.pathname.includes('/scheduling');
  const isBudgeting = location.pathname.includes('/budgeting');

  const schedulingLinks = [
    { to: `${base}/scheduling/stripboard`, label: 'Strip Board' },
    { to: `${base}/scheduling/breakdowns`, label: 'Breakdowns' },
    { to: `${base}/scheduling/elements`, label: 'Elements' },
    { to: `${base}/scheduling/cast`, label: 'Cast' },
    { to: `${base}/scheduling/extras`, label: 'Extras' },
    { to: `${base}/scheduling/wardrobe`, label: 'Wardrobe' },
    { to: `${base}/scheduling/sets`, label: 'Sets' },
    { to: `${base}/scheduling/script`, label: 'Script' },
    { to: `${base}/scheduling/dood`, label: 'Day Out of Days' },
    { to: `${base}/scheduling/calendar`, label: 'Calendar' },
    { to: `${base}/scheduling/reports`, label: 'Reports' },
  ];

  const budgetingLinks = [
    { to: `${base}/budgeting/topsheet`, label: 'Top Sheet' },
    { to: `${base}/budgeting/accounts`, label: 'Accounts' },
    { to: `${base}/budgeting/globals`, label: 'Globals' },
    { to: `${base}/budgeting/fringes`, label: 'Fringes' },
    { to: `${base}/budgeting/actuals`, label: 'Actuals Tracker' },
    { to: `${base}/budgeting/reports`, label: 'Reports' },
  ];

  const navLinks = isScheduling ? schedulingLinks : budgetingLinks;

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
      isActive ? 'bg-amber-500 text-gray-900 font-semibold' : 'text-gray-400 hover:text-gray-100 hover:bg-gray-700'
    }`;

  return (
    <aside
      className={`${collapsed ? 'w-14' : 'w-56'} bg-gray-900 border-r border-gray-700 flex flex-col flex-shrink-0 no-print transition-[width] duration-200 overflow-hidden`}
    >
      {/* Header */}
      <div className="px-2 py-3 border-b border-gray-700 flex items-center gap-2 flex-shrink-0">
        <Link to="/" className="text-amber-500 hover:text-amber-400 transition-colors flex-shrink-0 ml-1" title="All Projects">
          <FilmSlateIcon />
        </Link>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <div className="text-gray-100 font-bold text-sm leading-tight">Greenlight</div>
            {schedState.project && (
              <div className="text-gray-500 text-xs truncate" title={schedState.project.name}>
                {schedState.project.name}
              </div>
            )}
          </div>
        )}
        <button
          onClick={() => setCollapsed(v => !v)}
          className="flex-shrink-0 text-gray-500 hover:text-gray-300 transition-colors p-1 rounded hover:bg-gray-700 ml-auto"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </button>
      </div>

      {/* Mode toggle — expanded */}
      {!collapsed && (
        <div className="p-3 border-b border-gray-700 flex-shrink-0">
          <div className="flex rounded-lg overflow-hidden border border-gray-700">
            <button
              onClick={() => navigate(`${base}/scheduling/stripboard`)}
              className={`flex-1 py-1.5 text-xs font-semibold transition-colors ${isScheduling ? 'bg-amber-500 text-gray-900' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}
            >
              Scheduling
            </button>
            <button
              onClick={() => navigate(`${base}/budgeting/topsheet`)}
              className={`flex-1 py-1.5 text-xs font-semibold transition-colors ${isBudgeting ? 'bg-amber-500 text-gray-900' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}
            >
              Budgeting
            </button>
          </div>
        </div>
      )}

      {/* Mode toggle — collapsed */}
      {collapsed && (
        <div className="px-1.5 py-2 border-b border-gray-700 flex flex-col gap-1 flex-shrink-0">
          <button
            onClick={() => navigate(`${base}/scheduling/stripboard`)}
            title="Scheduling"
            className={`w-full py-1 text-xs font-bold rounded transition-colors ${isScheduling ? 'bg-amber-500 text-gray-900' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}
          >
            Sc
          </button>
          <button
            onClick={() => navigate(`${base}/budgeting/topsheet`)}
            title="Budgeting"
            className={`w-full py-1 text-xs font-bold rounded transition-colors ${isBudgeting ? 'bg-amber-500 text-gray-900' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}
          >
            Bu
          </button>
        </div>
      )}

      {/* Nav links */}
      <nav className="flex-1 p-2 flex flex-col gap-0.5 overflow-y-auto">
        {navLinks.map(link =>
          collapsed ? (
            <NavLink
              key={link.to}
              to={link.to}
              title={link.label}
              className={({ isActive }) =>
                `flex items-center justify-center h-8 rounded text-xs font-bold transition-colors ${
                  isActive ? 'bg-amber-500 text-gray-900' : 'text-gray-400 hover:text-gray-100 hover:bg-gray-700'
                }`
              }
            >
              {abbrev(link.label)}
            </NavLink>
          ) : (
            <NavLink key={link.to} to={link.to} className={navLinkClass}>
              {link.label}
            </NavLink>
          )
        )}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-3 border-t border-gray-700 text-xs text-gray-600 flex-shrink-0">
          {schedState.project && (
            <div className="space-y-1">
              <div>Scenes: {schedState.project.breakdowns.length}</div>
              <div>Created: {new Date(schedState.project.createdAt).toLocaleDateString()}</div>
            </div>
          )}
          <div className="mt-2 text-gray-700">v1.0.0</div>
        </div>
      )}
    </aside>
  );
}
