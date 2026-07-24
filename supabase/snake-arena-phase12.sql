-- Snake Arena — Fase 12
-- Execute este arquivo no SQL Editor do seu projeto Supabase.
-- Ele usa somente tabelas públicas protegidas por Row Level Security.

create table if not exists public.snake_arena_cloud_saves (
  user_id uuid primary key references auth.users(id) on delete cascade,
  player_id text not null check (char_length(player_id) between 3 and 32),
  save_version integer not null default 1 check (save_version between 1 and 1000),
  save_data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.snake_arena_leaderboard (
  user_id uuid primary key references auth.users(id) on delete cascade,
  player_id text not null check (char_length(player_id) between 3 and 32),
  nickname text not null check (char_length(nickname) between 1 and 24),
  rating integer not null default 1000 check (rating between 0 and 100000),
  league_id text not null default 'bronze' check (
    league_id in ('bronze', 'silver', 'gold', 'platinum', 'diamond', 'master')
  ),
  best_score numeric not null default 0 check (best_score >= 0),
  best_mass numeric not null default 0 check (best_mass >= 0),
  wins integer not null default 0 check (wins >= 0),
  profile_level integer not null default 1 check (profile_level between 1 and 50),
  updated_at timestamptz not null default now()
);

create index if not exists snake_arena_leaderboard_rating_idx
  on public.snake_arena_leaderboard (rating desc, best_score desc);

create index if not exists snake_arena_cloud_saves_updated_idx
  on public.snake_arena_cloud_saves (updated_at desc);

alter table public.snake_arena_cloud_saves enable row level security;
alter table public.snake_arena_leaderboard enable row level security;

-- SAVE PRIVADO: cada usuário autenticado acessa somente a própria linha.
drop policy if exists "snake_arena_cloud_saves_select_own"
  on public.snake_arena_cloud_saves;
create policy "snake_arena_cloud_saves_select_own"
  on public.snake_arena_cloud_saves
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "snake_arena_cloud_saves_insert_own"
  on public.snake_arena_cloud_saves;
create policy "snake_arena_cloud_saves_insert_own"
  on public.snake_arena_cloud_saves
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "snake_arena_cloud_saves_update_own"
  on public.snake_arena_cloud_saves;
create policy "snake_arena_cloud_saves_update_own"
  on public.snake_arena_cloud_saves
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "snake_arena_cloud_saves_delete_own"
  on public.snake_arena_cloud_saves;
create policy "snake_arena_cloud_saves_delete_own"
  on public.snake_arena_cloud_saves
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- PLACAR: leitura pública e escrita somente da própria linha autenticada.
drop policy if exists "snake_arena_leaderboard_public_read"
  on public.snake_arena_leaderboard;
create policy "snake_arena_leaderboard_public_read"
  on public.snake_arena_leaderboard
  for select
  to anon, authenticated
  using (true);

drop policy if exists "snake_arena_leaderboard_insert_own"
  on public.snake_arena_leaderboard;
create policy "snake_arena_leaderboard_insert_own"
  on public.snake_arena_leaderboard
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "snake_arena_leaderboard_update_own"
  on public.snake_arena_leaderboard;
create policy "snake_arena_leaderboard_update_own"
  on public.snake_arena_leaderboard
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "snake_arena_leaderboard_delete_own"
  on public.snake_arena_leaderboard;
create policy "snake_arena_leaderboard_delete_own"
  on public.snake_arena_leaderboard
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete
  on public.snake_arena_cloud_saves
  to authenticated;

grant select
  on public.snake_arena_leaderboard
  to anon, authenticated;

grant insert, update, delete
  on public.snake_arena_leaderboard
  to authenticated;

comment on table public.snake_arena_cloud_saves is
  'Save privado do Snake Arena, uma linha por usuário autenticado.';

comment on table public.snake_arena_leaderboard is
  'Placar global comunitário do Snake Arena. Dados são enviados pelo cliente.';
