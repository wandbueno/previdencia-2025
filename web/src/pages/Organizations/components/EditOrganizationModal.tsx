import { Fragment, useEffect, useRef, ChangeEvent } from 'react';
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

interface Organization {
  id: string;
  name: string;
  subdomain: string;
  cnpj: string;
  state: string;
  city: string;
  address: string;
  cep: string;
  phone: string;
  email: string;
  logo_url?: string;
  active: boolean;
  services: string[];
  created_at: string;
  updated_at: string;
}

interface EditOrganizationModalProps {
  organization: Organization;
  open: boolean;
  onClose: () => void;
}

const editOrganizationSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  cnpj: z.string().regex(/^\d{14}$/, 'CNPJ deve conter 14 dígitos'),
  state: z.string().length(2, 'Estado deve ter 2 caracteres'),
  city: z.string().min(3, 'Cidade deve ter no mínimo 3 caracteres'),
  address: z.string().min(5, 'Endereço deve ter no mínimo 5 caracteres'),
  cep: z.string().regex(/^\d{8}$/, 'CEP deve conter 8 dígitos'),
  phone: z.string().regex(/^\d{10,11}$/, 'Telefone deve conter 10 ou 11 dígitos'),
  email: z.string().email('Email inválido'),
  logo_url: z.string().optional(),
  active: z.boolean(),
  services: z.array(z.string()).min(1, 'Selecione pelo menos um serviço')
});

type EditOrganizationFormData = z.infer<typeof editOrganizationSchema>;

const services = [
  { value: 'PROOF_OF_LIFE', label: 'Prova de Vida' },
  { value: 'RECADASTRATION', label: 'Recadastramento' }
];

export function EditOrganizationModal({ organization, open, onClose }: EditOrganizationModalProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        logo_url: organization.logo_url,
        active: organization.active,
        services: organization.services
      });
    }
  }, [organization, reset]);

  const selectedServices = watch('services');

  const { mutate: updateOrganization, isPending } = useMutation({
    mutationFn: async (data: EditOrganizationFormData) => {
      // Remove máscaras antes de enviar
      const formattedData = {
        ...data,
        cnpj: data.cnpj.replace(/\D/g, ''),
        cep: data.cep.replace(/\D/g, ''),
        phone: data.phone.replace(/\D/g, '')
      };

      const response = await api.put(`/organizations/${organization.id}`, formattedData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success('Organização atualizada com sucesso!');
      handleClose();
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Erro ao atualizar organização'
      );
    }
  });

  const { mutate: uploadLogo, isPending: isUploadingLogo } = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('organizationId', organization.id);

      const response = await api.post('/uploads/logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Atualizar a logo_url no formulário
      setValue('logo_url', response.data.path);

      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success('Logo atualizada com sucesso!');
      // Atualizar a organização no formulário
      reset({
        ...organization,
        logo_url: data.path
      });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Erro ao atualizar logo'
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

    uploadLogo(file);
  };

  function handleClose() {
    reset();
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

                  <form onSubmit={handleSubmit((data) => updateOrganization(data))}>
                    <div className="mt-4 space-y-4">
                      {/* Logo */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Logo
                        </label>
                        <div className="mt-2 flex items-center gap-4">
                          {organization.logo_url ? (
                            <div className="w-32 h-32 border rounded-lg overflow-hidden bg-white">
                              <img
                                src={`http://localhost:3333/uploads/${organization.logo_url}`}
                                alt="Logo"
                                className="w-full h-full object-contain"
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
                              disabled={isUploadingLogo}
                            >
                              {isUploadingLogo ? 'Enviando...' : 'Alterar logo'}
                            </Button>
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