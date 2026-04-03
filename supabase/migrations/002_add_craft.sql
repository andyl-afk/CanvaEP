-- CanvaEP — Migration 002
-- Adds craft column to team_members for grouping in the Crew page

alter table team_members add column if not exists craft text;
