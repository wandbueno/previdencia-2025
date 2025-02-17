import { Fragment, useRef } from 'react';
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
import { useState } from 'react';

const createOrganizationSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  subdomain: z.string().min(3, 'Subdomínio deve ter no mínimo 3 caracteres')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Subdomínio inválido'),
  cnpj: z.string().regex(/^\d{14}$/, 'CNPJ deve conter 14 dígitos'),
  state: z.string().length(2, 'Estado deve ter 2 caracteres'),
  city: z.string().min(3, 'Cidade deve ter no mínimo 3 caracteres'),
  address: z.string().min(5, 'Endereço deve ter no mínimo 5 caracteres'),
  cep: z.string().regex(/^\d{8}$/, 'CEP deve conter 8 dígitos'),
  phone: z.string().regex(/^\d{10,11}$/, 'Telefone deve conter 10 ou 11 dígitos'),
  email: z.string().email('Email inválido'),
  logo: z.instanceof(File).optional(),
  active: z.boolean().default(true),
  services: z.array(z.string()).min(1, 'Selecione pelo menos um serviço')
});

type CreateOrganizationFormData = z.infer<typeof createOrganizationSchema>;

interface CreateOrganizationModalProps {
  open: boolean;
  onClose: () => void;
}

const services = [
  { value: 'PROOF_OF_LIFE', label: 'Prova de Vida' },
  { value: 'RECADASTRATION', label: 'Recadastramento' }
];

export function CreateOrganizationModal({ open, onClose }: CreateOrganizationModalProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<CreateOrganizationFormData>({
    resolver: zodResolver(createOrganizationSchema)
  });

  const selectedServices = watch('services');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo do arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('O logo deve ser uma imagem JPG, PNG ou WebP');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('O arquivo deve ter no máximo 5MB');
      return;
    }

    setValue('logo', file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const createOrganization = useMutation({
    mutationFn: async (data: CreateOrganizationFormData) => {
      try {
        // Primeiro, criar a organização sem o logo
        const requestData = {
          name: data.name,
          subdomain: data.subdomain,
          cnpj: data.cnpj,
          state: data.state,
          city: data.city,
          address: data.address,
          cep: data.cep,
          phone: data.phone,
          email: data.email,
          services: data.services,
          active: data.active,
          logo_url: null // Adicionando logo_url como null inicialmente
        };

        console.log('Creating organization with data:', requestData);

        // Criar a organização
        const response = await api.post('/organizations', requestData);
        const createdOrganization = response.data;
        console.log('Organization created:', createdOrganization);

        // Se tiver logo, fazer upload usando o ID da organização criada
        if (data.logo && data.logo instanceof File) {
          const formData = new FormData();
          formData.append('file', data.logo);
          formData.append('organizationId', createdOrganization.id);
          
          try {
            console.log('Uploading logo...');
            const uploadResponse = await api.post('/uploads/logo', formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });
            
            console.log('Upload response:', uploadResponse.data);
            return uploadResponse.data;
          } catch (uploadError: any) {
            console.error('Logo upload failed:', uploadError);
            const message = uploadError.response?.data?.error || 'Erro ao fazer upload do logo';
            toast.error(message);
            // Mesmo se falhar o upload da logo, a organização já foi criada
            return createdOrganization;
          }
        }

        return createdOrganization;
      } catch (error: any) {
        console.error('Request error:', error.response?.data);
        const message = error.response?.data?.message || error.response?.data?.error || 'Erro ao criar organização';
        toast.error(message);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success('Organização criada com sucesso!');
      
      // Reset form with empty values
      reset({
        name: '',
        subdomain: '',
        cnpj: '',
        state: '',
        city: '',
        address: '',
        cep: '',
        phone: '',
        email: '',
        services: [],
        logo: undefined,
        active: true
      });
      
      setPreviewUrl(null);
      onClose();
    },
    onError: (error: any) => {
      const errorData = error.response?.data;
      console.log('Full error response:', errorData);
      
      if (errorData?.details && Array.isArray(errorData.details)) {
        console.log('Validation errors:', errorData.details);
        errorData.details.forEach((detail: any) => {
          const fieldName = detail.path?.[0] || 'unknown field';
          const message = detail.message || 'Campo inválido';
          toast.error(`${fieldName}: ${message}`);
        });
      } else {
        const errorMessage = errorData?.message || errorData?.error || 'Erro ao criar organização';
        toast.error(errorMessage);
      }
    },
  });

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
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
                    Nova Organização
                  </Dialog.Title>

                  <form onSubmit={handleSubmit((data) => createOrganization.mutate(data))}>
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
                                alt="Preview"
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
                              accept="image/*"
                              className="hidden"
                              ref={fileInputRef}
                              onChange={handleFileChange}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              Escolher arquivo
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
                              {...register('subdomain')}
                              error={errors.subdomain?.message}
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

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Ativo
                        </label>
                        <div className="mt-1">
                          <Input
                            type="checkbox"
                            {...register('active')}
                            error={errors.active?.message}
                          />
                        </div>
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
                          disabled={createOrganization.isPending}
                        >
                          {createOrganization.isPending ? 'Criando...' : 'Criar'}
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