import { logInfo, logWarning, logDebug } from "../utils/logger.js";

// =============================================
// Price Tier Management Service
// =============================================

/**
 * Standard price tiers (in descending order)
 * Used for both vendors with appropriate conversions
 */
export const PRICE_TIERS = [250, 150, 80, 60, 40, 20, 10, 5, 2, 1, 0.5];

/**
 * Get price tiers for ITMedia
 * ITMedia accepts decimal prices, so return as-is
 * @returns {Array<Number>}
 */
export function getITMediaPriceTiers() {
  return [...PRICE_TIERS];
}

/**
 * Get price tiers for LeadsMarket
 * LeadsMarket only accepts integer prices 0-230
 * Map: 250→230 (cap), 0.50→0, others stay same
 * @returns {Array<Number>}
 */
export function getLeadsMarketPriceTiers() {
  return PRICE_TIERS.map((price) => {
    if (price > 230) return 230; // Cap at 230
    if (price < 1) return 0; // 0.50 becomes 0
    return Math.floor(price); // Convert to integer
  }).filter((price, index, self) => self.indexOf(price) === index); // Remove duplicates
}

/**
 * Get next tier price
 * @param {Array<Number>} tiers - Available price tiers
 * @param {Number} currentPrice - Current price
 * @returns {Number|null} - Next lower price or null if exhausted
 */
export function getNextTierPrice(tiers, currentPrice) {
  const currentIndex = tiers.indexOf(currentPrice);

  if (currentIndex === -1) {
    // Current price not in tiers, find next lower
    const lowerTiers = tiers.filter((tier) => tier < currentPrice);
    return lowerTiers.length > 0 ? lowerTiers[0] : null;
  }

  // Return next tier if exists
  return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
}

/**
 * Iterate through price tiers for a vendor
 * @param {Function} postFunction - Async function to post lead (leadData, price)
 * @param {Object} leadData - Lead information
 * @param {Array<Number>} priceTiers - Price tiers to iterate
 * @param {String} vendorName - Vendor name for logging
 * @returns {Object} - Final result with status, attempts, etc.
 */
export async function iteratePriceTiers(
  postFunction,
  leadData,
  priceTiers,
  vendorName
) {
  const attempts = [];
  let attemptOrder = 1;

  console.log(`\n${"=".repeat(60)}`);
  console.log(`🎯 Starting price iteration for ${vendorName}`);
  console.log(`📊 Available tiers: ${priceTiers.join(", ")}`);
  console.log(`${"=".repeat(60)}\n`);

  for (const price of priceTiers) {
    console.log(`\n🔄 Attempt #${attemptOrder}: Posting at $${price}`);

    const startTime = Date.now();
    const result = await postFunction(leadData, price);
    const duration = Date.now() - startTime;

    // Record this attempt
    const attempt = {
      vendor: vendorName,
      min_price_sent: price,
      status: result.status,
      price: result.price || null,
      vendor_lead_id: result.vendorLeadId || null,
      response_payload: JSON.stringify(result.rawResponse || result),
      redirect_url: result.redirectUrl || null,
      attempt_order: attemptOrder,
      duration_ms: duration,
      error_message: result.message || null,
    };

    attempts.push(attempt);

    console.log(`⏱️  Duration: ${duration}ms`);
    console.log(`📊 Status: ${result.status.toUpperCase()}`);

    // Handle different statuses
    if (result.status === "sold") {
      console.log(`✅ SOLD at $${result.price}!`);
      console.log(`🆔 Vendor Lead ID: ${result.vendorLeadId}`);
      if (result.redirectUrl) {
        console.log(`🔗 Redirect URL: ${result.redirectUrl}`);
      }

      return {
        finalStatus: "sold",
        soldPrice: result.price,
        vendorLeadId: result.vendorLeadId,
        redirectUrl: result.redirectUrl,
        vendor: vendorName,
        attempts,
        totalAttempts: attemptOrder,
      };
    } else if (result.status === "price_reject" && result.suggestedPrice) {
      // ITMedia special case: PriceRejectAmount
      console.log(
        `💡 Price rejected, suggested price: $${result.suggestedPrice}`
      );
      console.log(`🔄 Retrying immediately at suggested price...`);

      attemptOrder++;
      const retryStartTime = Date.now();
      const retryResult = await postFunction(leadData, result.suggestedPrice);
      const retryDuration = Date.now() - retryStartTime;

      const retryAttempt = {
        vendor: vendorName,
        min_price_sent: result.suggestedPrice,
        status: retryResult.status,
        price: retryResult.price || null,
        vendor_lead_id: retryResult.vendorLeadId || null,
        response_payload: JSON.stringify(
          retryResult.rawResponse || retryResult
        ),
        redirect_url: retryResult.redirectUrl || null,
        attempt_order: attemptOrder,
        duration_ms: retryDuration,
        error_message: retryResult.message || null,
      };

      attempts.push(retryAttempt);

      console.log(`⏱️  Retry Duration: ${retryDuration}ms`);
      console.log(`📊 Retry Status: ${retryResult.status.toUpperCase()}`);

      if (retryResult.status === "sold") {
        console.log(`✅ SOLD at suggested price $${retryResult.price}!`);

        return {
          finalStatus: "sold",
          soldPrice: retryResult.price,
          vendorLeadId: retryResult.vendorLeadId,
          redirectUrl: retryResult.redirectUrl,
          vendor: vendorName,
          attempts,
          totalAttempts: attemptOrder,
        };
      }

      // If retry also rejected, stop iteration (as per ITMedia logic)
      console.log(`❌ Retry rejected, stopping ${vendorName} iteration`);
      break;
    } else if (result.status === "rejected") {
      console.log(`❌ Rejected at $${price}, trying next tier...`);
      attemptOrder++;
      continue;
    } else if (result.status === "error") {
      console.error(`⚠️  Error: ${result.message}`);
      attemptOrder++;
      continue;
    }

    attemptOrder++;
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`❌ All tiers exhausted for ${vendorName}`);
  console.log(`📊 Total attempts: ${attemptOrder - 1}`);
  console.log(`${"=".repeat(60)}\n`);

  return {
    finalStatus: "rejected",
    soldPrice: null,
    vendorLeadId: null,
    redirectUrl: null,
    vendor: vendorName,
    attempts,
    totalAttempts: attemptOrder - 1,
  };
}

/**
 * Display price tier summary (for debugging/testing)
 */
export function displayPriceTierSummary() {
  console.log("\n📊 Price Tier Configuration:");
  console.log("─".repeat(60));
  console.log("Standard Tiers:", PRICE_TIERS.join(", "));
  console.log("ITMedia Tiers:", getITMediaPriceTiers().join(", "));
  console.log("LeadsMarket Tiers:", getLeadsMarketPriceTiers().join(", "));
  console.log("─".repeat(60) + "\n");
}
