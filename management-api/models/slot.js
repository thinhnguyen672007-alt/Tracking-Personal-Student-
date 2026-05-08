const db = require("../config/db");
const express = require('express')
const router = express.Router();

const Slot = {
  findAll: async () => {
    const [rows] = await db.query(
      `SELECT t.*, s.name AS student_name, s.class AS student_class,
        (s.total_sessions - s.used_sessions) AS remaining_sessions
       FROM time_slots t
       LEFT JOIN students s ON s.id = t.student_id
       ORDER BY FIELD(t.day_of_week,
         'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'),
         t.start_time`
    );
    return rows;
  },

  findFree: async () => {
    const [rows] = await db.query(
      `SELECT * FROM time_slots WHERE is_assigned = 0
       ORDER BY FIELD(day_of_week,
         'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'),
         start_time`
    );
    return rows;
  },

  findAssigned: async () => {
    const [rows] = await db.query(
      `SELECT t.*, s.name AS student_name, s.class AS student_class,
        s.phone AS student_phone, s.parent_name,
        (s.total_sessions - s.used_sessions) AS remaining_sessions
       FROM time_slots t
       INNER JOIN students s ON s.id = t.student_id
       WHERE t.is_assigned = 1
       ORDER BY FIELD(t.day_of_week,
         'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'),
         t.start_time`
    );
    return rows;
  },

  create: async ({ day_of_week, start_time, end_time }) => {
    const [result] = await db.query(
      `INSERT INTO time_slots (day_of_week, start_time, end_time, is_assigned)
       VALUES (?, ?, ?, 0)`,
      [day_of_week, start_time, end_time]
    );
    return result.insertId;
  },

  assign: async (slotId, studentId) => {
    const [result] = await db.query(
      `UPDATE time_slots SET is_assigned = 1, student_id = ?
       WHERE id = ? AND is_assigned = 0`,
      [studentId, slotId]
    );
    return result.affectedRows;
  },

  unassign: async (slotId) => {
    const [result] = await db.query(
      `UPDATE time_slots SET is_assigned = 0, student_id = NULL WHERE id = ?`,
      [slotId]
    );
    return result.affectedRows;
  },

  delete: async (id) => {
    const [result] = await db.query("DELETE FROM time_slots WHERE id = ?", [id]);
    return result.affectedRows;
  },
};

module.exports = Slot;
