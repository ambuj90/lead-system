import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// =============================================
// MySQL Connection Pool Configuration
// =============================================
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "lead_system",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// =============================================
// Test Database Connection
// =============================================
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("✅ MySQL Database connected successfully");

    // Test query
    const [rows] = await connection.query("SELECT 1 + 1 AS result");

    connection.release();

    return {
      status: "success",
      message: "Database connection successful",
      test_query_result: rows[0].result,
      database: process.env.DB_NAME,
    };
  } catch (error) {
    console.error("❌ MySQL Database connection failed:", error.message);
    return {
      status: "error",
      message: "Database connection failed",
      error: error.message,
    };
  }
}

// =============================================
// Query Helper Function
// Execute parameterized queries safely
// =============================================
export async function query(sql, params = []) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error("Database query error:", error.message);
    console.error("SQL:", sql);
    console.error("Params:", params);
    throw error;
  }
}

// =============================================
// Transaction Helper
// For multiple queries that must succeed/fail together
// =============================================
export async function transaction(callback) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Execute the callback with connection
    const result = await callback(connection);

    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    console.error("Transaction failed:", error.message);
    throw error;
  } finally {
    connection.release();
  }
}

// =============================================
// Insert Helper
// Returns inserted ID
// =============================================
export async function insert(table, data) {
  const columns = Object.keys(data).join(", ");
  const placeholders = Object.keys(data)
    .map(() => "?")
    .join(", ");
  const values = Object.values(data);

  const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;

  try {
    const [result] = await pool.execute(sql, values);
    return result.insertId;
  } catch (error) {
    console.error("Insert error:", error.message);
    console.error("Table:", table);
    console.error("Data:", data);
    throw error;
  }
}

// =============================================
// Update Helper
// =============================================
export async function update(table, data, where, whereParams = []) {
  const setClause = Object.keys(data)
    .map((key) => `${key} = ?`)
    .join(", ");

  const values = [...Object.values(data), ...whereParams];
  const sql = `UPDATE ${table} SET ${setClause} WHERE ${where}`;

  try {
    const [result] = await pool.execute(sql, values);
    return result.affectedRows;
  } catch (error) {
    console.error("Update error:", error.message);
    console.error("Table:", table);
    throw error;
  }
}

// =============================================
// Find One Helper
// Returns single row or null
// =============================================
export async function findOne(table, where, whereParams = []) {
  const sql = `SELECT * FROM ${table} WHERE ${where} LIMIT 1`;

  try {
    const [rows] = await pool.execute(sql, whereParams);
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error("FindOne error:", error.message);
    throw error;
  }
}

// =============================================
// Find Many Helper
// Returns array of rows
// =============================================
export async function findMany(
  table,
  where = "1=1",
  whereParams = [],
  orderBy = "id DESC",
  limit = null
) {
  let sql = `SELECT * FROM ${table} WHERE ${where} ORDER BY ${orderBy}`;

  if (limit) {
    sql += ` LIMIT ${parseInt(limit)}`;
  }

  try {
    const [rows] = await pool.execute(sql, whereParams);
    return rows;
  } catch (error) {
    console.error("FindMany error:", error.message);
    throw error;
  }
}

// =============================================
// Close Pool (for graceful shutdown)
// =============================================
export async function closePool() {
  try {
    await pool.end();
    console.log("✅ Database connection pool closed");
  } catch (error) {
    console.error("❌ Error closing database pool:", error.message);
  }
}

// =============================================
// Export pool for direct access if needed
// =============================================
export default pool;
