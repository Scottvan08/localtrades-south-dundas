-- BuiltLocal live SMS test provider
-- 1. Run supabase/schema.sql first.
-- 2. Replace +1YOURCELLPHONE with your verified cellphone number in E.164 format.
-- 3. Use this only for opted-in test numbers.

insert into providers (
  business_name,
  sms_number,
  contact_name,
  categories,
  towns_served,
  serves_all_sdg,
  accepts_leads,
  paused,
  priority
)
values (
  'BuiltLocal Test Provider',
  '+1YOURCELLPHONE',
  'Test Provider',
  array['Roofing', 'Plumbing', 'General Contractor', 'Septic Services'],
  array['Morrisburg', 'Iroquois', 'Cornwall', 'Ingleside', 'Alexandria'],
  true,
  true,
  false,
  100
)
on conflict (sms_number) do update set
  business_name = excluded.business_name,
  contact_name = excluded.contact_name,
  categories = excluded.categories,
  towns_served = excluded.towns_served,
  serves_all_sdg = excluded.serves_all_sdg,
  accepts_leads = true,
  paused = false,
  priority = excluded.priority;
