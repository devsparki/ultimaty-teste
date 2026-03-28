# Configuração de Autenticação com Google

Este documento explica como configurar a autenticação com Google OAuth no projeto.

## Pré-requisitos

- Conta no Supabase
- Projeto Supabase criado
- Acesso ao Google Cloud Console

## Passo 1: Configurar Google OAuth

### 1.1 Criar Projeto no Google Cloud Console

1. Acesse: https://console.cloud.google.com/
2. Crie um novo projeto ou selecione um existente
3. Vá para "APIs & Services" > "Credentials"

### 1.2 Configurar OAuth Consent Screen

1. Clique em "OAuth consent screen"
2. Escolha "External" (para testes públicos)
3. Preencha:
   - App name: "Jogo da Velha 2"
   - User support email: seu email
   - Developer contact: seu email
4. Clique em "Save and Continue"
5. Adicione os escopos:
   - `email`
   - `profile`
6. Clique em "Save and Continue"

### 1.3 Criar Credenciais OAuth

1. Vá para "Credentials" > "Create Credentials" > "OAuth Client ID"
2. Tipo de aplicativo: "Web application"
3. Nome: "Jogo da Velha 2 - Web"
4. Authorized JavaScript origins:
   - `http://localhost:8080` (desenvolvimento)
   - Seu domínio de produção
5. Authorized redirect URIs:
   - Copie o callback URL do Supabase (próximo passo)
6. Clique em "Create"
7. Copie o **Client ID** e **Client Secret**

## Passo 2: Configurar Supabase

### 2.1 Habilitar Google Provider

1. Acesse seu projeto no Supabase: https://supabase.com/dashboard
2. Vá para "Authentication" > "Providers"
3. Encontre "Google" e clique em "Enable"
4. Cole o **Client ID** e **Client Secret** do Google
5. Copie o **Callback URL** mostrado (exemplo: `https://xxx.supabase.co/auth/v1/callback`)
6. Clique em "Save"

### 2.2 Adicionar Callback URL ao Google

1. Volte ao Google Cloud Console
2. Edite suas credenciais OAuth
3. Adicione o **Callback URL** do Supabase aos "Authorized redirect URIs"
4. Salve

### 2.3 Configurar Variáveis de Ambiente

1. Copie o arquivo `.env.example` para `.env`
2. Preencha com suas credenciais do Supabase:

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbG...
```

## Passo 3: Testar

1. Inicie o servidor: `npm run dev`
2. Acesse: http://localhost:8080
3. Clique em "Entrar com Google"
4. Autorize o aplicativo
5. Você deve ser redirecionado de volta logado

## Funcionalidades Implementadas

### Autenticação
- Login com Google OAuth
- Logout funcional
- Persistência de sessão (auto-login)
- Restauração automática da sessão

### Perfil de Usuário
- Nome completo
- Email
- Avatar (foto do Google)
- Nickname editável
- Estatísticas:
  - Partidas jogadas
  - Vitórias
  - Derrotas
  - Empates
  - Taxa de vitória

### Interface
- Tela de login moderna
- Header com avatar e nome do usuário
- Menu principal com opções de jogo e perfil
- Página de perfil completa
- Design futurista mantido

### Banco de Dados

Tabelas criadas automaticamente:
- `user_profiles` - Dados do perfil
- `user_stats` - Estatísticas de jogo

Segurança:
- RLS habilitado em todas as tabelas
- Políticas restritivas
- Triggers automáticos para criação de perfil

## Estrutura do Código

```
src/
├── hooks/
│   └── useAuth.ts              # Hook de autenticação
├── components/
│   ├── AuthGate.tsx            # Tela de login
│   ├── UserHeader.tsx          # Header com avatar
│   ├── UserProfile.tsx         # Página de perfil
│   └── MainMenu.tsx            # Menu principal (atualizado)
└── pages/
    └── Index.tsx               # Controle de rotas (atualizado)
```

## Próximos Passos

O sistema está preparado para:
- Ranking global de jogadores
- Histórico de partidas
- Estatísticas avançadas
- Sistema de achievements
- Matchmaking por ranking

## Troubleshooting

### Erro: "Invalid redirect URI"
- Verifique se o callback URL está correto no Google Cloud Console
- Confirme que não há espaços ou caracteres extras

### Erro: "Access blocked"
- Publique o OAuth consent screen
- Ou adicione seu email como testador

### Perfil não é criado
- Verifique se as migrações foram aplicadas
- Confira os logs do Supabase

### Sessão não persiste
- Limpe o localStorage do navegador
- Verifique as configurações do Supabase Auth
