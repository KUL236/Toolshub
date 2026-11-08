# Refer & Earn setup

The page works as soon as it is deployed: signed-in users get a personal link and can share it.
To **count** the friends who join, create the `referrals` table once in Supabase (SQL editor):

```sql
create table public.referrals (
  id uuid default gen_random_uuid() primary key,
  referrer_code text not null,                                   -- first 8 chars of the referrer's user id, upper case
  referred_user_id uuid not null unique references auth.users(id) on delete cascade,  -- one referral per new user
  created_at timestamptz default now()
);

alter table public.referrals enable row level security;

-- A new user can record that THEY were referred, but never by their own code
create policy "record own referral" on public.referrals for insert to authenticated
  with check (
    referred_user_id = auth.uid()
    and referrer_code <> upper(substr(replace(auth.uid()::text, '-', ''), 1, 8))
  );

-- A referrer can only see (and count) the rows that used their own code
create policy "see own referrals" on public.referrals for select to authenticated
  using (referrer_code = upper(substr(replace(auth.uid()::text, '-', ''), 1, 8)));
```

## What the rules protect
- Self-referral: blocked by the insert policy.
- Double counting: `referred_user_id` is unique, so a user can only ever be counted once.
- Privacy: users can only read rows that used *their* code.
- Only accounts created in the last 48 hours are recorded (checked in `js/referral.js`).

## Rewards (please read)
The rewards on the page are placeholders in `js/referral.js` (`TIERS`). **Nothing is delivered automatically.**
ToolHub Pro is still "Coming Soon", so the defaults say "applied when Pro launches".
Edit `TIERS` to promise only what you can deliver. To see who qualifies, query in Supabase:

```sql
select referrer_code, count(*) as friends from public.referrals group by 1 order by 2 desc;
```

## Known limits
Attribution is per browser: if a friend opens the link on one device and signs up on another, it is not counted.
This is a deliberate trade-off of keeping everything on your existing Supabase setup, with no extra server code.
