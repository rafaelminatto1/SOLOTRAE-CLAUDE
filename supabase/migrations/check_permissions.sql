-- Check current permissions for anon and authenticated roles
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;

-- Grant basic permissions to anon role (for public access)
GRANT SELECT ON users TO anon;
GRANT SELECT ON patients TO anon;
GRANT SELECT ON physiotherapists TO anon;
GRANT SELECT ON exercises TO anon;

-- Grant full permissions to authenticated role
GRANT ALL PRIVILEGES ON users TO authenticated;
GRANT ALL PRIVILEGES ON patients TO authenticated;
GRANT ALL PRIVILEGES ON physiotherapists TO authenticated;
GRANT ALL PRIVILEGES ON appointments TO authenticated;
GRANT ALL PRIVILEGES ON exercises TO authenticated;
GRANT ALL PRIVILEGES ON treatment_plans TO authenticated;
GRANT ALL PRIVILEGES ON treatment_plan_exercises TO authenticated;
GRANT ALL PRIVILEGES ON exercise_logs TO authenticated;
GRANT ALL PRIVILEGES ON notifications TO authenticated;
GRANT ALL PRIVILEGES ON files TO authenticated;
GRANT ALL PRIVILEGES ON messages TO authenticated;
GRANT ALL PRIVILEGES ON artifacts TO authenticated;
GRANT ALL PRIVILEGES ON artifact_versions TO authenticated;
GRANT ALL PRIVILEGES ON collaborations TO authenticated;
GRANT ALL PRIVILEGES ON data_uploads TO authenticated;
GRANT ALL PRIVILEGES ON projects TO authenticated;

-- Grant sequence permissions for auto-increment fields
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;