import { Modal } from '@/components/ui/Modal';
import { UserForm } from './UserForm';
import { User, UserTableType, CreateUserFormData, UpdateUserFormData } from '@/types/user';

interface UserModalProps {
  open: boolean;
  onClose: () => void;
  user?: User;
  onSubmit: (data: CreateUserFormData | UpdateUserFormData) => void;
  isSubmitting: boolean;
  type: UserTableType;
}

export function UserModal({ open, onClose, user, onSubmit, isSubmitting, type }: UserModalProps) {
  return (
    <Modal open={open} onClose={onClose} className="sm:max-w-lg">
      <h2 className="text-lg font-semibold mb-4">
        {user ? 'Editar Usuário' : 'Novo Usuário'}
      </h2>
      <UserForm
        user={user}
        onSubmit={onSubmit}
        onCancel={onClose}
        isSubmitting={isSubmitting}
        type={type}
      />
    </Modal>
  );
}