import { createContext, ReactNode, useEffect, useState, useContext } from 'react';

interface OrganizationContextType {
  organizationId: string;
  setOrganizationId: (id: string) => void;
}

export const OrganizationContext = createContext<OrganizationContextType | null>(null);

interface OrganizationProviderProps {
  children: ReactNode;
}

export function OrganizationProvider({ children }: OrganizationProviderProps) {
  const [organizationId, setOrganizationId] = useState<string>('');

  // You can add logic here to fetch the organization ID from your authentication system
  // or local storage when the provider mounts
  useEffect(() => {
    // Example: Get organization ID from localStorage
    const storedOrgId = localStorage.getItem('organizationId');
    if (storedOrgId) {
      setOrganizationId(storedOrgId);
    }
  }, []);

  return (
    <OrganizationContext.Provider value={{ organizationId, setOrganizationId }}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}
