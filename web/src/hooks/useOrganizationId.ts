import { useContext } from 'react';
import { OrganizationContext } from '@/contexts/OrganizationContext';

export function useOrganizationId() {
  const context = useContext(OrganizationContext);
  
  if (!context) {
    throw new Error('useOrganizationId must be used within an OrganizationProvider');
  }
  
  return context.organizationId;
}
