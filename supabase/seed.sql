-- CanvaEP — Seed data
-- Run after migrations. Truncate first if re-seeding internal crew only.

-- ── Production Studio · Video & Photo ─────────────────────
insert into team_members (name, role, location, type, craft, skills, availability_status) values
('André Rodrigues', 'Video / AD',       'Sydney', 'internal', 'Video & Photo', '[]', 'available'),
('Christian Love',  'Sr. Videographer', 'Sydney', 'internal', 'Video & Photo', '[]', 'available'),
('Paige Cooper',    'Content Creator',  'Sydney', 'internal', 'Video & Photo', '[]', 'available'),
('Chloe Adams',     'Content Creator',  'Sydney', 'internal', 'Video & Photo', '[]', 'available');

-- ── Production Studio · Motion ────────────────────────────
insert into team_members (name, role, location, type, craft, skills, availability_status) values
('Dan King',      'Principal Motion Designer', 'Sydney',    'internal', 'Motion', '[]', 'available'),
('Steph Lee',     'Motion Designer',           'Sydney',    'internal', 'Motion', '[]', 'available'),
('Sean Pointing', 'Sr. Motion Designer',       'Sydney',    'internal', 'Motion', '[]', 'available'),
('Lyra Bertulfo', 'Jr. Motion Designer',       'Sydney',    'internal', 'Motion', '[]', 'available'),
('Sai Lo',        'Sr. Motion Designer',        'Manila',   'internal', 'Motion', '[]', 'available'),
('Sean Valencia', 'Motion Designer',            'Manila',   'internal', 'Motion', '[]', 'available'),
('Em Barriga',    'Sr. Motion Designer',        'Manila',   'internal', 'Motion', '[]', 'available'),
('Francis Riano', 'Motion Designer',            'Manila',   'internal', 'Motion', '[]', 'available'),
('Kristen Uy',    'Motion Designer',            'Manila',   'internal', 'Motion', '[]', 'available');

-- ── Production Studio · Producers & Ops ──────────────────
insert into team_members (name, role, location, type, craft, skills, availability_status) values
('Georgia Creer',   'Sr. Producer',        'Sydney',    'internal', 'Producers & Ops', '["production management", "scheduling", "client liaison"]', 'available'),
('Lily McGann',     'Producer',            'Sydney',    'internal', 'Producers & Ops', '[]', 'available'),
('Alissa Prcevich', 'Sr. Program Manager', 'Sydney',    'internal', 'Producers & Ops', '[]', 'available'),
('Adamo Gargano',   'Program Manager',     'Melbourne', 'internal', 'Producers & Ops', '[]', 'available'),
('Nicole Chua',     'Program Manager',     'Manila',    'internal', 'Producers & Ops', '[]', 'available'),
('Elle Buentipo',   'Producer',            'Manila',    'internal', 'Producers & Ops', '[]', 'available'),
('Ellaine Llave',   'Sr. Program Manager', 'Manila',    'internal', 'Producers & Ops', '[]', 'available');

-- ── External freelancer pool ──────────────────────────────
insert into team_members (name, role, location, type, craft, skills, availability_status, day_rate, company, notes) values
('Sherry',  'Art director',      'Sydney', 'external', 'Art Direction', '["art direction", "set design", "lifestyle photography", "prop styling"]', 'available',   850, 'Freelance',                'Knows Canva brand well. Great with office and lifestyle setups.'),
('Tomoko',  'DP',                'Sydney', 'external', 'Camera',        '["cinematography", "documentary", "natural light", "Sony Venice", "ARRI"]',  'tentative',   950, 'Freelance',                'Strong doc-style shooter. Good with real people.'),
('Ravi',    'Sound recordist',   'Sydney', 'external', 'Sound',         '["location sound", "boom operation", "run-and-gun", "Zaxcom"]',              'available',   650, 'Freelance',                'Reliable. Works fast. Great on run-and-gun shoots.'),
('Claire',  'Freelance producer','Sydney', 'external', 'Production',    '["production management", "budgeting", "logistics"]',                        'unavailable', 900, 'Bright Frame Productions', 'Used for larger external productions.');

-- ── External history ──────────────────────────────────────
with sherry as (select id from team_members where name = 'Sherry' and type = 'external' limit 1)
insert into external_history (team_member_id, project_name, shoot_date, rating, producer_notes)
select sherry.id, project_name, shoot_date::date, rating, notes
from sherry, (values
  ('Canva Brand Campaign 2024',        '2024-08-15', 5, 'Excellent work on set design. Really understood the brand aesthetic.'),
  ('Canva for Work — office lifestyle','2024-10-20', 5, 'Nailed the brief. Styled beautifully.'),
  ('Canva AI launch — product hero',   '2024-12-05', 4, 'Great collaboration with the team.'),
  ('Canva Enterprise 2023',            '2023-09-10', 5, 'First project together — instantly on brand.'),
  ('Canva Teams — lifestyle series',   '2023-11-22', 5, 'Standout work.'),
  ('Canva Education campaign',         '2024-03-14', 4, 'Solid. Would book again.')
) as t(project_name, shoot_date, rating, notes);

with tomoko as (select id from team_members where name = 'Tomoko' and type = 'external' limit 1)
insert into external_history (team_member_id, project_name, shoot_date, rating, producer_notes)
select tomoko.id, project_name, shoot_date::date, rating, notes
from tomoko, (values
  ('Canva Founders Documentary',          '2024-07-01', 5, 'Stunning handheld work. Captured the authenticity of the subject.'),
  ('Canva Creators — behind the scenes',  '2024-09-18', 5, 'Incredible eye. Would be our first call for any doc-style shoot.'),
  ('Canva Culture campaign',              '2024-11-30', 4, 'Great results under tight schedule.')
) as t(project_name, shoot_date, rating, notes);

with ravi as (select id from team_members where name = 'Ravi' and type = 'external' limit 1)
insert into external_history (team_member_id, project_name, shoot_date, rating, producer_notes)
select ravi.id, project_name, shoot_date::date, rating, notes
from ravi, (values
  ('Canva Brand Campaign 2024',        '2024-08-15', 5, 'Rock solid on location. No issues.'),
  ('Canva for Work — office lifestyle','2024-10-20', 5, 'Fast setup, great results.'),
  ('Canva Founders Documentary',       '2024-07-01', 5, 'Exceptional on a demanding multi-day shoot.'),
  ('Canva AI launch — product hero',   '2024-12-05', 4, 'Good work throughout.')
) as t(project_name, shoot_date, rating, notes);

with claire as (select id from team_members where name = 'Claire' and type = 'external' limit 1)
insert into external_history (team_member_id, project_name, shoot_date, rating, producer_notes)
select claire.id, project_name, shoot_date::date, rating, notes
from claire, (values
  ('Canva Enterprise Summit 2024','2024-05-20', 4, 'Managed a large multi-location production well.'),
  ('Canva APAC event film',       '2024-09-30', 4, 'Strong logistics. Would use again for larger productions.')
) as t(project_name, shoot_date, rating, notes);
