-- Migration: Add cedula and ultimo_acceso columns to usuarios table
-- Run this on existing databases

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS cedula VARCHAR(10);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS ultimo_acceso TIMESTAMPTZ NULL;
