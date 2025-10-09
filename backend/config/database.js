import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Database configuration with timeout handling
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,

  // Connection pool settings
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  // Timeout settings
  connectTimeout: 20000, // 20 seconds
  acquireTimeout: 20000,
  timeout: 20000,

  // Keep-alive
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,

  // SSL settings (required for many cloud databases)
  ssl:
    process.env.DB_SSL === "true"
      ? {
          rejectUnauthorized:
            process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false",
        }
      : undefined,
};

// Log configuration (without sensitive data)
console.log("📊 Database Configuration:");
console.log(`   Host: ${dbConfig.host}`);
console.log(`   Port: ${dbConfig.port}`);
console.log(`   Database: ${dbConfig.database}`);
console.log(`   User: ${dbConfig.user}`);
console.log(`   SSL: ${dbConfig.ssl ? "Enabled" : "Disabled"}`);
console.log(`   Connect Timeout: ${dbConfig.connectTimeout}ms`);

// Create connection pool
let pool;

try {
  pool = mysql.createPool(dbConfig);
  console.log("✅ Database pool created");
} catch (error) {
  console.error("❌ Failed to create database pool:", error.message);
  throw error;
}

/**
 * Test database connection
 */
export async function testConnection() {
  let connection;
  try {
    console.log("🔍 Testing database connection...");

    connection = await pool.getConnection();
    console.log("✅ Database connection acquired");

    await connection.ping();
    console.log("✅ Database ping successful");

    const [rows] = await connection.query("SELECT 1 as test");
    console.log("✅ Database query successful");

    connection.release();

    return {
      status: "success",
      message: "Database connection successful",
      database: dbConfig.database,
      host: dbConfig.host,
    };
  } catch (error) {
    console.error("❌ Database connection test failed:", error.message);

    if (connection) {
      connection.release();
    }

    // Provide helpful error messages
    let helpMessage = "";

    if (error.code === "ETIMEDOUT") {
      helpMessage =
        "Connection timeout. Check:\n" +
        "  1. Database host is correct\n" +
        "  2. Database is running and accessible\n" +
        "  3. Firewall allows connections\n" +
        "  4. IP whitelist includes your server IP";
    } else if (error.code === "ECONNREFUSED") {
      helpMessage =
        "Connection refused. Check:\n" +
        "  1. Database server is running\n" +
        "  2. Port number is correct (usually 3306)\n" +
        "  3. Host address is correct";
    } else if (error.code === "ER_ACCESS_DENIED_ERROR") {
      helpMessage =
        "Access denied. Check:\n" +
        "  1. Username is correct\n" +
        "  2. Password is correct\n" +
        "  3. User has proper permissions";
    } else if (error.code === "ER_BAD_DB_ERROR") {
      helpMessage =
        "Database not found. Check:\n" +
        "  1. Database name is correct\n" +
        "  2. Database exists on the server";
    }

    console.error(helpMessage);

    return {
      status: "error",
      message: error.message,
      code: error.code,
      help: helpMessage,
    };
  }
}

/**
 * Execute a query
 */
export async function query(sql, params = []) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error("Query error:", error.message);
    console.error("SQL:", sql);
    throw error;
  }
}

/**
 * Execute a transaction
 */
export async function transaction(callback) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Get a connection from the pool
 */
export async function getConnection() {
  return await pool.getConnection();
}

/**
 * Close all connections
 */
export async function closePool() {
  if (pool) {
    await pool.end();
    console.log("Database pool closed");
  }
}

// Handle process termination
process.on("SIGINT", async () => {
  await closePool();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await closePool();
  process.exit(0);
});

export default pool;
