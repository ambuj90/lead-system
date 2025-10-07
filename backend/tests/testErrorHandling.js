import axios from "axios";

// =============================================
// Error Handling & Logging Test Suite
// =============================================

const BASE_URL = "http://localhost:5000";

console.log("🧪 Starting Error Handling & Logging Tests\n");
console.log("=".repeat(60));

// =============================================
// Test 1: Health Check
// =============================================
async function test1_HealthCheck() {
  console.log("\n✅ Test 1: Health Check");
  try {
    const response = await axios.get(`${BASE_URL}/api/health`);
    console.log("   Status:", response.data.status);
    console.log("   ✓ PASSED");
    return true;
  } catch (error) {
    console.error("   ✗ FAILED:", error.message);
    return false;
  }
}

// =============================================
// Test 2: 404 Not Found Error
// =============================================
async function test2_NotFoundError() {
  console.log("\n✅ Test 2: 404 Not Found Error");
  try {
    await axios.get(`${BASE_URL}/api/nonexistent-route`);
    console.error("   ✗ FAILED: Should have returned 404");
    return false;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log("   Status:", error.response.status);
      console.log("   Message:", error.response.data.message);
      console.log("   ✓ PASSED");
      return true;
    }
    console.error("   ✗ FAILED:", error.message);
    return false;
  }
}

// =============================================
// Test 3: Validation Error
// =============================================
async function test3_ValidationError() {
  console.log("\n✅ Test 3: Validation Error (Missing Required Fields)");
  try {
    await axios.post(`${BASE_URL}/api/lead`, {
      fName: "John",
      // Missing many required fields
    });
    console.error("   ✗ FAILED: Should have returned validation error");
    return false;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log("   Status:", error.response.status);
      console.log("   Message:", error.response.data.message);
      console.log(
        "   Errors:",
        error.response.data.errors?.length || 0,
        "validation errors"
      );
      console.log("   ✓ PASSED");
      return true;
    }
    console.error("   ✗ FAILED:", error.message);
    return false;
  }
}

// =============================================
// Test 4: Database Connection Test
// =============================================
async function test4_DatabaseConnection() {
  console.log("\n✅ Test 4: Database Connection Test");
  try {
    const response = await axios.get(`${BASE_URL}/api/test-db`);
    console.log("   Status:", response.data.status);
    console.log("   Database:", response.data.database);
    console.log("   ✓ PASSED");
    return true;
  } catch (error) {
    console.error("   ✗ FAILED:", error.message);
    return false;
  }
}

// =============================================
// Test 5: Vendor Configuration Test
// =============================================
async function test5_VendorConfiguration() {
  console.log("\n✅ Test 5: Vendor Configuration Test");
  try {
    const response = await axios.get(`${BASE_URL}/api/test-vendors`);
    console.log("   Status:", response.data.status);
    console.log(
      "   ITMedia Configured:",
      response.data.data.itmedia.configured
    );
    console.log(
      "   LeadsMarket Configured:",
      response.data.data.leadsmarket.configured
    );
    console.log("   ✓ PASSED");
    return true;
  } catch (error) {
    console.error("   ✗ FAILED:", error.message);
    return false;
  }
}

// =============================================
// Test 6: Metrics Endpoint
// =============================================
async function test6_Metrics() {
  console.log("\n✅ Test 6: Performance Metrics");
  try {
    const response = await axios.get(`${BASE_URL}/api/metrics`);
    console.log("   Status:", response.data.status);
    console.log("   Total Requests:", response.data.data.total);
    console.log("   Avg Duration:", response.data.data.avgDuration + "ms");
    console.log("   ✓ PASSED");
    return true;
  } catch (error) {
    console.error("   ✗ FAILED:", error.message);
    return false;
  }
}

// =============================================
// Test 7: Statistics Endpoint
// =============================================
async function test7_Statistics() {
  console.log("\n✅ Test 7: Statistics Summary");
  try {
    const response = await axios.get(`${BASE_URL}/api/leads/stats/summary`);
    console.log("   Status:", response.data.status);
    console.log("   Total Leads:", response.data.data.total_leads);
    console.log("   Sold Count:", response.data.data.sold_count);
    console.log("   Rejected Count:", response.data.data.rejected_count);
    console.log("   ✓ PASSED");
    return true;
  } catch (error) {
    console.error("   ✗ FAILED:", error.message);
    return false;
  }
}

// =============================================
// Test 8: JSON Parse Error
// =============================================
async function test8_JSONParseError() {
  console.log("\n✅ Test 8: Invalid JSON Error");
  try {
    await axios.post(`${BASE_URL}/api/lead`, "invalid-json", {
      headers: { "Content-Type": "application/json" },
    });
    console.error("   ✗ FAILED: Should have returned JSON parse error");
    return false;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log("   Status:", error.response.status);
      console.log("   Message:", error.response.data.message);
      console.log("   ✓ PASSED");
      return true;
    }
    console.error("   ✗ FAILED:", error.message);
    return false;
  }
}

// =============================================
// Run All Tests
// =============================================
async function runAllTests() {
  const tests = [
    test1_HealthCheck,
    test2_NotFoundError,
    test3_ValidationError,
    test4_DatabaseConnection,
    test5_VendorConfiguration,
    test6_Metrics,
    test7_Statistics,
    test8_JSONParseError,
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const result = await test();
    if (result) {
      passed++;
    } else {
      failed++;
    }
    // Small delay between tests
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log("\n" + "=".repeat(60));
  console.log("📊 TEST RESULTS");
  console.log("=".repeat(60));
  console.log(`✅ Passed: ${passed}/${tests.length}`);
  console.log(`❌ Failed: ${failed}/${tests.length}`);
  console.log("=".repeat(60) + "\n");

  if (failed === 0) {
    console.log(
      "🎉 All tests passed! Error handling system is working correctly.\n"
    );
  } else {
    console.log("⚠️  Some tests failed. Please check the logs for details.\n");
  }
}

// Run tests
runAllTests().catch((error) => {
  console.error("Fatal error running tests:", error);
  process.exit(1);
});
