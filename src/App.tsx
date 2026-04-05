import type { ReactNode } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { SchedulingProvider, useScheduling } from './stores/schedulingStore';
import { BudgetingProvider } from './stores/budgetingStore';
import { ToastProvider } from './components/layout/Toast';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import ProjectSelector from './components/ProjectSelector';

import StripBoard from './components/scheduling/StripBoard';
import BreakdownList from './components/scheduling/BreakdownList';
import ElementManager from './components/scheduling/ElementManager';
import DayOutOfDays from './components/scheduling/DayOutOfDays';
import CalendarView from './components/scheduling/CalendarView';
import BreakdownSheetPanel from './components/scheduling/BreakdownSheet';
import ExtrasManager from './components/scheduling/ExtrasManager';
import WardrobeManager from './components/scheduling/WardrobeManager';
import SetsManager from './components/scheduling/SetsManager';
import ScriptManager from './components/scheduling/ScriptManager';
import SchedulingReports from './components/scheduling/Reports';

import TopSheet from './components/budgeting/TopSheet';
import AccountList from './components/budgeting/AccountList';
import GlobalsEditor from './components/budgeting/GlobalsEditor';
import FringesEditor from './components/budgeting/FringesEditor';
import ActualsTracker from './components/budgeting/ActualsTracker';
import BudgetReports from './components/budgeting/BudgetReports';

function StripBoardView() {
  const { state } = useScheduling();
  return (
    <div className="flex flex-col flex-1 min-h-0 relative">
      <StripBoard />
      {state.selectedBreakdownId && <BreakdownSheetPanel />}
    </div>
  );
}

function ProjectLoading() {
  return (
    <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
      Loading project…
    </div>
  );
}

function ProjectRouteGuard({ children }: { children: ReactNode }) {
  const { state } = useScheduling();
  if (!state.project) return <ProjectLoading />;
  return <>{children}</>;
}

function ProjectApp() {
  const { projectId } = useParams<{ projectId: string }>();

  return (
    <SchedulingProvider projectId={projectId!}>
      <BudgetingProvider projectId={projectId!}>
        <ToastProvider>
          <div className="flex h-screen overflow-hidden bg-gray-900">
            <Sidebar />
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
              <Header />
              <main className="flex flex-1 min-h-0 overflow-hidden">
                <ProjectRouteGuard>
                  <Routes>
                    <Route path="scheduling/stripboard" element={<StripBoardView />} />
                    <Route path="scheduling/breakdowns" element={<BreakdownList />} />
                    <Route path="scheduling/elements" element={<ElementManager />} />
                    <Route path="scheduling/extras" element={<ExtrasManager />} />
                    <Route path="scheduling/wardrobe" element={<WardrobeManager />} />
                    <Route path="scheduling/sets" element={<SetsManager />} />
                    <Route path="scheduling/script" element={<ScriptManager />} />
                    <Route path="scheduling/dood" element={<DayOutOfDays />} />
                    <Route path="scheduling/calendar" element={<CalendarView />} />
                    <Route path="scheduling/reports" element={<SchedulingReports />} />
                    <Route path="budgeting/topsheet" element={<TopSheet />} />
                    <Route path="budgeting/accounts" element={<AccountList />} />
                    <Route path="budgeting/globals" element={<GlobalsEditor />} />
                    <Route path="budgeting/fringes" element={<FringesEditor />} />
                    <Route path="budgeting/actuals" element={<ActualsTracker />} />
                    <Route path="budgeting/reports" element={<BudgetReports />} />
                    <Route path="*" element={<Navigate to="scheduling/stripboard" replace />} />
                  </Routes>
                </ProjectRouteGuard>
              </main>
            </div>
          </div>
        </ToastProvider>
      </BudgetingProvider>
    </SchedulingProvider>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ProjectSelector />} />
      <Route path="/project/:projectId/*" element={<ProjectApp />} />
    </Routes>
  );
}
