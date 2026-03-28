/*
  # Sistema de Autenticação e Perfil de Usuários

  ## Tabelas Criadas
  
  ### `user_profiles`
  Armazena informações dos perfis de usuário
  - `id` (uuid, primary key) - ID único do usuário (referencia auth.users)
  - `email` (text) - Email do usuário
  - `full_name` (text) - Nome completo
  - `display_name` (text) - Nome de exibição/nickname (editável)
  - `avatar_url` (text) - URL da foto de perfil
  - `created_at` (timestamptz) - Data de criação
  - `updated_at` (timestamptz) - Data de última atualização

  ### `user_stats`
  Armazena estatísticas dos jogadores
  - `id` (uuid, primary key) - ID único
  - `user_id` (uuid) - Referência ao usuário
  - `games_played` (integer) - Total de partidas jogadas
  - `wins` (integer) - Total de vitórias
  - `losses` (integer) - Total de derrotas
  - `draws` (integer) - Total de empates
  - `updated_at` (timestamptz) - Data de última atualização

  ## Segurança
  
  ### RLS Habilitado
  - Políticas restritivas para proteger dados dos usuários
  - Usuários só podem ver e editar seus próprios dados
  - Stats públicas para ranking futuro
*/

-- Tabela de perfis de usuário
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  display_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_display_name ON user_profiles(display_name);

-- Tabela de estatísticas
CREATE TABLE IF NOT EXISTS user_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  games_played integer DEFAULT 0,
  wins integer DEFAULT 0,
  losses integer DEFAULT 0,
  draws integer DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Índice para busca de ranking
CREATE INDEX IF NOT EXISTS idx_user_stats_wins ON user_stats(wins DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_games ON user_stats(games_played DESC);

-- Habilitar RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Políticas para user_profiles

-- Usuários podem ver seu próprio perfil
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Usuários podem atualizar seu próprio perfil
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Usuários podem inserir seu próprio perfil
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Políticas para user_stats

-- Todos podem ver estatísticas (para ranking)
CREATE POLICY "Anyone can view stats"
  ON user_stats
  FOR SELECT
  TO authenticated
  USING (true);

-- Apenas o próprio usuário pode atualizar suas stats
CREATE POLICY "Users can update own stats"
  ON user_stats
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Sistema pode inserir stats
CREATE POLICY "Users can insert own stats"
  ON user_stats
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Função para criar perfil automaticamente após signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  
  INSERT INTO public.user_stats (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS set_updated_at_user_profiles ON user_profiles;
CREATE TRIGGER set_updated_at_user_profiles
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_user_stats ON user_stats;
CREATE TRIGGER set_updated_at_user_stats
  BEFORE UPDATE ON user_stats
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
