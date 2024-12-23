import { Select } from '@/components/ui/Select';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface EventFiltersProps {
  organizationId?: string;
  onOrganizationChange: (value: string) => void;
}

interface Organization {
  id: string;
  name: string;
}

export function EventFilters({ organizationId, onOrganizationChange }: EventFiltersProps) {
  const { data: organizations } = useQuery<Organization[]>({
    queryKey: ['organizations'],
    queryFn: async () => {
      const response = await api.get('/organizations');
      return response.data;
    }
  });

  return (
    <div className="mb-6 flex gap-4">
      <div className="w-64">
        <label htmlFor="organization" className="block text-sm font-medium text-gray-700">
          Organização
        </label>
        <Select
          id="organization"
          value={organizationId}
          onChange={onOrganizationChange}
          options={[
            { value: '', label: 'Todas' },
            ...(organizations?.map((org: Organization) => ({
              value: org.id,
              label: org.name
            })) || [])
          ]}
        />
      </div>
    </div>
  );
} 