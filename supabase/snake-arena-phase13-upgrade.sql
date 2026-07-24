-- Snake Arena — Fase 13
-- Execute este arquivo APÓS o SQL da Fase 12.
-- É uma atualização idempotente: não apaga tabelas, contas ou progresso.

alter table public.snake_arena_leaderboard
  add column if not exists selected_title_id text not null default 'novato',
  add column if not exists skin_id text not null default 'neon-mint',
  add column if not exists current_streak integer not null default 0 check (current_streak >= 0),
  add column if not exists total_games integer not null default 0 check (total_games >= 0),
  add column if not exists total_eliminations integer not null default 0 check (total_eliminations >= 0),
  add column if not exists public_profile boolean not null default true;

-- Atualiza a leitura do placar para respeitar a preferência de perfil público.
drop policy if exists "snake_arena_leaderboard_public_read"
  on public.snake_arena_leaderboard;
create policy "snake_arena_leaderboard_public_read"
  on public.snake_arena_leaderboard
  for select
  to anon, authenticated
  using (
    public_profile = true
    or ((select auth.uid()) is not null and (select auth.uid()) = user_id)
  );

create table if not exists public.snake_arena_public_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  player_id text not null unique check (char_length(player_id) between 3 and 32),
  nickname text not null check (char_length(nickname) between 1 and 24),
  tagline text not null default '' check (char_length(tagline) <= 80),
  title_id text not null default 'novato' check (char_length(title_id) between 1 and 40),
  skin_id text not null default 'neon-mint' check (char_length(skin_id) between 1 and 40),
  rating integer not null default 1000 check (rating between 0 and 100000),
  league_id text not null default 'bronze' check (
    league_id in ('bronze', 'silver', 'gold', 'platinum', 'diamond', 'master')
  ),
  profile_level integer not null default 1 check (profile_level between 1 and 50),
  current_streak integer not null default 0 check (current_streak >= 0),
  total_games integer not null default 0 check (total_games >= 0),
  total_eliminations integer not null default 0 check (total_eliminations >= 0),
  best_score numeric not null default 0 check (best_score >= 0),
  best_mass numeric not null default 0 check (best_mass >= 0),
  wins integer not null default 0 check (wins >= 0),
  is_public boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.snake_arena_public_matches (
  match_id text primary key check (char_length(match_id) between 3 and 80),
  user_id uuid not null references auth.users(id) on delete cascade,
  player_id text not null check (char_length(player_id) between 3 and 32),
  nickname text not null check (char_length(nickname) between 1 and 24),
  score numeric not null default 0 check (score >= 0),
  rank integer not null default 1 check (rank >= 1),
  total_competitors integer not null default 1 check (total_competitors >= 1),
  maximum_mass numeric not null default 0 check (maximum_mass >= 0),
  eliminations integer not null default 0 check (eliminations >= 0),
  elapsed_time numeric not null default 0 check (elapsed_time >= 0),
  rating_after integer not null default 1000 check (rating_after >= 0),
  league_id text not null default 'bronze' check (
    league_id in ('bronze', 'silver', 'gold', 'platinum', 'diamond', 'master')
  ),
  medal_icon text not null default '🎮' check (char_length(medal_icon) between 1 and 8),
  medal_name text not null default 'Competidor' check (char_length(medal_name) between 1 and 48),
  played_at timestamptz not null,
  is_public boolean not null default true,
  updated_at timestamptz not null default now()
);

create index if not exists snake_arena_public_profiles_rating_idx
  on public.snake_arena_public_profiles (rating desc, best_score desc);

create index if not exists snake_arena_public_profiles_nickname_idx
  on public.snake_arena_public_profiles (lower(nickname));

create index if not exists snake_arena_public_matches_played_idx
  on public.snake_arena_public_matches (played_at desc);

create index if not exists snake_arena_public_matches_player_idx
  on public.snake_arena_public_matches (player_id, played_at desc);

alter table public.snake_arena_public_profiles enable row level security;
alter table public.snake_arena_public_matches enable row level security;

-- PERFIS: leitura pública apenas de perfis visíveis; proprietário também enxerga o próprio perfil oculto.
drop policy if exists "snake_arena_public_profiles_read" on public.snake_arena_public_profiles;
create policy "snake_arena_public_profiles_read"
  on public.snake_arena_public_profiles
  for select
  to anon, authenticated
  using (
    is_public = true
    or ((select auth.uid()) is not null and (select auth.uid()) = user_id)
  );

drop policy if exists "snake_arena_public_profiles_insert_own" on public.snake_arena_public_profiles;
create policy "snake_arena_public_profiles_insert_own"
  on public.snake_arena_public_profiles
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "snake_arena_public_profiles_update_own" on public.snake_arena_public_profiles;
create policy "snake_arena_public_profiles_update_own"
  on public.snake_arena_public_profiles
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "snake_arena_public_profiles_delete_own" on public.snake_arena_public_profiles;
create policy "snake_arena_public_profiles_delete_own"
  on public.snake_arena_public_profiles
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- PARTIDAS: leitura pública somente de registros visíveis; escrita apenas da própria conta.
drop policy if exists "snake_arena_public_matches_read" on public.snake_arena_public_matches;
create policy "snake_arena_public_matches_read"
  on public.snake_arena_public_matches
  for select
  to anon, authenticated
  using (
    is_public = true
    or ((select auth.uid()) is not null and (select auth.uid()) = user_id)
  );

drop policy if exists "snake_arena_public_matches_insert_own" on public.snake_arena_public_matches;
create policy "snake_arena_public_matches_insert_own"
  on public.snake_arena_public_matches
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "snake_arena_public_matches_update_own" on public.snake_arena_public_matches;
create policy "snake_arena_public_matches_update_own"
  on public.snake_arena_public_matches
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "snake_arena_public_matches_delete_own" on public.snake_arena_public_matches;
create policy "snake_arena_public_matches_delete_own"
  on public.snake_arena_public_matches
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

grant select on public.snake_arena_public_profiles to anon, authenticated;
grant insert, update, delete on public.snake_arena_public_profiles to authenticated;

grant select on public.snake_arena_public_matches to anon, authenticated;
grant insert, update, delete on public.snake_arena_public_matches to authenticated;

comment on table public.snake_arena_public_profiles is
  'Perfis comunitários públicos do Snake Arena, com escrita limitada ao proprietário por RLS.';

comment on table public.snake_arena_public_matches is
  'Partidas recentes compartilhadas pela comunidade, com escrita limitada ao proprietário por RLS.';
