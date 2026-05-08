const db = require("../config/db");

const Student = {
  findAll: async () => {
    const [rows] = await db.query(
      `SELECT *, (total_sessions - used_sessions) AS remaining_sessions
       FROM students ORDER BY created_at DESC`
    );
    return rows;
  },

  findById: async (id) => {   // ← thêm (id) vào đây
    const [rows] = await db.query(
      `SELECT s.*, (s.total_sessions - s.used_sessions) AS remaining_sessions,
        t.day_of_week, t.start_time, t.end_time
       FROM students s
       LEFT JOIN time_slots t ON t.student_id = s.id
       WHERE s.id = ?`, [id]
    );
    return rows[0] || null;
  },

  create: async ({ name, class: cls, phone, parent_name, notes, total_sessions }) => {
    const [result] = await db.query(
      `INSERT INTO students (name, class, phone, parent_name, notes, total_sessions, used_sessions)
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [name, cls, phone || null, parent_name || null, notes || null, total_sessions || 0]
    );
    return result.insertId;
  },

  update: async (id, { name, class: cls, phone, parent_name, notes, total_sessions }) => {
    const [result] = await db.query(
      `UPDATE students SET name=?, class=?, phone=?, parent_name=?, notes=?, total_sessions=?
       WHERE id=?`,
      [name, cls, phone || null, parent_name || null, notes || null, total_sessions, id]
    );
    return result.affectedRows;
  },

  delete: async (id) => {
    const [result] = await db.query("DELETE FROM students WHERE id=?", [id]);
    return result.affectedRows;
  },
};

module.exports = Student;  