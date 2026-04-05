import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SchedulingProvider } from './stores/schedulingStore';
import { BudgetingProvider } from './stores/budgetingStore';
import { ToastProvider } from './components/layout/Toast';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

// Scheduling views
import StripBoard from './components/scheduling/StripBoard';
import BreakdownList from './components/scheduling/BreakdownList';
import BreakdownSheet from './components/scheduling/BreakdownSheet';
import ElementManager from './components/scheduling/ElementManager';
import DayOutOfDays from './components/scheduling/DayOutOfDays';
import CalendarView from './components/scheduling/CalendarView';
import Reports from './components/scheduling/Reports';

// Budgeting views
import TopSheet from './components/budgeting/TopSheet';
import AccountList from './components/budgeting/AccountList';
import AccountDetail from './components/budgeting/AccountDetail';
import GlobalsEditor from './components/budgeting/GlobalsEditor';
import FringesEditor from './components/budgeting/FringesEditor';
import ActualsTracker from './components/budgeting/ActualsTracker';
import BudgetReports from './components/budgeting/BudgetReports';

function AppContent() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-900">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/scheduling/stripboard" replace />} />
            <Route path="/scheduling" element={<Navigate to="/scheduling/stripboard" replace />} />
            <Route path="/scheduling/stripboard" element={<StripBoard />} />
            <Route path="/scheduling/breakdown" element={<BreakdownList />} />
            <Route path="/scheduling/breakdowns" element={<BreakdownList />} />
            <Route path="/scheduling/breakdown/:id" element={<BreakdownSheet />} />
            <Route path="/scheduling/elements" element={<ElementManager />} />
            <Route path="/scheduling/dood" element={<DayOutOfDays />} />
            <Route path="/scheduling/calendar" element={<CalendarView />} />
            <Route path="/scheduling/reports" element={<Reports />} />
            <Route path="/budgeting" element={<Navigate to="/budgeting/topsheet" replace />} />
            <Route path="/budgeting/topsheet" element={<TopSheet />} />
            <Route path="/budgeting/accounts" element={<AccountList />} />
            <Route path="/budgeting/account/:groupId/:accountId" element={<AccountDetail />} />
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
    <BrowserRouter>
      <ToastProvider>
        <SchedulingProvider>
          <BudgetingProvider>
            <AppContent />
          </BudgetingProvider>
        </SchedulingProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
