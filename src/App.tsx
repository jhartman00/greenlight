import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SchedulingProvider, useScheduling } from './stores/schedulingStore';
import { BudgetingProvider, useBudgeting } from './stores/budgetingStore';
import { ToastProvider } from './components/layout/Toast';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

import StripBoard from './components/scheduling/StripBoard';
import BreakdownList from './components/scheduling/BreakdownList';
import ElementManager from './components/scheduling/ElementManager';
import DayOutOfDays from './components/scheduling/DayOutOfDays';
import CalendarView from './components/scheduling/CalendarView';
import BreakdownSheetPanel from './components/scheduling/BreakdownSheet';

import TopSheet from './components/budgeting/TopSheet';
import AccountDetail from './components/budgeting/AccountDetail';
import GlobalsEditor from './components/budgeting/GlobalsEditor';
import FringesEditor from './components/budgeting/FringesEditor';
import ActualsTracker from './components/budgeting/ActualsTracker';
import BudgetReports from './components/budgeting/BudgetReports';

function AppInitializer({ children }: { children: React.ReactNode }) {
  const { state: schedState, dispatch: schedDispatch } = useScheduling();
  const { state: budgetState, dispatch: budgetDispatch } = useBudgeting();

  useEffect(() => {
    if (!schedState.project) schedDispatch({ type: 'LOAD_SAMPLE' });
    if (!budgetState.project) budgetDispatch({ type: 'LOAD_SAMPLE' });
  }, []);

  return <>{children}</>;
}

function StripBoardView() {
  const { state } = useScheduling();
  return (
    <div className="flex flex-col flex-1 min-h-0 relative">
      <StripBoard />
      {state.selectedBreakdownId && <BreakdownSheetPanel />}
    </div>
  );
}

function AppContent() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-900">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header />
        <main className="flex flex-1 min-h-0 overflow-hidden">
          <Routes>
            <Route path="/" element={<Navigate to="/scheduling/stripboard" replace />} />
            <Route path="/scheduling/stripboard" element={<StripBoardView />} />
            <Route path="/scheduling/breakdowns" element={<BreakdownList />} />
            <Route path="/scheduling/elements" element={<ElementManager />} />
            <Route path="/scheduling/dood" element={<DayOutOfDays />} />
            <Route path="/scheduling/calendar" element={<CalendarView />} />
            <Route path="/budgeting/topsheet" element={<TopSheet />} />
            <Route path="/budgeting/accounts" element={<AccountDetail />} />
            <Route path="/budgeting/globals" element={<GlobalsEditor />} />
            <Route path="/budgeting/fringes" element={<FringesEditor />} />
            <Route path="/budgeting/actuals" element={<ActualsTracker />} />
            <Route path="/budgeting/reports" element={<BudgetReports />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <SchedulingProvider>
      <BudgetingProvider>
        <ToastProvider>
          <AppInitializer>
            <AppContent />
          </AppInitializer>
        </ToastProvider>
      </BudgetingProvider>
    </SchedulingProvider>
  );
}
