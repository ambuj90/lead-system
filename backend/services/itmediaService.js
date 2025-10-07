import axios from "axios";
import qs from "qs";
import dotenv from "dotenv";
import { logInfo, logError, logVendorCall } from "../utils/logger.js";
import { ExternalAPIError } from "../utils/errorTypes.js";

dotenv.config();

// =============================================
// ITMedia API Service
// =============================================

/**
 * Post lead to ITMedia
 * @param {Object} leadData - Lead information
 * @param {Number} minPrice - Minimum price for this attempt
 * @returns {Object} - Response with status, price, leadId, redirectUrl
 */
export async function postToITMedia(leadData, minPrice) {
  try {
    // Determine endpoint (test or production)
    const endpoint =
      process.env.USE_TEST_MODE === "true"
        ? process.env.ITMEDIA_TEST_URL
        : process.env.ITMEDIA_PRODUCTION_URL;

    // Prepare ITMedia payload
    const payload = {
      // Credentials
      username: process.env.ITMEDIA_USERNAME,
      apikey: process.env.ITMEDIA_API_KEY,

      // Request metadata
      ip_address: leadData.ip_address,
      agent: leadData.user_agent,

      // Pricing
      min_price: minPrice.toString(),

      // Loan details
      amount: leadData.amount.toString(),
      lead_type: process.env.ITMEDIA_LEAD_TYPE || "installment",

      // Personal information
      fName: leadData.fName,
      lName: leadData.lName,
      email: leadData.email,
      phone: leadData.phone,

      // Date of birth
      bMonth: leadData.bMonth.toString(),
      bDay: leadData.bDay.toString(),
      bYear: leadData.bYear.toString(),

      // Address
      address: leadData.address1,
      city: leadData.city,
      state: leadData.state,
      zip: leadData.zip,
      lengthAtAddress: leadData.lengthAtAddress.toString(),
      rentOwn: leadData.rentOwn,

      // Financial
      ssn: leadData.ssn,
      incomeSource: leadData.incomeSource,
      monthlyNetIncome: leadData.monthlyNetIncome.toString(),

      // Additional
      callTime: leadData.callTime,

      // Optional fields
      ...(leadData.loan_reason && {
        loan_reason: formatLoanReason(leadData.loan_reason),
      }),
      ...(leadData.credit_type && { credit_type: leadData.credit_type }),

      // Tracking
      ...(leadData.note && { note: leadData.note }),
      ...(leadData.atrk && { atrk: leadData.atrk }),
    };

    console.log(`📤 Posting to ITMedia at $${minPrice}`);
    console.log(`🔗 Endpoint: ${endpoint}`);

    // Post to ITMedia (application/x-www-form-urlencoded)
    const response = await axios.post(endpoint, qs.stringify(payload), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      timeout: 30000, // 30 second timeout
    });

    const result = response.data;
    console.log("📥 ITMedia Response:", JSON.stringify(result, null, 2));

    // Parse ITMedia response
    if (result.Status === "Sold") {
      return {
        status: "sold",
        price: parseFloat(result.Price),
        vendorLeadId: result.LeadID,
        redirectUrl: result.Redirect || null,
        rawResponse: result,
      };
    } else if (result.Status === "Rejected" && result.PriceRejectAmount) {
      // Special case: ITMedia suggests a lower price
      return {
        status: "price_reject",
        suggestedPrice: parseFloat(result.PriceRejectAmount),
        message: result.Message || "Price rejected, retry suggested",
        rawResponse: result,
      };
    } else if (result.Status === "Rejected") {
      return {
        status: "rejected",
        message: result.Message || "Lead rejected",
        rawResponse: result,
      };
    } else if (result.Status === "Error") {
      return {
        status: "error",
        message: result.Message || "ITMedia API error",
        rawResponse: result,
      };
    } else {
      return {
        status: "error",
        message: "Unknown response from ITMedia",
        rawResponse: result,
      };
    }
  } catch (error) {
    console.error("❌ ITMedia API Error:", error.message);

    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }

    return {
      status: "error",
      message: error.message,
      errorDetails: error.response?.data || null,
    };
  }
}

/**
 * Format loan reason for ITMedia
 * Converts underscore format to camelCase
 */
function formatLoanReason(reason) {
  const mapping = {
    debt_consolidation: "debtConsolidation",
    home_improvement: "homeImprovement",
    auto_repair: "autoRepair",
    medical: "medical",
    emergency: "emergencySituation",
    vacation: "vacation",
    business: "business",
    other: "other",
  };
  return mapping[reason] || "other";
}

/**
 * Validate ITMedia credentials
 */
export function validateITMediaConfig() {
  const required = ["ITMEDIA_USERNAME", "ITMEDIA_API_KEY"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing ITMedia configuration: ${missing.join(", ")}`);
  }

  return true;
}
