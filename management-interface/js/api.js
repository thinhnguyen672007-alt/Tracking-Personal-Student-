// js/api.js — Centralized fetch() wrapper
// Tất cả API calls đi qua đây — không fetch() trực tiếp trong các file khác

const API_BASE = "http://localhost:3000/api";

const api = {
  async get(path) {
    const res = await fetch(`${API_BASE}${path}`);
    return res.json();
  },

  async post(path, body) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.json();
  },

  async put(path, body) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.json();
  },

  async delete(path) {
    const res = await fetch(`${API_BASE}${path}`, { method: "DELETE" });
    return res.json();
  },

  // Special: for file upload (FormData, no Content-Type header)
  async upload(path, formData) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      body: formData,
    });
    return res.json();
  },
};