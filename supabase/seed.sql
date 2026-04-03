-- CanvaEP — Seed data
-- Run after migrations. Truncate first: truncate team_members restart identity cascade;

-- ── Production Studio · Video & Photo ─────────────────────
insert into team_members (name, role, location, type, craft, skills, availability_status) values
('Andy Lloyd',    'Sr. Videographer',    'Sydney', 'internal', 'Video & Photo', '["directing", "cinematography", "Sony FX6", "DJI Ronin"]', 'busy'),
('Jess Edwards',  'Sr. Videographer',    'Sydney', 'internal', 'Video & Photo', '["cinematography", "run-and-gun", "documentary", "social content"]', 'available'),
('Jess Holmes',   'Videographer / Editor','Sydney', 'internal', 'Video & Photo', '["cinematography", "Premiere Pro", "DaVinci Resolve"]', 'available'),
('Reuben Skinner','Sr. Videographer',    'Sydney', 'internal', 'Video & Photo', '[]', 'available'),
('Tammie Joske',  'Sr. Photographer',    'Sydney', 'internal', 'Video & Photo', '[]', 'available');

-- ── Production Studio · Motion ────────────────────────────
insert into team_members (name, role, location, type, craft, skills, availability_status) values
('Phillip Tibballs',    'Motion Lead',          'Sydney', 'internal', 'Motion', '["After Effects", "Cinema 4D", "motion graphics"]', 'available'),
('Daniel King',         'Sr. Motion Designer',  'Sydney', 'internal', 'Motion', '["After Effects", "Cinema 4D", "3D animation"]', 'available'),
('Mika David',          'Sr. Motion Designer',  'Sydney', 'internal', 'Motion', '[]', 'available'),
('Minjoo Shin',         'Sr. Motion Designer',  'Sydney', 'internal', 'Motion', '[]', 'available'),
('Sai Lo',              'Sr. Motion Designer',  'Sydney', 'internal', 'Motion', '[]', 'available'),
('Sean Pointing',       'Motion Designer',      'Sydney', 'internal', 'Motion', '["After Effects", "Cinema 4D"]', 'available'),
('Em Barriga',          'Motion Designer',      'Sydney', 'internal', 'Motion', '[]', 'available'),
('Jenny Gernale',       'Motion Designer',      'Sydney', 'internal', 'Motion', '[]', 'available'),
('Kat Agapito',         'Motion Designer',      'Sydney', 'internal', 'Motion', '[]', 'available'),
('Kristen Uy',          'Motion Designer',      'Sydney', 'internal', 'Motion', '[]', 'available'),
('Martin Jarmin',       'Motion Designer',      'Sydney', 'internal', 'Motion', '[]', 'available'),
('Paolo Bautista',      'Motion Designer',      'Sydney', 'internal', 'Motion', '[]', 'available'),
('Ran Busadre',         'Motion Designer',      'Sydney', 'internal', 'Motion', '[]', 'available'),
('Vivi Feng',           'Motion Designer',      'Sydney', 'internal', 'Motion', '[]', 'available'),
('Joshua Noguera',      'Motion Designer',      'Sydney', 'internal', 'Motion', '[]', 'available'),
('Francis Riano',       'Jr. Motion Designer',  'Sydney', 'internal', 'Motion', '[]', 'available'),
('Gelo Basul',          'Jr. Motion Designer',  'Sydney', 'internal', 'Motion', '[]', 'available'),
('Jordi White',         'Jr. Motion Designer',  'Sydney', 'internal', 'Motion', '[]', 'available'),
('Lyra Bertulfo',       'Jr. Motion Designer',  'Sydney', 'internal', 'Motion', '[]', 'available'),
('Marj Zamora',         'Jr. Motion Designer',  'Sydney', 'internal', 'Motion', '[]', 'available'),
('Sean Valencia',       'Jr. Motion Designer',  'Sydney', 'internal', 'Motion', '[]', 'available'),
('Vermeer Crisostomo',  'Jr. Motion Designer',  'Sydney', 'internal', 'Motion', '[]', 'available');

-- ── Production Studio · Producers & Ops ──────────────────
insert into team_members (name, role, location, type, craft, skills, availability_status) values
('Larry Foster',    'Sr. Producer',             'Sydney', 'internal', 'Producers & Ops', '["production management", "budgeting", "scheduling"]', 'busy'),
('Cheska Rey',      'Sr. Producer',             'Sydney', 'internal', 'Producers & Ops', '[]', 'available'),
('Enrie Matutinao', 'Sr. Producer',             'Sydney', 'internal', 'Producers & Ops', '[]', 'available'),
('Katrina Wise',    'Sr. Producer',             'Sydney', 'internal', 'Producers & Ops', '[]', 'available'),
('Georgia Creer',   'Creative Producer',        'Sydney', 'internal', 'Producers & Ops', '["production management", "scheduling", "client liaison"]', 'available'),
('Jameson Fahy',    'Producer',                 'Sydney', 'internal', 'Producers & Ops', '[]', 'available'),
('Elle Buentipo',   'Jr. Producer',             'Sydney', 'internal', 'Producers & Ops', '[]', 'available'),
('Keng Lopez',      'Production Lead',          'Sydney', 'internal', 'Producers & Ops', '[]', 'available'),
('Matt Hodges',     'Post Production Manager',  'Sydney', 'internal', 'Producers & Ops', '[]', 'available'),
('Love Toribio',    'Sr. Content Administrator','Sydney', 'internal', 'Producers & Ops', '[]', 'available'),
('Inna Espiritu',   'Content Administrator',    'Sydney', 'internal', 'Producers & Ops', '[]', 'available'),
('Kimi Cosepe',     'Content Administrator',    'Sydney', 'internal', 'Producers & Ops', '[]', 'available'),
('Perse Escobar',   'Content Administrator',    'Sydney', 'internal', 'Producers & Ops', '[]', 'available'),
('Lex Nocheseda',   'Jr. Content Administrator','Sydney', 'internal', 'Producers & Ops', '[]', 'available');

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
