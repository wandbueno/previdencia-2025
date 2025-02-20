import { jwtDecode } from 'jwt-decode';

interface User {
  id: string;
  name: string;
  email?: string;
  cpf?: string;
  role: string;
  isSuperAdmin?: boolean;
  organization?: {
    id: string;
    name: string;
    subdomain: string;
    state: string;
    city: string;
  };
}

interface DecodedToken {
  id: string;
  email?: string;
  isSuperAdmin?: boolean;
  organizationId?: string;
  role?: string;
  exp: number;
}

export function setAuthToken(token: string) {
  localStorage.setItem('@prova-vida:token', token);
}

export function getAuthToken() {
  return localStorage.getItem('@prova-vida:token');
}

export function removeAuthToken() {
  localStorage.removeItem('@prova-vida:token');
}

export function setUser(user: User) {
  localStorage.setItem('@prova-vida:user', JSON.stringify(user));
}

export function getUser(): User | null {
  const user = localStorage.getItem('@prova-vida:user');
  return user ? JSON.parse(user) : null;
}

export function removeUser() {
  localStorage.removeItem('@prova-vida:user');
}

export function isTokenValid() {
  const token = getAuthToken();

  if (!token) {
    return false;
  }

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const currentTime = Date.now() / 1000;

    return decoded.exp > currentTime;
  } catch {
    return false;
  }
}

export function clearAuth() {
  removeAuthToken();
  removeUser();
}

export function getDefaultRoute() {
  const user = getUser();
  
  if (user?.isSuperAdmin) {
    return '/admin/dashboard';
  }
  
  if (user?.organization?.subdomain) {
    return `/${user.organization.subdomain}/dashboard`;
  }

  return '/';
}