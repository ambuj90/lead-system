import axios from "axios";
import dotenv from "dotenv";
import { logInfo, logError, logVendorCall } from "../utils/logger.js";
import { ExternalAPIError } from "../utils/errorTypes.js";

dotenv.config();

// =============================================
// LeadsMarket API Service
// =============================================

/**
 * Post lead to LeadsMarket
 * @param {Object} leadData - Lead information
 * @param {Number} minPrice - Minimum price for this attempt (will be converted to integer)
 * @returns {Object} - Response with status, price, leadId, redirectUrl
 */
export async function postToLeadsMarket(leadData, minPrice) {
  try {
    // LeadsMarket requires INTEGER prices (0-230)
    // Cap at 230 and round down decimals
    let intPrice = Math.floor(minPrice);
    if (intPrice > 230) intPrice = 230;
    if (intPrice < 0) intPrice = 0;

    const endpoint = process.env.LEADSMARKET_PRODUCTION_URL;

    // Prepare LeadsMarket payload (query parameters)
    const params = {
      // Credentials
      CampaignID: process.env.LEADSMARKET_CAMPAIGN_ID,
      CampaignKey: process.env.LEADSMARKET_CAMPAIGN_KEY,

      // Lead type (19 = Installment Loans)
      LeadtypeId: process.env.LEADSMARKET_LEADTYPE_ID || "19",

      // Response format
      responsetype: "json",

      // Pricing
      MinimumPrice: intPrice.toString(),

      // Personal information
      FirstName: leadData.fName,
      LastName: leadData.lName,
      Email: leadData.email,
      PhoneHome: leadData.phone,

      // Date of birth
      DateOfBirth: `${leadData.bMonth}/${leadData.bDay}/${leadData.bYear}`,

      // Address
      Address: leadData.address1,
      City: leadData.city,
      State: leadData.state,
      Zip: leadData.zip,
      LengthAtAddress: leadData.lengthAtAddress.toString(),
      PropertyType: leadData.rentOwn === "own" ? "Own" : "Rent",

      // Financial
      SSN: leadData.ssn,
      IncomeType: formatIncomeType(leadData.incomeSource),
      MonthlyIncome: leadData.monthlyNetIncome.toString(),
      LoanAmount: leadData.amount.toString(),

      // Additional
      BestTimeToCall: formatCallTime(leadData.callTime),

      // Optional tracking
      ...(leadData.note && { SourceSubID: leadData.note }),
      ...(leadData.atrk && { V1: leadData.atrk }),

      // IP Address (LeadsMarket uses ClientIP)
      ClientIP: leadData.ip_address,

      // Test mode
      ...(process.env.USE_TEST_MODE === "true" && {
        TestResult: process.env.LEADSMARKET_TEST_RESULT || "Accepted",
      }),
    };

    console.log(`📤 Posting to LeadsMarket at $${intPrice}`);
    console.log(`🔗 Endpoint: ${endpoint}`);

    // Post to LeadsMarket (GET or POST with query params)
    const response = await axios.get(endpoint, {
      params,
      timeout: 30000, // 30 second timeout
    });

    const result = response.data;
    console.log("📥 LeadsMarket Response:", JSON.stringify(result, null, 2));

    // Parse LeadsMarket response
    if (result.Result === "1") {
      // Sold
      return {
        status: "sold",
        price: parseFloat(result.Price || intPrice),
        vendorLeadId: result.LeadID || null,
        redirectUrl: result.RedirectURL || null,
        rawResponse: result,
      };
    } else if (result.Result === "2") {
      // Rejected - can retry with lower price
      return {
        status: "rejected",
        message: result.Message || "Lead rejected by LeadsMarket",
        rawResponse: result,
      };
    } else {
      // Error or unknown
      return {
        status: "error",
        message: result.Message || "Unknown response from LeadsMarket",
        rawResponse: result,
      };
    }
  } catch (error) {
    console.error("❌ LeadsMarket API Error:", error.message);

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
 * Format income source for LeadsMarket
 */
function formatIncomeType(incomeSource) {
  const mapping = {
    employment: "Employment",
    selfemployment: "Self-Employed",
    benefits: "Benefits",
    unemployed: "Unemployed",
  };
  return mapping[incomeSource] || "Employment";
}

/**
 * Format call time for LeadsMarket
 */
function formatCallTime(callTime) {
  const mapping = {
    anytime: "Anytime",
    morning: "Morning",
    afternoon: "Afternoon",
    evening: "Evening",
  };
  return mapping[callTime] || "Anytime";
}

/**
 * Validate LeadsMarket credentials
 */
export function validateLeadsMarketConfig() {
  const required = ["LEADSMARKET_CAMPAIGN_ID", "LEADSMARKET_CAMPAIGN_KEY"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing LeadsMarket configuration: ${missing.join(", ")}`);
  }

  return true;
}
