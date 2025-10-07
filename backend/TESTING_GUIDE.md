# Lead System - Complete Testing Guide

## 🎯 Phase 3 Complete Testing

This guide will walk you through testing the entire lead posting system.

---

## ✅ Pre-Testing Checklist

### 1. Environment Variables Setup

Make sure your `backend/.env` file has all required credentials:

```bash
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=lead_system

# ITMedia
ITMEDIA_USERNAME=your_username
ITMEDIA_API_KEY=your_api_key

# LeadsMarket
LEADSMARKET_CAMPAIGN_ID=your_campaign_id
LEADSMARKET_CAMPAIGN_KEY=your_campaign_key

# Testing
USE_TEST_MODE=true  # Set to true for testing
```

### 2. Start Both Servers

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

---

## 🧪 Test Scenarios

### Test 1: Vendor Configuration Check

**Endpoint:** `GET http://localhost:5000/api/test-vendors`

**Expected Response:**

```json
{
  "status": "success",
  "message": "Vendor configuration test",
  "data": {
    "itmedia": {
      "configured": true,
      "error": null
    },
    "leadsmarket": {
      "configured": true,
      "error": null
    }
  }
}
```

**✅ Pass Criteria:** Both vendors show `"configured": true`

---

### Test 2: Database Connection

**Endpoint:** `GET http://localhost:5000/api/test-db`

**Expected Response:**

```json
{
  "status": "success",
  "message": "Database connection successful",
  "test_query_result": 2,
  "database": "lead_system"
}
```

**✅ Pass Criteria:** Status is "success"

---

### Test 3: Submit Test Lead via Frontend

**Steps:**

1. Open `http://localhost:5173/`
2. Fill out the complete form with test data:

   - **Name:** John Doe
   - **Email:** john.doe@test.com
   - **Phone:** 5551234567
   - **DOB:** 1/1/1990
   - **Address:** 123 Main St
   - **City:** New York
   - **State:** NY
   - **ZIP:** 10001
   - **Years at Address:** 2 years
   - **Rent/Own:** Rent
   - **Loan Amount:** 1000
   - **SSN:** 123456789
   - **Income Source:** Employment
   - **Monthly Income:** 3000
   - **Call Time:** Anytime

3. Click "Submit Application"

**Expected Behavior:**

- ✅ Form validates successfully
- ✅ Submit button shows "Processing..."
- ✅ Backend console shows detailed processing logs
- ✅ You see one of these screens:
  - **Sold:** Green success with redirect
  - **Rejected:** Yellow warning message
  - **Error:** Red error message

**Backend Console Should Show:**

```
🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀
🎯 NEW LEAD SUBMISSION RECEIVED
🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀

📝 Lead Details:
   Name: John Doe
   Email: john.doe@test.com
   ...

💾 STEP 1: Saving lead to database...
✅ Lead saved with ID: 1

📤 STEP 2: Posting to ITMedia (Priority 1)...
============================================================
🎯 Starting price iteration for ITMedia
📊 Available tiers: 250, 150, 80, 60, 40, 20, 10, 5, 2, 1, 0.5
============================================================

🔄 Attempt #1: Posting at $250
📤 Posting to ITMedia at $250
...
```

---

### Test 4: Check Lead in Database

**Option A - Using API:**

**Endpoint:** `GET http://localhost:5000/api/leads`

**Expected Response:**

```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "fName": "John",
      "lName": "Doe",
      "email": "john.doe@test.com",
      "final_status": "sold" or "rejected",
      "sold_price": 150.00,
      "sold_vendor": "ITMedia",
      ...
    }
  ]
}
```

**Option B - Using phpMyAdmin:**

1. Open phpMyAdmin
2. Select `lead_system` database
3. View `leads` table
4. You should see your test lead

---

### Test 5: Check Post Attempts

**Endpoint:** `GET http://localhost:5000/api/leads/1/attempts`

Replace `1` with your lead ID.

**Expected Response:**

```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "lead_id": 1,
      "vendor": "ITMedia",
      "min_price_sent": 250.00,
      "status": "rejected",
      "attempt_order": 1,
      ...
    },
    {
      "id": 2,
      "lead_id": 1,
      "vendor": "ITMedia",
      "min_price_sent": 150.00,
      "status": "sold",
      "price": 150.00,
      "attempt_order": 2,
      ...
    }
  ]
}
```

**✅ Pass Criteria:**

- Multiple attempts recorded
- Shows price tier progression
- Final sold attempt has price and redirect_url

---

### Test 6: Statistics Check

**Endpoint:** `GET http://localhost:5000/api/leads/stats/summary`

**Expected Response:**

```json
{
  "status": "success",
  "data": {
    "total_leads": 1,
    "sold_count": 1,
    "rejected_count": 0,
    "error_count": 0,
    "avg_sale_price": "150.0000",
    "max_sale_price": "150.00"
  }
}
```

---

## 🎭 Test Mode vs Production Mode

### Test Mode (Recommended for Development)

Set in `.env`:

```bash
USE_TEST_MODE=true
LEADSMARKET_TEST_RESULT=Accepted  # or Rejected
```

**Behavior:**

- ITMedia: Uses test endpoint
- LeadsMarket: Forces specified test result
- No real money transactions
- Safe for testing

### Production Mode

Set in `.env`:

```bash
USE_TEST_MODE=false
```

**Behavior:**

- Uses real production endpoints
- Real lead posting
- Real money transactions
- **Use with caution!**

---

## 🐛 Troubleshooting

### Issue: "Missing ITMedia configuration"

**Solution:**

- Check `.env` file has `ITMEDIA_USERNAME` and `ITMEDIA_API_KEY`
- Restart backend server after changing `.env`

### Issue: "Database connection failed"

**Solution:**

- Verify MySQL is running
- Check `DB_PASSWORD` in `.env`
- Test with: `http://localhost:5000/api/test-db`

### Issue: Form validation errors

**Solution:**

- Ensure all required fields are filled
- Check age is 18+
- Verify loan amount is $100-$5,000
- Check income is $800+/month

### Issue: Lead rejected by all vendors

**Possible Reasons:**

- Test data doesn't meet vendor criteria
- Vendor API keys invalid
- Network issues
- Vendor services down

**Check:**

1. Backend console logs for detailed error messages
2. `post_attempts` table for vendor responses
3. Verify vendor credentials in `.env`

---

## 📊 Success Indicators

### ✅ Complete Success Checklist

- [ ] Both servers start without errors
- [ ] Vendor configuration test passes
- [ ] Database connection test passes
- [ ] Form submits successfully
- [ ] Backend logs show detailed processing
- [ ] Lead saved to `leads` table
- [ ] Attempts saved to `post_attempts` table
- [ ] Frontend shows appropriate result (sold/rejected)
- [ ] Statistics endpoint shows updated counts

---

## 🎉 Phase 3 Complete!

If all tests pass, you have successfully implemented:

✅ Complete lead capture form
✅ Backend API with vendor integration
✅ Price tier iteration logic
✅ Database logging
✅ Error handling
✅ Success/rejection flow

**Next Steps:**

- Deploy to production server
- Set up monitoring
- Add admin dashboard
- Implement reporting features
