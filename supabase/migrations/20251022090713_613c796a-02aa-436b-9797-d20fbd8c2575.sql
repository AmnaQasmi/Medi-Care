-- Add demographics to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS age integer,
ADD COLUMN IF NOT EXISTS gender text;

-- Add prescription and meet link to appointments
ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS prescription text,
ADD COLUMN IF NOT EXISTS meet_link text;