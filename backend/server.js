import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import logger, { logInfo, logWarning } from "./utils/logger.js";
import {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  handleSpecificErrors,
  handleUncaughtException,
  handleUnhandledRejection,
} from "./middleware/errorHandler.js";
import {
  requestLogger,
  logRequestBody,
  performanceLogger,
  getMetricsSummary,
  resetMetrics,
} from "./middleware/requestLogger.js";
import { ValidationError } from "./utils/errorTypes.js";

// Load environment variables
dotenv.config();

// Handle uncaught exceptions and unhandled rejections
handleUncaughtException();
handleUnhandledRejection();

const app = express();
const PORT = process.env.PORT || 5000;

// =============================================
// Middleware
// =============================================
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use(requestLogger);
app.use(logRequestBody);
app.use(performanceLogger);

// Request logging middleware (custom console logs)
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  logInfo(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });
  next();
});

// =============================================
// Routes
// =============================================

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Lead System API is running",
    timestamp: new Date().toISOString(),
  });
});

// Test database connection endpoint
app.get("/api/test-db", async (req, res) => {
  try {
    const { testConnection } = await import("./config/database.js");
    const result = await testConnection();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// Lead submission endpoint
app.post(
  "/api/lead",
  asyncHandler(async (req, res) => {
    logInfo("Lead submission received", {
      email: req.body.email,
      amount: req.body.amount,
    });

    const leadData = req.body;

    // Import controller
    const { processLead, validateLeadData } = await import(
      "./controllers/leadController.js"
    );

    // Validate lead data
    const validation = validateLeadData(leadData);
    if (!validation.valid) {
      logWarning("Lead validation failed", { errors: validation.errors });
      throw new ValidationError("Validation failed", validation.errors);
    }

    logInfo("Lead validation passed");

    // Process the lead
    const result = await processLead(leadData);

    // Return appropriate response
    if (result.status === "sold") {
      logInfo("Lead sold successfully", {
        leadId: result.lead_id,
        vendor: result.vendor,
        price: result.price,
      });

      return res.json({
        status: "sold",
        lead_id: result.lead_id,
        vendor: result.vendor,
        price: result.price,
        redirect_url: result.redirect_url,
        message:
          "Congratulations! Your application has been matched with a lender.",
        total_attempts: result.total_attempts,
      });
    } else if (result.status === "rejected") {
      logWarning("Lead rejected by all vendors", { leadId: result.lead_id });

      return res.json({
        status: "rejected",
        lead_id: result.lead_id,
        message: result.message,
        total_attempts: result.total_attempts,
      });
    } else {
      throw new Error(result.message || "Lead processing failed");
    }
  })
);

// Get all leads (for admin/debugging)
app.get(
  "/api/leads",
  asyncHandler(async (req, res) => {
    const { query } = await import("./config/database.js");
    const leads = await query(
      "SELECT * FROM leads ORDER BY created_at DESC LIMIT 100"
    );
    res.json({ status: "success", data: leads });
  })
);

// Get post attempts for a specific lead
app.get("/api/leads/:id/attempts", async (req, res) => {
  try {
    const { query } = await import("./config/database.js");
    const attempts = await query(
      "SELECT * FROM post_attempts WHERE lead_id = ? ORDER BY attempt_order ASC",
      [req.params.id]
    );
    res.json({ status: "success", data: attempts });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Get lead details with attempts
app.get("/api/leads/:id", async (req, res) => {
  try {
    const { query } = await import("./config/database.js");

    // Get lead
    const leads = await query("SELECT * FROM leads WHERE id = ?", [
      req.params.id,
    ]);
    if (leads.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Lead not found" });
    }

    // Get attempts
    const attempts = await query(
      "SELECT * FROM post_attempts WHERE lead_id = ? ORDER BY attempt_order ASC",
      [req.params.id]
    );

    res.json({
      status: "success",
      data: {
        lead: leads[0],
        attempts: attempts,
      },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Get recent leads with stats
app.get("/api/leads/stats/summary", async (req, res) => {
  try {
    const { query } = await import("./config/database.js");

    const stats = await query(`
      SELECT 
        COUNT(*) as total_leads,
        SUM(CASE WHEN final_status = 'sold' THEN 1 ELSE 0 END) as sold_count,
        SUM(CASE WHEN final_status = 'rejected' THEN 1 ELSE 0 END) as rejected_count,
        SUM(CASE WHEN final_status = 'error' THEN 1 ELSE 0 END) as error_count,
        AVG(CASE WHEN final_status = 'sold' THEN sold_price ELSE NULL END) as avg_sale_price,
        MAX(sold_price) as max_sale_price
      FROM leads
    `);

    res.json({ status: "success", data: stats[0] });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Test vendor configurations
app.get("/api/test-vendors", async (req, res) => {
  try {
    const { validateITMediaConfig } = await import(
      "./services/itmediaService.js"
    );
    const { validateLeadsMarketConfig } = await import(
      "./services/leadsmarketService.js"
    );
    const { displayPriceTierSummary } = await import(
      "./services/priceTierService.js"
    );

    const results = {
      itmedia: { configured: false, error: null },
      leadsmarket: { configured: false, error: null },
    };

    // Test ITMedia config
    try {
      validateITMediaConfig();
      results.itmedia.configured = true;
    } catch (error) {
      results.itmedia.error = error.message;
    }

    // Test LeadsMarket config
    try {
      validateLeadsMarketConfig();
      results.leadsmarket.configured = true;
    } catch (error) {
      results.leadsmarket.error = error.message;
    }

    // Display price tiers in console
    displayPriceTierSummary();

    res.json({
      status: "success",
      message: "Vendor configuration test",
      data: results,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Generate test lead data (for development/testing)
app.get("/api/generate-test-data", (req, res) => {
  const testLead = {
    fName: "John",
    lName: "Doe",
    email: "john.doe@test.com",
    phone: "5551234567",
    bMonth: 1,
    bDay: 15,
    bYear: 1990,
    address1: "123 Main Street",
    city: "New York",
    state: "NY",
    zip: "10001",
    lengthAtAddress: 2,
    rentOwn: "rent",
    amount: 1000,
    ssn: "123456789",
    incomeSource: "employment",
    monthlyNetIncome: 3000,
    callTime: "anytime",
    loan_reason: "debt_consolidation",
    credit_type: "fair",
    note: "test-lead",
    atrk: `test-${Date.now()}`,
    ip_address: "192.168.1.1",
    user_agent: "Mozilla/5.0 (Test Browser)",
  };

  res.json({
    status: "success",
    message: "Test lead data generated",
    data: testLead,
    instructions: "Copy this data and POST to /api/lead to test the system",
  });
});

// Get vendor configurations
app.get("/api/vendors", async (req, res) => {
  try {
    const { query } = await import("./config/database.js");
    const vendors = await query(
      "SELECT * FROM vendors WHERE is_active = 1 ORDER BY post_order ASC"
    );
    res.json({ status: "success", data: vendors });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Get metrics summary
app.get(
  "/api/metrics",
  asyncHandler(async (req, res) => {
    const metrics = getMetricsSummary();
    res.json({ status: "success", data: metrics });
  })
);

// Reset metrics
app.post(
  "/api/metrics/reset",
  asyncHandler(async (req, res) => {
    resetMetrics();
    res.json({ status: "success", message: "Metrics reset successfully" });
  })
);

// =============================================
// Error Handling Middleware (must be last)
// =============================================

// Handle specific error types
app.use(handleSpecificErrors);

// Handle 404 - Route not found
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// =============================================
// Start Server
// =============================================
async function startServer() {
  try {
    // Test database connection
    const { testConnection } = await import("./config/database.js");
    const dbTest = await testConnection();

    if (dbTest.status !== "success") {
      logger.error("Database connection failed. Please check your .env file.");
      process.exit(1);
    }

    logInfo("Database connected successfully");

    // Validate vendor configurations (optional - won't stop server)
    try {
      const { validateITMediaConfig } = await import(
        "./services/itmediaService.js"
      );
      const { validateLeadsMarketConfig } = await import(
        "./services/leadsmarketService.js"
      );

      validateITMediaConfig();
      logInfo("ITMedia configuration valid");

      validateLeadsMarketConfig();
      logInfo("LeadsMarket configuration valid");
    } catch (error) {
      logWarning("Vendor configuration warning", { error: error.message });
      logWarning("Server will start, but vendor posting may fail");
    }

    // Start listening
    app.listen(PORT, () => {
      console.log("=".repeat(50));
      console.log(`🚀 Lead System API Server`);
      console.log(`📡 Running on: http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(
        `🧪 Test Mode: ${
          process.env.USE_TEST_MODE === "true" ? "ENABLED" : "DISABLED"
        }`
      );
      console.log(`📝 Log Level: ${process.env.LOG_LEVEL || "info"}`);
      console.log(`📅 Started at: ${new Date().toISOString()}`);
      console.log("=".repeat(50));
      console.log("\n💡 Available endpoints:");
      console.log("   POST /api/lead - Submit a lead");
      console.log("   GET  /api/leads - Get all leads");
      console.log("   GET  /api/leads/:id - Get lead details");
      console.log("   GET  /api/leads/:id/attempts - Get post attempts");
      console.log("   GET  /api/leads/stats/summary - Get statistics");
      console.log("   GET  /api/vendors - Get vendor configurations");
      console.log("   GET  /api/test-vendors - Test vendor configs");
      console.log("   GET  /api/metrics - Get performance metrics");
      console.log("   POST /api/metrics/reset - Reset metrics");
      console.log("   GET  /api/health - Health check");
      console.log("   GET  /api/test-db - Database test\n");

      logInfo("Server started successfully", {
        port: PORT,
        environment: process.env.NODE_ENV || "development",
      });
    });
  } catch (error) {
    logger.error("Failed to start server", {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on("SIGTERM", () => {
  logInfo("SIGTERM received, closing server gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  logInfo("SIGINT received, closing server gracefully...");
  process.exit(0);
});
