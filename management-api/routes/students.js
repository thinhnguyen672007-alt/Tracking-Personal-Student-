const db = require('../config/db');
const express = require("express");
const router = express.Router();

const Student = {
    findAll : async () => {
        const [rows] = await db.query(
            `select *, (total_sessions - used_sessions) as remaining_session
            from students order by create_at DESC `
        )
        return rows;
    },

    findById : async () => {
        const [rows] = await db.query(
            `select s.*, (total_sessions - used_sessions) as remaining_session,
            t.day_of_week, t.start_time, t.end_time
            from students s
            left join time_slots t
            on t.student_id = s.id
            where s.id = ?`, [id]
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
module.exports = router; 
