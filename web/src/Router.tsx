import { Routes, Route } from 'react-router-dom';
import { DefaultLayout } from './layouts/DefaultLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { SelectOrganizationPage } from './pages/SelectOrganization';
import { AdminLoginPage } from './pages/AdminLogin';
import { DashboardPage } from './pages/Dashboard';
import { SuperAdminDashboardPage } from './pages/SuperAdminDashboard';
import { OrganizationsPage } from './pages/Organizations';
import { AdminUsersPageWrapper } from './pages/AdminUsers';
import { UsersPage } from './pages/Users';
import { ProofOfLifePage } from './pages/ProofOfLife';
import { PrivateRoute } from './components/PrivateRoute';
import { EventsPage } from './pages/Events';

export function Router() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        {/* Public routes */}
        <Route path="/" element={<SelectOrganizationPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/:subdomain/login" element={<AdminLoginPage />} />
      </Route>

      {/* Protected routes */}
      <Route element={<PrivateRoute />}>
        <Route element={<DefaultLayout />}>
          {/* Super Admin routes */}
          <Route path="/admin">
            <Route path="dashboard" element={<SuperAdminDashboardPage />} />
            <Route path="organizations" element={<OrganizationsPage />} />
            <Route path="users" element={<AdminUsersPageWrapper />} />
            <Route path="events" element={<EventsPage />} />
          </Route>

          {/* Organization routes */}
          <Route path="/:subdomain">
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="proof-of-life" element={<ProofOfLifePage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}