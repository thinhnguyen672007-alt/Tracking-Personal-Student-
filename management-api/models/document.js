const db = require('../config/db');

const Document = {
  findAll: async () => {
    const [rows] = await db.query(
      "SELECT * FROM documents ORDER BY class_name, uploaded_at DESC"
    );
    return rows;
  },

  create: async ({ original_name, stored_name, file_size, mime_type, class_name }) => {
    const [result] = await db.query(
      `INSERT INTO documents (original_name, stored_name, file_size, mime_type, class_name)
       VALUES (?, ?, ?, ?, ?)`,
      [original_name, stored_name, file_size, mime_type, class_name]
    );
    return result.insertId;
  },

  delete: async (id) => {
    const [rows] = await db.query("SELECT stored_name FROM documents WHERE id = ?", [id]);
    if (!rows[0]) return null;
    await db.query("DELETE FROM documents WHERE id = ?", [id]);
    return rows[0].stored_name;
  },
};

module.exports = Document;
