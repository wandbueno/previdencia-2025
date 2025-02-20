import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Select } from '@/components/ui/Select';

interface Organization {
  id: string;
  name: string;
  subdomain: string;
  state: string;
  city: string;
}

interface SelectOrganizationProps {
  onSelect: (subdomain: string) => void;
}

export function SelectOrganization({ onSelect }: SelectOrganizationProps) {
  const { data: organizations, isLoading } = useQuery<Organization[]>({
    queryKey: ['organizations'],
    queryFn: async () => {
      const response = await api.get('/organizations');
      return response.data;
    },
  });

  return (
    <div>
      <label
        htmlFor="organization"
        className="block text-sm font-medium leading-6 text-gray-900"
      >
        Organização
      </label>
      <div className="mt-2">
        <Select
          id="organization"
          placeholder="Selecione uma organização"
          disabled={isLoading}
          onChange={(subdomain) => onSelect(subdomain)}
          options={
            organizations?.map((org) => ({
              value: org.subdomain,
              label: `${org.name} - ${org.city}/${org.state}`,
            })) || []
          }
        />
      </div>
    </div>
  );
}