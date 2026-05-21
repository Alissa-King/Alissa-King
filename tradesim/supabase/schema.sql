-- ============================================================
-- TradeSim schema — paste into Supabase SQL editor and Run All
-- ============================================================

-- Players (mirrors auth.users)
create table if not exists users (
  id uuid references auth.users primary key,
  username text unique not null,
  avatar_url text,
  created_at timestamptz default now()
);

-- Virtual portfolio per user — starts at $100,000
create table if not exists portfolios (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) unique not null,
  balance numeric not null default 100000,
  updated_at timestamptz default now()
);

-- Every trade placed
create table if not exists trades (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) not null,
  asset text not null,         -- e.g. 'BTC/USD', 'AAPL'
  direction text not null      check (direction in ('long', 'short')),
  amount numeric not null      check (amount > 0),   -- USD allocated
  entry_price numeric not null,
  exit_price numeric,
  pnl numeric default 0,
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz default now(),
  closed_at timestamptz
);

-- Bot price history for momentum MA calculation
create table if not exists price_history (
  id uuid default gen_random_uuid() primary key,
  asset text not null,
  price numeric not null,
  recorded_at timestamptz default now()
);

-- Keep price_history lean — only last 100 rows per asset
create or replace function prune_price_history()
returns trigger language plpgsql as $$
begin
  delete from price_history
  where asset = new.asset
    and id not in (
      select id from price_history
      where asset = new.asset
      order by recorded_at desc
      limit 100
    );
  return null;
end;
$$;

create trigger trg_prune_price_history
  after insert on price_history
  for each row execute function prune_price_history();

-- Leaderboard view — auto-calculates % return
create or replace view leaderboard as
  select
    u.username,
    u.id as user_id,
    p.balance,
    round(((p.balance - 100000) / 100000) * 100, 2) as pct_return,
    count(t.id) filter (where t.status = 'closed') as total_trades,
    coalesce(sum(t.pnl) filter (where t.pnl > 0 and t.status = 'closed'), 0) as winning_pnl,
    count(t.id) filter (where t.pnl > 0 and t.status = 'closed') as wins
  from users u
  join portfolios p on p.user_id = u.id
  left join trades t on t.user_id = u.id
  group by u.username, u.id, p.balance
  order by pct_return desc;

-- Auto-create user profile + portfolio on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;

  insert into public.portfolios (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Enable Row Level Security
alter table users enable row level security;
alter table portfolios enable row level security;
alter table trades enable row level security;
alter table price_history enable row level security;

-- RLS policies: users see their own data; leaderboard view is public
create policy "users: read own" on users for select using (auth.uid() = id);
create policy "users: update own" on users for update using (auth.uid() = id);
create policy "portfolios: read own" on portfolios for select using (auth.uid() = user_id);
create policy "portfolios: update own" on portfolios for update using (auth.uid() = user_id);
create policy "trades: read own" on trades for select using (auth.uid() = user_id);
create policy "trades: insert own" on trades for insert with check (auth.uid() = user_id);
create policy "trades: update own" on trades for update using (auth.uid() = user_id);
create policy "price_history: read all" on price_history for select using (true);
create policy "price_history: service insert" on price_history for insert with check (true);
