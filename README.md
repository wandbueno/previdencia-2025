# Prova de Vida 2025

Sistema de prova de vida e recadastramento para organizações públicas e privadas.

## 📱 Sobre o Projeto

O sistema permite que organizações gerenciem o processo de prova de vida e recadastramento de seus beneficiários de forma digital e segura, utilizando tecnologias modernas como reconhecimento facial e validação de documentos.

## 🚀 Estrutura do Projeto

O projeto é dividido em duas partes principais:

### API (Backend)
- Localização: `/api`
- Tecnologias: Node.js, Express, TypeScript, SQLite
- Funcionalidades:
  - Autenticação e autorização
  - Gerenciamento de organizações
  - Prova de vida
  - Recadastramento
  - Upload de arquivos
  - Dashboard de dados

### Web (Frontend)
- Localização: `/web`
- Tecnologias: React, TypeScript, Vite
- Funcionalidades:
  - Interface administrativa
  - Gerenciamento de usuários
  - Visualização de provas de vida
  - Relatórios e estatísticas

## 🛠️ Tecnologias Utilizadas

- **Backend**:
  - Node.js
  - Express
  - TypeScript
  - SQLite (banco de dados)
  - JWT (autenticação)
  - Multer (upload de arquivos)

- **Frontend**:
  - React
  - TypeScript
  - Vite
  - Axios
  - React Router DOM

## 🚀 Como Executar

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm ou yarn

### API
```bash
cd api
npm install
npm run migrate
npm run seed
npm run dev
```

### Web
```bash
cd web
npm install
npm run dev
```

## 📋 Variáveis de Ambiente

### API (.env)
```env
PORT=3000
JWT_SECRET=seu_jwt_secret
DATABASE_URL=file:/data/dev.db
SUPER_ADMIN_NAME="Nome do Admin"
SUPER_ADMIN_EMAIL="email@admin.com"
SUPER_ADMIN_PASSWORD="senha"
```

### Web (.env)
```env
VITE_API_URL=http://localhost:3000/api
```

## 🌐 Deploy

O projeto está deployado nos seguintes ambientes:

- **API**: [https://previdencia-2025-plw27a.fly.dev/api](https://previdencia-2025-plw27a.fly.dev/api)
- **Web**: [URL do frontend quando estiver deployado]

## 📦 Releases

- v1.1.2 - Correção do banco de dados no Fly.io
- v1.1.1 - Correções de bugs
- v1.1.0 - Novas funcionalidades
- v1.0.0 - Versão inicial

## 👥 Autores

- Wanderson Oliveira Bueno - [contato@grupomegas.com.br](mailto:contato@grupomegas.com.br)

## 📄 Licença

Este projeto está sob a licença [sua licença aqui] - veja o arquivo LICENSE.md para detalhes.
