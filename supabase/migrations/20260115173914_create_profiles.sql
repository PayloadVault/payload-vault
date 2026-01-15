create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamptz default now(),
  username text unique,
  full_name text,
  profile_image_url text,
  email text,

  constraint username_length check (char_length(username) >= 3)
);

alter table public.profiles enable row level security;

create policy "Users can view own profile" 
on public.profiles for select 
using ( (select auth.uid()) = id );

create policy "Users can update own profile" 
on public.profiles for update 
using ( (select auth.uid()) = id );

-- Function to handle the metadata from Auth and put it into Profiles
create or replace function public.handle_new_user()
returns trigger 
language plpgsql 
security definer 
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, profile_image_url, email)
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'profile_image_url',
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();