-- ============================================================
-- 0001_init.sql — VIP Earner GH: Laravel → Supabase schema
-- ============================================================
create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- --------------------------------------------------------------
-- ENUMS
-- --------------------------------------------------------------
create type transaction_direction as enum ('+', '-');

create type transaction_type as enum (
  'deposit', 'withdrawal', 'task_reward', 'vip_upgrade',
  'lucky_bag', 'daily_checkin', 'referral_bonus', 'admin_adjustment'
);

create type transaction_status as enum ('pending', 'success', 'failed', 'reversed');

create type withdrawal_channel as enum ('mobile_money', 'bank');

create type withdrawal_status as enum ('pending', 'approved', 'rejected', 'cancelled');

create type notification_type as enum (
  'task_reward', 'deposit', 'withdrawal_update', 'vip_upgrade',
  'lucky_bag', 'daily_checkin', 'referral_bonus', 'announcement',
  'admin_message'
);

-- --------------------------------------------------------------
-- vip_levels (reference table — name stays PK, matches Laravel)
-- --------------------------------------------------------------
create table public.vip_levels (
  name            varchar(20) primary key,       -- 'Intern', 'VIP 1'..'VIP 5'
  sort_order      int not null unique,
  daily_tasks     int not null,
  reward_per_task numeric(8,2) not null,
  upgrade_cost    numeric(10,2),                  -- null for Intern
  color_hex       varchar(7) not null default '#2563EB',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- --------------------------------------------------------------
-- profiles (extends auth.users 1:1 — replaces Laravel `users`)
-- --------------------------------------------------------------
create table public.profiles (
  id                     uuid primary key references auth.users(id) on delete cascade,
  phone                  varchar(20) not null unique,   -- normalized +233 format
  display_name           varchar(80),
  avatar_url             text,
  balance                numeric(12,2) not null default 0 check (balance >= 0),
  total_income           numeric(12,2) not null default 0 check (total_income >= 0),
  daily_revenue          numeric(12,2) not null default 0 check (daily_revenue >= 0),
  monthly_revenue        numeric(12,2) not null default 0 check (monthly_revenue >= 0),
  total_profit           numeric(12,2) not null default 0 check (total_profit >= 0),
  total_withdrawals      numeric(12,2) not null default 0 check (total_withdrawals >= 0),
  work_deposit           numeric(12,2) not null default 0 check (work_deposit >= 0),
  vip_level              varchar(20) not null default 'Intern' references public.vip_levels(name),
  vip_upgraded_at        timestamptz,
  referral_code          varchar(12) not null unique,
  referred_by            uuid references public.profiles(id),
  last_checkin           date,
  checkin_streak         smallint not null default 0 check (checkin_streak between 0 and 7),
  last_lucky_bag         timestamptz,
  is_admin               boolean not null default false,
  is_banned              boolean not null default false,
  ban_reason             text,
  failed_login_attempts  smallint not null default 0,
  locked_until           timestamptz,
  last_login_at          timestamptz,
  last_login_ip          varchar(45),
  deleted_at             timestamptz,               -- soft delete; filter explicitly
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index idx_profiles_referred_by on public.profiles(referred_by);
create index idx_profiles_vip_level on public.profiles(vip_level);
create index idx_profiles_referral_code on public.profiles(referral_code);
create index idx_profiles_phone on public.profiles(phone);

-- --------------------------------------------------------------
-- tasks
-- --------------------------------------------------------------
create table public.tasks (
  id             uuid primary key default gen_random_uuid(),
  title          varchar(255) not null default 'Engagement Task',
  description    text,
  facebook_url   text not null,
  reward         numeric(8,2) not null,
  wait_seconds   int not null default 15,
  is_active      boolean not null default true,
  min_vip_sort   int not null default 0,
  display_order  int not null default 0,
  created_by     uuid references public.profiles(id),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index idx_tasks_active_order on public.tasks(is_active, display_order);

-- --------------------------------------------------------------
-- task_sessions
-- --------------------------------------------------------------
create table public.task_sessions (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.profiles(id) on delete cascade,
  task_id             uuid not null references public.tasks(id) on delete cascade,
  started_at          timestamptz not null default now(),
  tab_active_seconds  int not null default 0,
  completed           boolean not null default false,
  expires_at          timestamptz not null default (now() + interval '2 hours'),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index idx_task_sessions_user_completed_expires
  on public.task_sessions(user_id, completed, expires_at);

-- --------------------------------------------------------------
-- task_logs
-- --------------------------------------------------------------
create table public.task_logs (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  task_id        uuid not null references public.tasks(id) on delete cascade,
  session_id     uuid not null references public.task_sessions(id) on delete cascade,
  reward_earned  numeric(8,2) not null,
  completed_at   timestamptz not null default now(),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index idx_task_logs_user_completed_at on public.task_logs(user_id, completed_at);

-- --------------------------------------------------------------
-- transactions (Laravel: $timestamps = false — only created_at)
-- --------------------------------------------------------------
create table public.transactions (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references public.profiles(id) on delete cascade,
  amount               numeric(12,2) not null,
  direction            transaction_direction not null,
  type                 transaction_type not null,
  status               transaction_status not null default 'pending',
  paystack_reference   varchar(100) unique,
  metadata             jsonb,
  admin_id             uuid references public.profiles(id),
  created_at           timestamptz not null default now()
);

create index idx_transactions_user_status on public.transactions(user_id, status);
create index idx_transactions_status_created on public.transactions(status, created_at);
create index idx_transactions_type on public.transactions(type);

-- --------------------------------------------------------------
-- withdrawals
-- --------------------------------------------------------------
create table public.withdrawals (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  amount          numeric(12,2) not null,
  channel         withdrawal_channel not null,
  details         jsonb not null,
  status          withdrawal_status not null default 'pending',
  admin_note      text,
  reviewed_by     uuid references public.profiles(id),
  reviewed_at     timestamptz,
  transaction_id  uuid references public.transactions(id),
  created_at      timestamptz not null default now()
);

create index idx_withdrawals_status_created on public.withdrawals(status, created_at);
create index idx_withdrawals_user on public.withdrawals(user_id);

-- --------------------------------------------------------------
-- referrals
-- --------------------------------------------------------------
create table public.referrals (
  id             uuid primary key default gen_random_uuid(),
  referrer_id    uuid not null references public.profiles(id) on delete cascade,
  referred_id    uuid not null unique references public.profiles(id) on delete cascade,
  reward_amount  numeric(8,2) not null default 2.00,
  reward_paid    boolean not null default false,
  paid_at        timestamptz,
  created_at     timestamptz not null default now()
);

create index idx_referrals_referrer on public.referrals(referrer_id);

-- --------------------------------------------------------------
-- announcements
-- --------------------------------------------------------------
create table public.announcements (
  id          uuid primary key default gen_random_uuid(),
  title       varchar(255) not null,
  content     text not null,
  banner_url  text,
  is_pinned   boolean not null default false,
  is_active   boolean not null default true,
  created_by  uuid references public.profiles(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- --------------------------------------------------------------
-- notifications
-- --------------------------------------------------------------
create table public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  type        notification_type not null,
  title       varchar(255) not null,
  body        text not null,
  is_read     boolean not null default false,
  metadata    jsonb,
  created_at  timestamptz not null default now()
);

create index idx_notifications_user_read on public.notifications(user_id, is_read);

-- --------------------------------------------------------------
-- audit_log
-- --------------------------------------------------------------
create table public.audit_log (
  id          uuid primary key default gen_random_uuid(),
  admin_id    uuid not null references public.profiles(id) on delete cascade,
  target_id   uuid not null references public.profiles(id) on delete cascade,
  action      varchar(100) not null,
  old_value   jsonb,
  new_value   jsonb,
  reason      text,
  created_at  timestamptz not null default now()
);

create index idx_audit_log_target on public.audit_log(target_id);

-- --------------------------------------------------------------
-- otp_cache (temporary storage for OTP verification)
-- --------------------------------------------------------------
create table public.otp_cache (
  phone      varchar(20) primary key,
  code_hash  text not null,
  expires_at timestamptz not null
);

-- Auto-cleanup expired OTPs
create or replace function public.cleanup_expired_otps()
returns void language sql as $$
  delete from public.otp_cache where expires_at < now();
$$;

-- --------------------------------------------------------------
-- Helper functions for scheduled tasks
-- --------------------------------------------------------------
create or replace function public.reset_all_daily_revenue()
returns void language sql as $$
  update public.profiles set daily_revenue = 0 where daily_revenue != 0;
$$;

create or replace function public.reset_all_monthly_revenue()
returns void language sql as $$
  update public.profiles set monthly_revenue = 0 where monthly_revenue != 0;
$$;

-- --------------------------------------------------------------
-- RLS — enable on every table, deny-by-default.
-- All access goes through Edge Functions using service_role,
-- which bypasses RLS. No policies granted to anon/authenticated.
-- --------------------------------------------------------------
alter table public.vip_levels     enable row level security;
alter table public.profiles       enable row level security;
alter table public.tasks          enable row level security;
alter table public.task_sessions  enable row level security;
alter table public.task_logs      enable row level security;
alter table public.transactions   enable row level security;
alter table public.withdrawals    enable row level security;
alter table public.referrals      enable row level security;
alter table public.announcements  enable row level security;
alter table public.notifications  enable row level security;
alter table public.audit_log      enable row level security;
alter table public.otp_cache      enable row level security;

-- --------------------------------------------------------------
-- Seed: vip_levels (exact values from Laravel VipLevelSeeder)
-- --------------------------------------------------------------
insert into public.vip_levels (name, sort_order, daily_tasks, reward_per_task, upgrade_cost, color_hex) values
  ('Intern', 0,  5,  0.20, null,   '#64748B'),
  ('VIP 1',  1,  10, 0.50, 10.00,  '#3B82F6'),
  ('VIP 2',  2,  20, 1.00, 25.00,  '#8B5CF6'),
  ('VIP 3',  3,  35, 1.80, 50.00,  '#F59E0B'),
  ('VIP 4',  4,  55, 2.80, 100.00, '#EF4444'),
  ('VIP 5',  5,  80, 4.00, 200.00, '#10B981')
on conflict (name) do update set
  sort_order = excluded.sort_order,
  daily_tasks = excluded.daily_tasks,
  reward_per_task = excluded.reward_per_task,
  upgrade_cost = excluded.upgrade_cost,
  color_hex = excluded.color_hex;

-- --------------------------------------------------------------
-- Storage buckets
-- --------------------------------------------------------------
insert into storage.buckets (id, name, public) values
  ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public) values
  ('announcements', 'announcements', true)
on conflict (id) do nothing;
