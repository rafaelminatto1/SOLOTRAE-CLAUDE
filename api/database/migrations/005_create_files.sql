-- Create files table for tracking uploaded files
CREATE TABLE IF NOT EXISTS files (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  original_name TEXT NOT NULL,
  filename TEXT NOT NULL,
  mimetype TEXT NOT NULL,
  size INTEGER NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('profile', 'document', 'exercise', 'report')),
  path TEXT NOT NULL,
  url TEXT NOT NULL,
  uploaded_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_files_user_id ON files (user_id);
CREATE INDEX IF NOT EXISTS idx_files_category ON files (category);
CREATE INDEX IF NOT EXISTS idx_files_uploaded_at ON files (uploaded_at);
CREATE INDEX IF NOT EXISTS idx_files_user_category ON files (user_id, category);