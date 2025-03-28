import { Fragment, useEffect, useRef, ChangeEvent, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { InputMask } from '@/components/ui/InputMask';
import { Organization } from '@/types/organization';

// Função para gerar URLs de imagem que funcionam em ambos os ambientes
function getImageUrl(path: string | undefined | null) {
  if (!path) {
    return undefined;
  }

  // Se já for uma URL completa, retorna ela mesma
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Em produção sempre usar o endereço do backend hospedado no Fly.io
  const baseUrl = import.meta.env.PROD 
    ? 'https://previdencia-2025-plw27a.fly.dev'
    : (import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace('/api', '')
      : 'http://localhost:3333');

  // Limpar caminho
  let cleanPath = path;
  
  // Remover referências a diretórios superiores (../../)
  if (cleanPath.includes('../')) {
    // Extrair apenas a parte do caminho que importa
    const parts = cleanPath.split('data/uploads/');
    if (parts.length > 1) {
      cleanPath = parts[1]; // Pegar apenas o caminho após data/uploads/
    } else {
      // Tentar outra abordagem para extrair as partes importantes do caminho
      const uuidPattern = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/gi;
      const matches = cleanPath.match(uuidPattern);
      
      if (matches && matches.length >= 2) {
        // Pegar tudo a partir do primeiro UUID encontrado
        const startIdx = cleanPath.indexOf(matches[0]);
        if (startIdx !== -1) {
          cleanPath = cleanPath.substring(startIdx);
        }
      }
    }
  }
  
  // Remover o prefixo /uploads/ ou uploads/ se existir
  if (cleanPath.startsWith('/uploads/')) {
    cleanPath = cleanPath.substring(9); // Remove '/uploads/'
  } else if (cleanPath.startsWith('uploads/')) {
    cleanPath = cleanPath.substring(8); // Remove 'uploads/'
  }
  
  // Se ainda contiver data/uploads/, remover também
  if (cleanPath.startsWith('data/uploads/')) {
    cleanPath = cleanPath.substring(13);
  } else if (cleanPath.startsWith('/data/uploads/')) {
    cleanPath = cleanPath.substring(14);
  }
  
  // Remover qualquer barra extra no início
  if (cleanPath.startsWith('/')) {
    cleanPath = cleanPath.substring(1);
  }
  
  return `${baseUrl}/uploads/${cleanPath}`;
}

interface EditOrganizationModalProps {
  organization: Organization;
  open: boolean;
  onClose: () => void;
}

const editOrganizationSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  cnpj: z.string()
    .regex(/^\d{14}$/, 'CNPJ deve conter 14 dígitos'),
  state: z.string().length(2, 'Estado deve ter 2 caracteres'),
  city: z.string().min(2, 'Cidade deve ter no mínimo 2 caracteres'),
  address: z.string().min(5, 'Endereço deve ter no mínimo 5 caracteres'),
  cep: z.string()
    .regex(/^\d{8}$/, 'CEP deve conter 8 dígitos'),
  phone: z.string()
    .regex(/^\d{10,11}$/, 'Telefone deve conter 10 ou 11 dígitos'),
  email: z.string().email('Email inválido'),
  logo_url: z.string().optional(),
  active: z.boolean(),
  services: z.array(z.string()).min(1, 'Pelo menos um serviço deve ser selecionado')
});

type EditOrganizationFormData = z.infer<typeof editOrganizationSchema>;

const services = [
  { value: 'PROOF_OF_LIFE', label: 'Prova de Vida' },
  { value: 'RECADASTRATION', label: 'Recadastramento' }
];

export function EditOrganizationModal({ organization, open, onClose }: EditOrganizationModalProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<EditOrganizationFormData>({
    resolver: zodResolver(editOrganizationSchema),
    defaultValues: {
      name: organization.name,
      cnpj: organization.cnpj,
      state: organization.state,
      city: organization.city,
      address: organization.address,
      cep: organization.cep,
      phone: organization.phone,
      email: organization.email,
      logo_url: organization.logo_url,
      active: organization.active,
      services: organization.services
    }
  });

  useEffect(() => {
    if (organization) {
      reset({
        name: organization.name,
        cnpj: organization.cnpj,
        state: organization.state,
        city: organization.city,
        address: organization.address,
        cep: organization.cep,
        phone: organization.phone,
        email: organization.email,
        active: organization.active,
        services: organization.services
      });
    }
  }, [organization, reset]);

  const selectedServices = watch('services');

  const { mutate: updateOrganization, isPending } = useMutation({
    mutationFn: async (data: EditOrganizationFormData) => {
      // Log dos dados antes de formatar
      console.log('Dados do formulário:', data);

      // Se houver um logo selecionado, fazer upload primeiro
      if (selectedLogo) {
        const formData = new FormData();
        formData.append('file', selectedLogo);
        formData.append('organizationId', organization.id);

        try {
          const uploadResponse = await api.post('/uploads/logo', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          // Atualizar a logo_url nos dados
          data.logo_url = uploadResponse.data.path;
        } catch (error: any) {
          toast.error(
            error.response?.data?.message || 'Erro ao fazer upload da logo'
          );
          throw error;
        }
      }

      // Atualizar a organização com os dados (incluindo o novo caminho da logo, se houver)
      const response = await api.put(`/organizations/${organization.id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      console.log('Sucesso na atualização:', data);
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success('Organização atualizada com sucesso!');
      // Limpar o estado do logo selecionado
      setSelectedLogo(null);
      setPreviewUrl(null);
      handleClose();
    },
    onError: (error: any) => {
      console.error('Erro na atualização:', error);
      toast.error(
        error.response?.data?.message || 'Erro ao atualizar organização'
      );
    }
  });

  const handleLogoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    // Validar tipo
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('A imagem deve ser JPG, PNG ou WebP');
      return;
    }

    // Em vez de fazer upload imediatamente, armazenar o arquivo e criar uma prévia
    setSelectedLogo(file);
    const fileUrl = URL.createObjectURL(file);
    setPreviewUrl(fileUrl);
  };

  function handleClose() {
    reset();
    setSelectedLogo(null);
    setPreviewUrl(null);
    onClose();
  }

  function toggleService(value: string) {
    const services = selectedServices || [];
    const index = services.indexOf(value);

    if (index === -1) {
      setValue('services', [...services, value]);
    } else {
      setValue('services', services.filter(service => service !== value));
    }
  }

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6">
                <div>
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-semibold leading-6 text-gray-900"
                  >
                    Editar Organização
                  </Dialog.Title>

                  <form onSubmit={handleSubmit((data) => {
                    console.log('Dados do formulário:', data);
                    updateOrganization(data);
                  })}>
                    <div className="mt-4 space-y-4">
                      {/* Logo */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Logo
                        </label>
                        <div className="mt-2 flex items-center gap-4">
                          {previewUrl ? (
                            <div className="w-32 h-32 border rounded-lg overflow-hidden bg-white">
                              <img
                                src={previewUrl}
                                alt="Logo Preview"
                                className="w-full h-full object-contain"
                              />
                            </div>
                          ) : organization.logo_url ? (
                            <div className="w-32 h-32 border rounded-lg overflow-hidden bg-white">
                              <img
                                src={getImageUrl(organization.logo_url)}
                                alt="Logo"
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.onerror = null;
                                  target.src = '/placeholder-image.png';
                                }}
                              />
                            </div>
                          ) : (
                            <div className="w-32 h-32 border rounded-lg flex items-center justify-center text-muted-foreground">
                              Sem logo
                            </div>
                          )}
                          <div className="flex flex-col gap-2">
                            <input
                              type="file"
                              ref={fileInputRef}
                              className="hidden"
                              accept="image/jpeg,image/png,image/webp"
                              onChange={handleLogoChange}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              Alterar logo
                            </Button>
                            {selectedLogo && (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setSelectedLogo(null);
                                  setPreviewUrl(null);
                                }}
                              >
                                Cancelar
                              </Button>
                            )}
                            <span className="text-xs text-muted-foreground">
                              JPG, PNG ou WebP até 5MB
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Basic Info */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Nome
                          </label>
                          <div className="mt-1">
                            <Input
                              {...register('name')}
                              error={errors.name?.message}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Subdomínio
                          </label>
                          <div className="mt-1">
                            <Input
                              value={organization.subdomain}
                              disabled
                              className="bg-gray-100"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            CNPJ
                          </label>
                          <div className="mt-1">
                            <InputMask
                              mask="00.000.000/0000-00"
                              placeholder="00.000.000/0000-00"
                              value={organization.cnpj}
                              error={errors.cnpj?.message}
                              onChangeUnmasked={(value) => setValue('cnpj', value)}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Email
                          </label>
                          <div className="mt-1">
                            <Input
                              type="email"
                              {...register('email')}
                              error={errors.email?.message}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Telefone
                          </label>
                          <div className="mt-1">
                            <InputMask
                              mask="(00) 00000-0000"
                              placeholder="(00) 00000-0000"
                              value={organization.phone}
                              error={errors.phone?.message}
                              onChangeUnmasked={(value) => setValue('phone', value)}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Address */}
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            CEP
                          </label>
                          <div className="mt-1">
                            <InputMask
                              mask="00000-000"
                              placeholder="00000-000"
                              value={organization.cep}
                              error={errors.cep?.message}
                              onChangeUnmasked={(value) => setValue('cep', value)}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Estado
                          </label>
                          <div className="mt-1">
                            <Input
                              maxLength={2}
                              {...register('state')}
                              error={errors.state?.message}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Cidade
                          </label>
                          <div className="mt-1">
                            <Input
                              {...register('city')}
                              error={errors.city?.message}
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Endereço
                        </label>
                        <div className="mt-1">
                          <Input
                            {...register('address')}
                            error={errors.address?.message}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Status
                          </label>
                          <div className="mt-2">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                {...register('active')}
                                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                              />
                              <span className="text-sm text-gray-900">
                                {watch('active') ? 'Ativo' : 'Inativo'}
                              </span>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Services */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Serviços
                        </label>
                        <div className="mt-2 flex gap-2">
                          {services.map(service => (
                            <Button
                              key={service.value}
                              type="button"
                              variant={selectedServices?.includes(service.value) ? 'primary' : 'outline'}
                              onClick={() => toggleService(service.value)}
                            >
                              {service.label}
                            </Button>
                          ))}
                        </div>
                        {errors.services && (
                          <p className="mt-1 text-xs text-red-500">
                            {errors.services.message}
                          </p>
                        )}
                      </div>

                      <div className="mt-6 flex justify-end gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleClose}
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="submit"
                          disabled={isPending}
                        >
                          {isPending ? 'Salvando...' : 'Salvar'}
                        </Button>
                      </div>
                    </div>
                  </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}