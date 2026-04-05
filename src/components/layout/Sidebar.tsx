
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useScheduling } from '../../stores/schedulingStore';

const FilmSlateIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="7" width="20" height="15" rx="2"/><path d="M17 2L12 7 7 2"/>
    <path d="M2 7l5-5M7 7l5-5M12 7l5-5M17 7l5-5"/>
  </svg>
);

const schedulingLinks = [
  { to: '/scheduling/stripboard', label: 'Strip Board' },
  { to: '/scheduling/breakdowns', label: 'Breakdowns' },
  { to: '/scheduling/elements', label: 'Elements' },
  { to: '/scheduling/extras', label: 'Extras' },
  { to: '/scheduling/wardrobe', label: 'Wardrobe' },
  { to: '/scheduling/sets', label: 'Sets' },
  { to: '/scheduling/script', label: 'Script' },
  { to: '/scheduling/dood', label: 'Day Out of Days' },
  { to: '/scheduling/calendar', label: 'Calendar' },
  { to: '/scheduling/reports', label: 'Reports' },
];

const budgetingLinks = [
  { to: '/budgeting/topsheet', label: 'Top Sheet' },
  { to: '/budgeting/accounts', label: 'Accounts' },
  { to: '/budgeting/globals', label: 'Globals' },
  { to: '/budgeting/fringes', label: 'Fringes' },
  { to: '/budgeting/actuals', label: 'Actuals Tracker' },
  { to: '/budgeting/reports', label: 'Reports' },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state: schedState } = useScheduling();
  const isScheduling = location.pathname.startsWith('/scheduling');
  const isBudgeting = location.pathname.startsWith('/budgeting');
  const navLinks = isScheduling ? schedulingLinks : budgetingLinks;

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
      isActive ? 'bg-amber-500 text-gray-900 font-semibold' : 'text-gray-400 hover:text-gray-100 hover:bg-gray-700'
    }`;

  return (
    <aside className="w-56 bg-gray-900 border-r border-gray-700 flex flex-col flex-shrink-0 no-print">
      <div className="p-4 border-b border-gray-700 flex items-center gap-2">
        <div className="text-amber-500"><FilmSlateIcon /></div>
        <div>
          <div className="text-gray-100 font-bold text-sm leading-tight">Movie Magic</div>
          <div className="text-gray-500 text-xs">Production Suite</div>
        </div>
      </div>

      <div className="p-3 border-b border-gray-700">
        <div className="flex rounded-lg overflow-hidden border border-gray-700">
          <button onClick={() => navigate('/scheduling/stripboard')}
            className={`flex-1 py-1.5 text-xs font-semibold transition-colors ${isScheduling ? 'bg-amber-500 text-gray-900' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}>
            Scheduling
          </button>
          <button onClick={() => navigate('/budgeting/topsheet')}
            className={`flex-1 py-1.5 text-xs font-semibold transition-colors ${isBudgeting ? 'bg-amber-500 text-gray-900' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}>
            Budgeting
          </button>
        </div>
      </div>

      <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
        {navLinks.map(link => (
          <NavLink key={link.to} to={link.to} className={navLinkClass}>{link.label}</NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-700 text-xs text-gray-600">
        {schedState.project && (
          <div className="space-y-1">
            <div className="text-gray-500 font-medium">{schedState.project.name}</div>
            <div>Scenes: {schedState.project.breakdowns.length}</div>
            <div>Created: {new Date(schedState.project.createdAt).toLocaleDateString()}</div>
          </div>
        )}
        <div className="mt-2 text-gray-700">v1.0.0</div>
      </div>
    </aside>
  );
}
