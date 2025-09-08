/**
 * Admin routes
 */
import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { database } from '../database/config.js';

const router = express.Router();

/**
 * @route POST /api/admin/clear-sample-data
 * @description Clears all sample data from the database, leaving only the main admin user.
 * @access Private (Admin only)
 */
router.post('/clear-sample-data', authenticateToken, requireAdmin, async (req, res) => {
  console.log('Received request to clear sample data.');
  try {
    // The order is important to respect foreign key constraints if ON DELETE CASCADE is not used everywhere.
    // Starting with tables that depend on others.

    console.log('Deleting from treatment_plan_exercises...');
    await database.run(`DELETE FROM treatment_plan_exercises;`);

    console.log('Deleting from exercise_logs...');
    await database.run(`DELETE FROM exercise_logs;`);

    console.log('Deleting from appointments...');
    await database.run(`DELETE FROM appointments;`);

    console.log('Deleting from treatment_plans...');
    await database.run(`DELETE FROM treatment_plans;`);

    console.log('Deleting from exercises...');
    await database.run(`DELETE FROM exercises;`);

    console.log('Deleting from notifications...');
    await database.run(`DELETE FROM notifications;`);

    console.log('Deleting from files...');
    await database.run(`DELETE FROM files;`);

    console.log('Deleting from patients...');
    await database.run(`DELETE FROM patients;`);

    console.log('Deleting from physiotherapists...');
    await database.run(`DELETE FROM physiotherapists;`);

    console.log('Deleting non-admin users...');
    await database.run(`DELETE FROM users WHERE role != 'admin';`);
    
    // Reset autoincrement counters for cleanliness
    console.log('Resetting autoincrement sequences...');
    const tablesToReset = ['users', 'patients', 'physiotherapists', 'appointments', 'exercises', 'treatment_plans', 'treatment_plan_exercises', 'exercise_logs', 'notifications', 'files'];
    for (const table of tablesToReset) {
        // For sqlite, deleting from sqlite_sequence resets autoincrement
        await database.run(`DELETE FROM sqlite_sequence WHERE name = ?;`, [table]);
    }

    console.log('Sample data cleared successfully.');
    res.status(200).json({ message: 'Todos os dados de exemplo foram apagados com sucesso. O usuário administrador foi preservado.' });

  } catch (error) {
    console.error('Error clearing sample data:', error);
    res.status(500).json({ error: 'Ocorreu um erro no servidor ao tentar apagar os dados.' });
  }
});

export default router;
