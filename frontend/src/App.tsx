import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { LeadsPage } from './pages/LeadsPage';
import { OpportunitiesPage } from './pages/OpportunitiesPage';
import { CloudFitAdvisorPage } from './pages/CloudFitAdvisorPage';
import { ActivitiesPage } from './pages/ActivitiesPage';
import { AccountsPage } from './pages/AccountsPage';
import { ProposalsPage } from './pages/ProposalsPage';
import { RenewalsPage } from './pages/RenewalsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/leads" element={<LeadsPage />} />
        <Route path="/pipeline" element={<OpportunitiesPage />} />
        <Route path="/advisor" element={<CloudFitAdvisorPage />} />
        <Route path="/activities" element={<ActivitiesPage />} />
        <Route path="/accounts" element={<AccountsPage />} />
        <Route path="/proposals" element={<ProposalsPage />} />
        <Route path="/renewals" element={<RenewalsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
