# KanBan-FrontEnd
# Kanban Frontend

Sistema Kanban colaborativo multi-board — Frontend desenvolvido em Next.js + TypeScript.

**Backend utilizado:** `http://alexsia.flashnetbrasil.com.br/api/v1`

**Acesso Figma** https://www.figma.com/design/hvvsr1ziLv1kUuGFyKqAvH/KanBan?node-id=2-547&m=dev&t=TKjyOSaHbzl1ussV-1
---

## ✅ Funcionalidades Implementadas

| RF | Descrição | Status |
|----|-----------|--------|
| RF-01 | Autenticação com username e senha (JWT) | ✅ |
| RF-02 | Renovação automática do token via refresh token | ✅ |
| RF-03 | Visualização apenas dos boards com acesso | ✅ |
| RF-04 | Board com colunas e cards | ✅ |
| RF-05 | Mover cards entre colunas via drag-and-drop | ✅ |
| RF-06 | Modal com observação obrigatória ao mover card | ✅ |
| RF-07 | Movimentação bloqueada sem observação | ✅ |
| RF-08 | Detalhe do card com todos os dados | ✅ |
| RF-09 | Histórico completo em ordem cronológica inversa | ✅ |
| RF-10 | Adicionar comentários a um card | ✅ |
| RF-11 | Feed de atividade recente do board | ✅ |
| RF-12 | Viewer não pode mover/editar cards | ✅ |
| RF-13 | Indicador visual de WIP limit | ✅ |
| RF-14 | Erro claro ao tentar mover para coluna com WIP limit atingido | ✅ |

---

## 🛠️ Pré-requisitos

Antes de começar, instale:

### 1. Node.js (obrigatório)
- Baixe em: https://nodejs.org/
- Versão recomendada: **18+ ou 20 LTS**
- Verifique após instalar:
```bash
node -v
npm -v
```

### 2. Git (obrigatório)
- Baixe em: https://git-scm.com/
- Verifique:
```bash
git --version
```

### 3. Editor de Código (recomendado)
- **VS Code**: https://code.visualstudio.com/
- Extensões úteis: ES7 React Snippets, Prettier, ESLint, Tailwind CSS IntelliSense

---

## 🚀 Como Rodar Localmente

### Passo 1 — Clone o repositório (ou descompacte o ZIP)
```bash
git clone <url-do-repositorio>
cd kanban-frontend
```
> Se você baixou o ZIP, descompacte e entre na pasta via terminal.

### Passo 2 — Instale as dependências
```bash
npm install
```
> Aguarde o npm baixar todos os pacotes (pode levar 1-2 minutos na primeira vez).

### Passo 3 — Inicie o servidor de desenvolvimento
```bash
npm run dev
```

### Passo 4 — Acesse no navegador
```
http://localhost:3000
```
Você será redirecionado para a tela de login.

---

## 👤 Usuários para Teste

| Username | Senha     | Role   | Status |
|----------|-----------|--------|--------|
| admin    | Admin@123 | admin  | ✅ ativo |
| alice    | Teste@123 | member/editor | ✅ ativo |
| bob      | Teste@123 | member/editor | ✅ ativo |
| carol    | Teste@123 | member/viewer | ✅ ativo |
| dave     | Teste@123 | member | ❌ inativo (retorna 403) |

---

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── layout.tsx          # Layout raiz
│   ├── globals.css         # Estilos globais + variáveis CSS
│   ├── page.tsx            # Redireciona para /boards
│   ├── login/
│   │   └── page.tsx        # Tela de login
│   └── boards/
│       ├── page.tsx        # Lista de boards
│       └── [id]/
│           └── page.tsx    # Board Kanban (drag-and-drop)
├── components/
│   ├── board/
│   │   ├── KanbanColumn.tsx      # Coluna do Kanban
│   │   ├── KanbanCard.tsx        # Card draggable
│   │   ├── MoveModal.tsx         # Modal de movimentação com observação
│   │   ├── CardDetailModal.tsx   # Modal de detalhe do card
│   │   └── ActivityFeed.tsx      # Feed de atividade lateral
│   ├── layout/
│   │   └── Navbar.tsx            # Barra de navegação
│   └── ui/
│       ├── Toast.tsx             # Notificações toast
│       ├── Skeleton.tsx          # Loading skeletons
│       └── PriorityBadge.tsx     # Badge de prioridade
├── hooks/
│   ├── useAuth.ts          # Hook de autenticação
│   └── useToast.ts         # Hook de notificações
├── services/
│   ├── api.ts              # Axios + interceptors (auth + refresh)
│   ├── auth.ts             # Serviços de autenticação
│   ├── boards.ts           # Serviços de boards
│   └── cards.ts            # Serviços de cards
├── types/
│   └── index.ts            # Tipos TypeScript
└── lib/
    └── utils.ts            # Utilitários (formatação de datas, erros)
```

---

## 🎨 Design System

- **Tema:** Dark mode
- **Fontes:** Syne (display) + DM Sans (body) via Google Fonts
- **Cores:** Sistema baseado em CSS variables com paleta roxa/índigo
- **Animações:** Fade-in, slide-up, scale-in para modais e toasts

---

## 🔐 Segurança

- `access_token` e `refresh_token` armazenados no `localStorage`
- Refresh automático do token antes de expirar (interceptor Axios)
- Redirecionamento para `/login` quando token é inválido
- Proteção de rotas verificando autenticação em cada página

---

## 🔧 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Servidor de desenvolvimento em `localhost:3000` |
| `npm run build` | Build de produção |
| `npm run start` | Inicia servidor de produção (após build) |
| `npm run lint` | Verifica erros de linting |

---

## ⚠️ Observações

- O projeto consome a API em `http://alexsia.flashnetbrasil.com.br/api/v1`
- A API usa HTTP (não HTTPS), certifique-se que o navegador não bloqueia conteúdo misto
- O usuário `dave` está inativo propositalmente — o login retorna 403 e a mensagem de erro é exibida corretamente

---

## 🧪 Testes

O projeto usa **Jest + React Testing Library** para testes unitários e de integração.

### Rodar todos os testes
```bash
npm test
```

### Modo watch (re-executa ao salvar)
```bash
npm run test:watch
```

### Com relatório de cobertura
```bash
npm run test:coverage
```

### O que está testado

| Arquivo de teste | O que cobre |
|---|---|
| `utils.test.ts` | `formatDate`, `formatRelative`, `getErrorMessage` |
| `auth.service.test.ts` | Login (200/401/403), logout, getMe |
| `cards.service.test.ts` | moveCard (200/400/409/422), commentCard, getCardHistory, getCard |
| `boards.service.test.ts` | getBoards, getBoard (com colunas/cards), getActivity |
| `MoveModal.test.tsx` | Validação de 10 chars, botão desabilitado, onConfirm, onCancel, erros |
| `PriorityBadge.test.tsx` | Renderização e cores para cada prioridade |
| `useToast.test.ts` | Adicionar, remover, auto-remover toasts |
| `api.interceptor.test.ts` | Token no header, refresh automático em 401, redirect no falha |
>>>>>>> 922e550 (Initial commit)
