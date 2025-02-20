import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isTokenValid, getUser, getDefaultRoute } from '@/utils/auth';

export function PrivateRoute() {
  const location = useLocation();
  const isAuthenticated = isTokenValid();
  const user = getUser();

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check if user is trying to access admin routes
  if (location.pathname.startsWith('/admin') && !user?.isSuperAdmin) {
    return <Navigate to={getDefaultRoute()} replace />;
  }

  // Check if user is trying to access organization routes with wrong subdomain
  if (user?.organization?.subdomain) {
    const urlSubdomain = location.pathname.split('/')[1];
    if (urlSubdomain !== user.organization.subdomain) {
      return <Navigate to={getDefaultRoute()} replace />;
    }
  }

  return <Outlet />;
}