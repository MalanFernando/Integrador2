-- Migration: Add motivo_oculto and motivo_eliminado columns to eventos table
-- Run this on existing databases

ALTER TABLE eventos ADD COLUMN IF NOT EXISTS motivo_oculto TEXT;
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS motivo_eliminado TEXT;
