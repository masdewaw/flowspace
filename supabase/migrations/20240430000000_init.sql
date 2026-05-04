-- PROFILES (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null,
  email text not null,
  avatar_url text,
  color text default '#5B6AF0',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- WORKSPACES
create table public.workspaces (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null,
  owner_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now()
);

-- WORKSPACE MEMBERS
create table public.workspace_members (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role text check (role in ('owner','admin','member','viewer')) default 'member',
  joined_at timestamptz default now(),
  unique(workspace_id, user_id)
);

-- PROJECTS
create table public.projects (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  name text not null,
  description text,
  color text default '#5B6AF0',
  icon text default 'folder',
  columns jsonb default '[
    {"id":"backlog","title":"Backlog","order":0,"wip_limit":null,"color":null},
    {"id":"todo","title":"To Do","order":1,"wip_limit":null,"color":null},
    {"id":"in-progress","title":"In Progress","order":2,"wip_limit":3,"color":"#5B6AF0"},
    {"id":"review","title":"Review","order":3,"wip_limit":null,"color":"#F59E0B"},
    {"id":"done","title":"Done","order":4,"wip_limit":null,"color":"#10B981"}
  ]',
  labels jsonb default '[]',
  current_sprint_id uuid,
  health_score integer default 100,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- PROJECT MEMBERS
create table public.project_members (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role text check (role in ('lead','member','viewer')) default 'member',
  capacity integer default 100,
  mood text check (mood in ('great','good','okay','struggling')),
  unique(project_id, user_id)
);

-- SPRINTS
create table public.sprints (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade,
  name text not null,
  goal text,
  start_date date,
  end_date date,
  status text check (status in ('planning','active','completed')) default 'planning',
  velocity integer default 0,
  retrospective jsonb,
  created_at timestamptz default now()
);

-- TASKS
create table public.tasks (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade,
  sprint_id uuid references public.sprints(id) on delete set null,
  parent_id uuid references public.tasks(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'backlog',
  priority text check (priority in ('critical','high','medium','low')) default 'medium',
  type text check (type in ('feature','bug','chore','research')) default 'feature',
  assignee_ids uuid[] default '{}',
  labels text[] default '{}',
  story_points integer,
  due_date date,
  start_date date,
  order_index integer default 0,
  completed_at timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- COMMENTS
create table public.comments (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references public.tasks(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ACTIVITY LOG
create table public.activities (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete set null,
  user_id uuid references public.profiles(id),
  action text not null,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- ENABLE RLS
alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.sprints enable row level security;
alter table public.tasks enable row level security;
alter table public.comments enable row level security;
alter table public.activities enable row level security;

-- POLICIES

-- Profiles: Anyone can view profiles, only owner can update
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Workspaces: Members can view, owners can manage
create policy "Workspace members can view workspace" on public.workspaces for select using (
  exists (select 1 from public.workspace_members where workspace_id = public.workspaces.id and user_id = auth.uid())
);
create policy "Owners can update workspace" on public.workspaces for update using (owner_id = auth.uid());

-- Workspace Members: Members can view each other
create policy "Members can view workspace members" on public.workspace_members for select using (
  exists (select 1 from public.workspace_members where workspace_id = public.workspace_members.workspace_id and user_id = auth.uid())
);

-- Projects: Workspace members can view projects, project members can manage
create policy "Workspace members can view projects" on public.projects for select using (
  exists (select 1 from public.workspace_members where workspace_id = public.projects.workspace_id and user_id = auth.uid())
);

-- Tasks: Project members can view and manage
create policy "Project members can view tasks" on public.tasks for select using (
  project_id in (select project_id from public.project_members where user_id = auth.uid())
);
create policy "Project members can insert tasks" on public.tasks for insert with check (
  project_id in (select project_id from public.project_members where user_id = auth.uid() and role in ('lead', 'member'))
);
create policy "Assignee or lead can update tasks" on public.tasks for update using (
  auth.uid() = any(assignee_ids)
  or project_id in (select project_id from public.project_members where user_id = auth.uid() and role = 'lead')
);

-- Realtime Setup (simplified for migration)
-- Note: Realtime must be enabled via Supabase dashboard or API for specific tables.
