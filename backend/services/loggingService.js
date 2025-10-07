import { insert, update } from "../config/database.js";
import { logInfo, logError, logWarning } from "../utils/logger.js";

// =============================================
// Database Logging Service
// Saves leads and post attempts to MySQL
// =============================================

/**
 * Save lead to database
 * @param {Object} leadData - Lead information
 * @returns {Number} - Inserted lead ID
 */
export async function saveLeadToDatabase(leadData) {
  try {
    const leadId = await insert("leads", {
      ip_address: leadData.ip_address,
      user_agent: leadData.user_agent,
      amount: leadData.amount,
      fName: leadData.fName,
      lName: leadData.lName,
      email: leadData.email,
      phone: leadData.phone,
      address1: leadData.address1,
      city: leadData.city,
      state: leadData.state,
      zip: leadData.zip,
      lengthAtAddress: leadData.lengthAtAddress,
      rentOwn: leadData.rentOwn,
      bMonth: leadData.bMonth,
      bDay: leadData.bDay,
      bYear: leadData.bYear,
      ssn: leadData.ssn,
      incomeSource: leadData.incomeSource,
      monthlyNetIncome: leadData.monthlyNetIncome,
      callTime: leadData.callTime,
      loan_reason: leadData.loan_reason || null,
      credit_type: leadData.credit_type || null,
      note: leadData.note || null,
      atrk: leadData.atrk || null,
      final_status: "pending",
    });

    console.log(`✅ Lead saved to database with ID: ${leadId}`);
    return leadId;
  } catch (error) {
    console.error("❌ Error saving lead to database:", error.message);
    throw error;
  }
}

/**
 * Save post attempt to database
 * @param {Number} leadId - Lead ID
 * @param {Object} attempt - Attempt data
 */
export async function savePostAttempt(leadId, attempt) {
  try {
    await insert("post_attempts", {
      lead_id: leadId,
      vendor: attempt.vendor,
      endpoint_url: attempt.endpoint_url || "N/A",
      min_price_sent: attempt.min_price_sent,
      status: attempt.status,
      price: attempt.price || null,
      vendor_lead_id: attempt.vendor_lead_id || null,
      response_payload: attempt.response_payload || null,
      error_message: attempt.error_message || null,
      redirect_url: attempt.redirect_url || null,
      attempt_order: attempt.attempt_order,
    });

    console.log(
      `📝 Post attempt logged for lead ${leadId} (${attempt.vendor}, attempt #${attempt.attempt_order})`
    );
  } catch (error) {
    console.error("❌ Error saving post attempt:", error.message);
    // Don't throw - we don't want logging errors to stop the flow
  }
}

/**
 * Update lead final status
 * @param {Number} leadId - Lead ID
 * @param {String} status - Final status (sold, rejected, error)
 * @param {Number|null} soldPrice - Sale price if sold
 * @param {String|null} soldVendor - Vendor name if sold
 * @param {String|null} redirectUrl - Redirect URL if sold
 */
export async function updateLeadStatus(
  leadId,
  status,
  soldPrice = null,
  soldVendor = null,
  redirectUrl = null
) {
  try {
    const updateData = {
      final_status: status,
    };

    if (soldPrice !== null) updateData.sold_price = soldPrice;
    if (soldVendor !== null) updateData.sold_vendor = soldVendor;
    if (redirectUrl !== null) updateData.redirect_url = redirectUrl;

    await update("leads", updateData, "id = ?", [leadId]);

    console.log(`✅ Lead ${leadId} status updated to: ${status.toUpperCase()}`);
    if (soldPrice) {
      console.log(`💰 Sold for: $${soldPrice}`);
      console.log(`🏢 Vendor: ${soldVendor}`);
    }
  } catch (error) {
    console.error("❌ Error updating lead status:", error.message);
    // Don't throw - we don't want logging errors to stop the flow
  }
}

/**
 * Save multiple post attempts in batch
 * @param {Number} leadId - Lead ID
 * @param {Array<Object>} attempts - Array of attempt objects
 */
export async function savePostAttemptsBatch(leadId, attempts) {
  for (const attempt of attempts) {
    await savePostAttempt(leadId, attempt);
  }
}

/**
 * Log summary of lead processing
 * @param {Number} leadId - Lead ID
 * @param {Object} result - Processing result
 */
export function logLeadSummary(leadId, result) {
  console.log("\n" + "=".repeat(60));
  console.log("📋 LEAD PROCESSING SUMMARY");
  console.log("=".repeat(60));
  console.log(`Lead ID: ${leadId}`);
  console.log(`Final Status: ${result.finalStatus.toUpperCase()}`);

  if (result.finalStatus === "sold") {
    console.log(`✅ SOLD!`);
    console.log(`   Price: $${result.soldPrice}`);
    console.log(`   Vendor: ${result.vendor}`);
    console.log(`   Vendor Lead ID: ${result.vendorLeadId}`);
    if (result.redirectUrl) {
      console.log(`   Redirect URL: ${result.redirectUrl}`);
    }
  } else {
    console.log(`❌ NOT SOLD`);
    console.log(`   All vendors rejected the lead`);
  }

  console.log(`Total Attempts: ${result.totalAttempts || 0}`);
  console.log("=".repeat(60) + "\n");
}
