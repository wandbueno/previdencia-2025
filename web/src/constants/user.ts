// src/constants/user.ts
export const USER_ROLES = {
  ORGANIZATION_ADMIN: {
    value: 'ORGANIZATION_ADMIN',
    label: 'Administrador'
  },
  APP_USER: {
    value: 'APP_USER',
    label: 'Usuário do App'
  }
} as const;

export const USER_SERVICES = {
  PROOF_OF_LIFE: {
    value: 'PROOF_OF_LIFE',
    label: 'Prova de Vida'
  },
  RECADASTRATION: {
    value: 'RECADASTRATION',
    label: 'Recadastramento'
  }
} as const;
