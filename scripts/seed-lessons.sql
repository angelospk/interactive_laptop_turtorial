-- Seed initial lessons for the 4 existing modules
-- Run with: sqlite3 local.db < scripts/seed-lessons.sql

INSERT INTO lessons (id, module_id, lesson_key, title_key, description_key, difficulty, order_index, created_at)
VALUES 
  -- Module 1: Mouse Skills
  ('module1-complete', 'module1', 'mouse_complete', 'module1_title', 'module1_description', 'intermediate', 1, CURRENT_TIMESTAMP),
  
  -- Module 2: Keyboard Skills
  ('module2-complete', 'module2', 'keyboard_complete', 'module2_title', 'module2_description', 'intermediate', 1, CURRENT_TIMESTAMP),
  
  -- Module 3: Windows Environment
  ('module3-complete', 'module3', 'windows_complete', 'module3_title', 'module3_description', 'intermediate', 1, CURRENT_TIMESTAMP),
  
  -- Module 4: File Management
  ('module4-complete', 'module4', 'file_management_complete', 'module4_title', 'module4_description', 'intermediate', 1, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;
