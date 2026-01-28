import { createClient } from '@libsql/client';

let db = null;

export function getDb() {
  if (!db) {
    db = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return db;
}

// Helper to run queries
export async function query(sql, args = []) {
  const db = getDb();
  const result = await db.execute({ sql, args });
  return result;
}

// Get all requests with optional status filter
export async function getRequests(status = null) {
  const db = getDb();
  if (status) {
    const result = await db.execute({
      sql: 'SELECT * FROM requests WHERE status = ? ORDER BY created_at DESC',
      args: [status]
    });
    return result.rows;
  }
  const result = await db.execute('SELECT * FROM requests ORDER BY created_at DESC');
  return result.rows;
}

// Get single request by ID
export async function getRequest(id) {
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT * FROM requests WHERE id = ?',
    args: [id]
  });
  return result.rows[0] || null;
}

// Create new request from webhook
export async function createRequest(data) {
  const db = getDb();
  const result = await db.execute({
    sql: `INSERT INTO requests (
      writer_name, writer_email, publication,
      request_topic, request_details, deadline, expertise_needed,
      raw_payload
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      data.writer_name || null,
      data.writer_email || null,
      data.publication || null,
      data.request_topic || null,
      data.request_details || null,
      data.deadline || null,
      data.expertise_needed || null,
      JSON.stringify(data.raw_payload || data)
    ]
  });
  return result.lastInsertRowid;
}

// Update request
export async function updateRequest(id, updates) {
  const db = getDb();
  const fields = [];
  const args = [];

  const allowedFields = [
    'status', 'draft_response', 'final_response', 'responded_at', 'notes'
  ];

  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key)) {
      fields.push(`${key} = ?`);
      args.push(value);
    }
  }

  if (fields.length === 0) return null;

  args.push(id);

  const result = await db.execute({
    sql: `UPDATE requests SET ${fields.join(', ')} WHERE id = ?`,
    args
  });

  return result.rowsAffected;
}

// Delete request
export async function deleteRequest(id) {
  const db = getDb();
  const result = await db.execute({
    sql: 'DELETE FROM requests WHERE id = ?',
    args: [id]
  });
  return result.rowsAffected;
}

// Get setting by key
export async function getSetting(key) {
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT value FROM settings WHERE key = ?',
    args: [key]
  });
  return result.rows[0]?.value || null;
}

// Update setting
export async function setSetting(key, value) {
  const db = getDb();
  await db.execute({
    sql: `INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now'))`,
    args: [key, value]
  });
}
