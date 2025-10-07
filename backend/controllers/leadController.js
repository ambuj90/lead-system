import { postToITMedia } from "../services/itmediaService.js";
import { postToLeadsMarket } from "../services/leadsmarketService.js";
import {
  getITMediaPriceTiers,
  getLeadsMarketPriceTiers,
  iteratePriceTiers,
} from "../services/priceTierService.js";
import {
  saveLeadToDatabase,
  savePostAttemptsBatch,
  updateLeadStatus,
  logLeadSummary,
} from "../services/loggingService.js";
import { logInfo, logWarning, logLeadProcessing } from "../utils/logger.js";

// =============================================
// Main Lead Processing Controller
// =============================================

/**
 * Process a lead submission
 * - Save lead to database
 * - Post to ITMedia with price tier iteration
 * - If not sold, post to LeadsMarket with price tier iteration
 * - Log all attempts to database
 * - Return final result
 *
 * @param {Object} leadData - Complete lead information from form
 * @returns {Object} - Processing result { status, redirect_url, lead_id, etc. }
 */
export async function processLead(leadData) {
  let leadId = null;

  try {
    console.log("\n" + "🚀".repeat(30));
    console.log("🎯 NEW LEAD SUBMISSION RECEIVED");
    console.log("🚀".repeat(30) + "\n");

    console.log("📝 Lead Details:");
    console.log(`   Name: ${leadData.fName} ${leadData.lName}`);
    console.log(`   Email: ${leadData.email}`);
    console.log(`   Phone: ${leadData.phone}`);
    console.log(`   Amount: $${leadData.amount}`);
    console.log(`   Income: $${leadData.monthlyNetIncome}/month`);
    console.log(`   Location: ${leadData.city}, ${leadData.state}`);
    console.log(`   Tracking: ${leadData.atrk || "N/A"}\n`);

    // =============================================
    // STEP 1: Save lead to database
    // =============================================
    console.log("💾 STEP 1: Saving lead to database...");
    leadId = await saveLeadToDatabase(leadData);
    console.log(`✅ Lead saved with ID: ${leadId}\n`);

    // =============================================
    // STEP 2: Post to ITMedia first
    // =============================================
    console.log("📤 STEP 2: Posting to ITMedia (Priority 1)...");
    const itmediaTiers = getITMediaPriceTiers();

    const itmediaResult = await iteratePriceTiers(
      postToITMedia,
      leadData,
      itmediaTiers,
      "ITMedia"
    );

    // Save all ITMedia attempts to database
    await savePostAttemptsBatch(leadId, itmediaResult.attempts);

    // Check if ITMedia bought the lead
    if (itmediaResult.finalStatus === "sold") {
      console.log("🎉 Lead SOLD to ITMedia!\n");

      // Update lead status in database
      await updateLeadStatus(
        leadId,
        "sold",
        itmediaResult.soldPrice,
        "ITMedia",
        itmediaResult.redirectUrl
      );

      // Log summary
      logLeadSummary(leadId, itmediaResult);

      // Return success response
      return {
        status: "sold",
        lead_id: leadId,
        vendor: "ITMedia",
        price: itmediaResult.soldPrice,
        vendor_lead_id: itmediaResult.vendorLeadId,
        redirect_url: itmediaResult.redirectUrl,
        total_attempts: itmediaResult.totalAttempts,
      };
    }

    console.log("❌ ITMedia did not purchase the lead\n");

    // =============================================
    // STEP 3: Post to LeadsMarket (fallback)
    // =============================================
    console.log("📤 STEP 3: Posting to LeadsMarket (Priority 2)...");
    const leadsmarketTiers = getLeadsMarketPriceTiers();

    const leadsmarketResult = await iteratePriceTiers(
      postToLeadsMarket,
      leadData,
      leadsmarketTiers,
      "LeadsMarket"
    );

    // Save all LeadsMarket attempts to database
    await savePostAttemptsBatch(leadId, leadsmarketResult.attempts);

    // Check if LeadsMarket bought the lead
    if (leadsmarketResult.finalStatus === "sold") {
      console.log("🎉 Lead SOLD to LeadsMarket!\n");

      // Update lead status in database
      await updateLeadStatus(
        leadId,
        "sold",
        leadsmarketResult.soldPrice,
        "LeadsMarket",
        leadsmarketResult.redirectUrl
      );

      // Combine attempts from both vendors
      const combinedResult = {
        ...leadsmarketResult,
        totalAttempts:
          itmediaResult.totalAttempts + leadsmarketResult.totalAttempts,
      };

      // Log summary
      logLeadSummary(leadId, combinedResult);

      // Return success response
      return {
        status: "sold",
        lead_id: leadId,
        vendor: "LeadsMarket",
        price: leadsmarketResult.soldPrice,
        vendor_lead_id: leadsmarketResult.vendorLeadId,
        redirect_url: leadsmarketResult.redirectUrl,
        total_attempts: combinedResult.totalAttempts,
      };
    }

    console.log("❌ LeadsMarket did not purchase the lead\n");

    // =============================================
    // STEP 4: No vendors purchased - REJECTED
    // =============================================
    console.log("💔 No vendors purchased this lead\n");

    await updateLeadStatus(leadId, "rejected");

    const rejectedResult = {
      finalStatus: "rejected",
      totalAttempts:
        itmediaResult.totalAttempts + leadsmarketResult.totalAttempts,
    };

    logLeadSummary(leadId, rejectedResult);

    return {
      status: "rejected",
      lead_id: leadId,
      message: "No lenders matched your application at this time",
      total_attempts: rejectedResult.totalAttempts,
    };
  } catch (error) {
    console.error("\n❌ CRITICAL ERROR in lead processing:", error);
    console.error("Stack trace:", error.stack);

    // Update lead status to error if we have a lead ID
    if (leadId) {
      await updateLeadStatus(leadId, "error");
    }

    return {
      status: "error",
      lead_id: leadId,
      message: "An error occurred while processing your application",
      error: error.message,
    };
  }
}

/**
 * Validate lead data before processing
 * @param {Object} leadData - Lead data to validate
 * @returns {Object} - { valid: boolean, errors: array }
 */
export function validateLeadData(leadData) {
  const errors = [];

  // Required fields
  const requiredFields = [
    "fName",
    "lName",
    "email",
    "phone",
    "bMonth",
    "bDay",
    "bYear",
    "address1",
    "city",
    "state",
    "zip",
    "lengthAtAddress",
    "rentOwn",
    "amount",
    "ssn",
    "incomeSource",
    "monthlyNetIncome",
    "callTime",
    "ip_address",
    "user_agent",
  ];

  for (const field of requiredFields) {
    if (!leadData[field] && leadData[field] !== 0) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Validate data types and ranges
  if (leadData.amount && (leadData.amount < 100 || leadData.amount > 5000)) {
    errors.push("Amount must be between $100 and $5,000");
  }

  if (leadData.monthlyNetIncome && leadData.monthlyNetIncome < 800) {
    errors.push("Monthly income must be at least $800");
  }

  if (leadData.phone && leadData.phone.length !== 10) {
    errors.push("Phone number must be 10 digits");
  }

  if (leadData.ssn && leadData.ssn.length !== 9) {
    errors.push("SSN must be 9 digits");
  }

  if (leadData.zip && leadData.zip.length !== 5) {
    errors.push("ZIP code must be 5 digits");
  }

  // Validate email format
  if (leadData.email && !leadData.email.includes("@")) {
    errors.push("Invalid email format");
  }

  // Age validation (must be 18+)
  if (leadData.bMonth && leadData.bDay && leadData.bYear) {
    const birthDate = new Date(
      leadData.bYear,
      leadData.bMonth - 1,
      leadData.bDay
    );
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    let actualAge = age;
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      actualAge--;
    }

    if (actualAge < 18) {
      errors.push("Must be 18 years or older");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
