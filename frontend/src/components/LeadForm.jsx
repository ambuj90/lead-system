import { useState, useEffect } from "react";
import {
  US_STATES,
  MONTHS,
  generateDays,
  generateYears,
  formatPhoneNumber,
  formatSSN,
  formatZipCode,
  formatCurrency,
  getUserIP,
  generateTrackingId,
  isValidEmail,
  isValidPhone,
  isValidSSN,
  isValidZip,
  isValidAge,
} from "../utils/formHelpers";
import { TextInput, SelectInput, RadioGroup } from "./FormInput";
import { ProcessingOverlay } from "./LoadingStates";
import { Confetti, Fireworks, SuccessCard } from "./SuccessAnimations";

function LeadForm() {
  // =============================================
  // State Management
  // =============================================
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Information
    fName: "",
    lName: "",
    email: "",
    phone: "",

    // Date of Birth
    bMonth: "",
    bDay: "",
    bYear: "",

    // Address Information
    address1: "",
    city: "",
    state: "",
    zip: "",
    lengthAtAddress: "",
    rentOwn: "",

    // Financial Information
    amount: "",
    ssn: "",
    incomeSource: "",
    monthlyNetIncome: "",

    // Additional Information
    callTime: "",
    loan_reason: "",
    credit_type: "",

    // Tracking
    note: "",
    atrk: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null);
  const [redirectUrl, setRedirectUrl] = useState(null);

  // =============================================
  // Initialize tracking
  // =============================================
  useEffect(() => {
    const trackingId = generateTrackingId();
    setFormData((prev) => ({
      ...prev,
      atrk: trackingId,
      note: "web-form-v1",
    }));
  }, []);

  // =============================================
  // Calculate Progress
  // =============================================
  const calculateProgress = () => {
    const totalSteps = 4;
    return Math.round((currentStep / totalSteps) * 100);
  };

  // =============================================
  // Handle Input Changes
  // =============================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Apply formatting
    switch (name) {
      case "phone":
        formattedValue = formatPhoneNumber(value);
        break;
      case "ssn":
        formattedValue = formatSSN(value);
        break;
      case "zip":
        formattedValue = formatZipCode(value);
        break;
      case "amount":
      case "monthlyNetIncome":
        formattedValue = formatCurrency(value);
        break;
      case "fName":
      case "lName":
      case "city":
        formattedValue = value.charAt(0).toUpperCase() + value.slice(1);
        break;
      default:
        formattedValue = value;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // =============================================
  // Validate Current Step
  // =============================================
  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      // Personal Information
      if (!formData.fName || !formData.fName.trim()) {
        newErrors.fName = "First name is required";
      }
      if (!formData.lName || !formData.lName.trim()) {
        newErrors.lName = "Last name is required";
      }
      if (!formData.email || !formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!isValidEmail(formData.email)) {
        newErrors.email = "Invalid email format";
      }
      if (!formData.phone || !formData.phone.trim()) {
        newErrors.phone = "Phone number is required";
      } else if (!isValidPhone(formData.phone)) {
        newErrors.phone = "Phone must be 10 digits";
      }

      // Date of Birth
      if (!formData.bMonth) newErrors.bMonth = "Month required";
      if (!formData.bDay) newErrors.bDay = "Day required";
      if (!formData.bYear) newErrors.bYear = "Year required";

      if (formData.bMonth && formData.bDay && formData.bYear) {
        if (!isValidAge(formData.bMonth, formData.bDay, formData.bYear)) {
          newErrors.bYear = "Must be 18 years or older";
        }
      }
    }

    if (step === 2) {
      // Address Information
      if (!formData.address1 || !formData.address1.trim()) {
        newErrors.address1 = "Address is required";
      }
      if (!formData.city || !formData.city.trim()) {
        newErrors.city = "City is required";
      }
      if (!formData.state) {
        newErrors.state = "State is required";
      }
      if (!formData.zip) {
        newErrors.zip = "ZIP code is required";
      } else if (!isValidZip(formData.zip)) {
        newErrors.zip = "ZIP must be 5 digits";
      }
      if (!formData.lengthAtAddress) {
        newErrors.lengthAtAddress = "Required";
      }
      if (!formData.rentOwn) {
        newErrors.rentOwn = "Required";
      }
    }

    if (step === 3) {
      // Financial Information
      if (!formData.amount) {
        newErrors.amount = "Loan amount is required";
      } else {
        const amt = parseInt(formData.amount.replace(/,/g, ""));
        if (isNaN(amt) || amt < 100 || amt > 5000) {
          newErrors.amount = "Amount must be between $100 - $5,000";
        }
      }

      if (!formData.ssn) {
        newErrors.ssn = "SSN is required";
      } else if (!isValidSSN(formData.ssn)) {
        newErrors.ssn = "SSN must be 9 digits";
      }

      if (!formData.incomeSource) {
        newErrors.incomeSource = "Income source required";
      }

      if (!formData.monthlyNetIncome) {
        newErrors.monthlyNetIncome = "Monthly income required";
      } else {
        const income = parseInt(formData.monthlyNetIncome.replace(/,/g, ""));
        if (isNaN(income) || income < 800) {
          newErrors.monthlyNetIncome = "Minimum income is $800/month";
        }
      }
    }

    if (step === 4) {
      // Additional Information
      if (!formData.callTime) {
        newErrors.callTime = "Call time preference required";
      }
    }

    console.log("Validation for step", step, "errors:", newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // =============================================
  // Navigation Handlers
  // =============================================
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Scroll to first error
      setTimeout(() => {
        const firstError = document.querySelector(".border-red-500");
        if (firstError) {
          firstError.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // =============================================
  // Form Submission
  // =============================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("🚀 Form submission started");

    // Validate final step
    if (!validateStep(4)) {
      console.log("❌ Validation failed", errors);
      return;
    }

    console.log("✅ Validation passed");

    setLoading(true);
    setSubmitStatus(null);

    try {
      // Get user's IP and user agent
      const ipAddress = await getUserIP();
      const userAgent = navigator.userAgent;

      // Determine API URL
      const API_URL =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"
          ? "http://localhost:5000"
          : "https://lead-system-sb8k.onrender.com";

      console.log("🌐 API URL:", API_URL);
      console.log("📍 Frontend origin:", window.location.origin);

      // Prepare data
      const submitData = {
        ...formData,
        phone: formData.phone.replace(/\D/g, ""),
        ssn: formData.ssn.replace(/\D/g, ""),
        zip: formData.zip.replace(/\D/g, ""),
        amount: parseInt(formData.amount.replace(/,/g, "")),
        monthlyNetIncome: parseInt(formData.monthlyNetIncome.replace(/,/g, "")),
        bMonth: parseInt(formData.bMonth),
        bDay: parseInt(formData.bDay),
        bYear: parseInt(formData.bYear),
        lengthAtAddress: parseInt(formData.lengthAtAddress),
        ip_address: ipAddress,
        user_agent: userAgent,
      };

      console.log("📤 Submitting lead data...");

      // Submit to backend
      const response = await fetch(`${API_URL}/api/lead`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      console.log("📥 Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Server error:", errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: `Server error: ${response.status}` };
        }
        throw new Error(errorData.message || "Server error occurred");
      }

      const result = await response.json();
      console.log("✅ Result:", result);

      if (result.status === "sold") {
        setSubmitStatus("success");
        setRedirectUrl(result.redirect_url);

        if (result.redirect_url) {
          setTimeout(() => {
            window.location.href = result.redirect_url;
          }, 3000);
        }
      } else if (result.status === "rejected") {
        setSubmitStatus("rejected");
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      console.error("❌ Submission error:", error);
      setSubmitStatus("error");
    } finally {
      setLoading(false);
    }
  };

  // =============================================
  // Render Status Messages
  // =============================================
  if (loading) {
    return (
      <ProcessingOverlay
        message="Processing Your Application"
        steps={[
          { label: "Validating information", status: "completed" },
          { label: "Matching with lenders", status: "active" },
          { label: "Finalizing", status: "pending" },
        ]}
      />
    );
  }

  if (submitStatus === "success") {
    return (
      <>
        <Confetti active={true} duration={6000} />
        <Fireworks active={true} duration={4000} />
        <div className="min-h-screen flex items-center justify-center p-4">
          <SuccessCard
            title="Congratulations! 🎉"
            message="Your application has been successfully matched with a lender!"
            redirectUrl={redirectUrl}
            countdown={3}
          />
        </div>
      </>
    );
  }

  if (submitStatus === "rejected") {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 text-center animate-scaleIn">
        <div className="mb-6">
          <svg
            className="mx-auto h-16 w-16 text-yellow-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          No Match Found
        </h2>
        <p className="text-gray-600 mb-6">
          Unfortunately, we couldn't match you with a lender at this time.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (submitStatus === "error") {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 text-center animate-shake">
        <div className="mb-6">
          <svg
            className="mx-auto h-16 w-16 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Oops! Something went wrong
        </h2>
        <p className="text-gray-600 mb-6">
          There was an error processing your application. Please try again.
        </p>
        <button
          onClick={() => setSubmitStatus(null)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Back to Form
        </button>
      </div>
    );
  }

  // =============================================
  // Render Step Form
  // =============================================
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Apply for Installment Loan
          </h2>
          <span className="text-sm font-medium text-gray-600">
            Step {currentStep} of 4
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${calculateProgress()}%` }}
          ></div>
        </div>

        {/* Step Labels */}
        <div className="flex justify-between mt-4 text-xs">
          <span
            className={
              currentStep >= 1 ? "text-blue-600 font-medium" : "text-gray-400"
            }
          >
            Personal
          </span>
          <span
            className={
              currentStep >= 2 ? "text-blue-600 font-medium" : "text-gray-400"
            }
          >
            Address
          </span>
          <span
            className={
              currentStep >= 3 ? "text-blue-600 font-medium" : "text-gray-400"
            }
          >
            Financial
          </span>
          <span
            className={
              currentStep >= 4 ? "text-blue-600 font-medium" : "text-gray-400"
            }
          >
            Additional
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* STEP 1: PERSONAL INFORMATION */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              Personal Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextInput
                label="First Name"
                name="fName"
                value={formData.fName}
                onChange={handleChange}
                error={errors.fName}
                placeholder="John"
                required
                maxLength={50}
              />
              <TextInput
                label="Last Name"
                name="lName"
                value={formData.lName}
                onChange={handleChange}
                error={errors.lName}
                placeholder="Doe"
                required
                maxLength={50}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextInput
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="john.doe@example.com"
                required
              />
              <TextInput
                label="Phone Number"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                placeholder="(555) 123-4567"
                required
                maxLength={14}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-3">
                You must be 18 years or older to apply
              </p>
              <div className="grid grid-cols-3 gap-4">
                <SelectInput
                  label=""
                  name="bMonth"
                  value={formData.bMonth}
                  onChange={handleChange}
                  error={errors.bMonth}
                  options={MONTHS}
                  required
                />
                <SelectInput
                  label=""
                  name="bDay"
                  value={formData.bDay}
                  onChange={handleChange}
                  error={errors.bDay}
                  options={generateDays()}
                  required
                />
                <SelectInput
                  label=""
                  name="bYear"
                  value={formData.bYear}
                  onChange={handleChange}
                  error={errors.bYear}
                  options={generateYears()}
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: ADDRESS INFORMATION */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              Address Information
            </h3>

            <TextInput
              label="Street Address"
              name="address1"
              value={formData.address1}
              onChange={handleChange}
              error={errors.address1}
              placeholder="123 Main Street"
              required
              maxLength={100}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <TextInput
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                error={errors.city}
                placeholder="New York"
                required
                maxLength={80}
              />
              <SelectInput
                label="State"
                name="state"
                value={formData.state}
                onChange={handleChange}
                error={errors.state}
                options={US_STATES}
                required
              />
              <TextInput
                label="ZIP Code"
                name="zip"
                type="tel"
                value={formData.zip}
                onChange={handleChange}
                error={errors.zip}
                placeholder="12345"
                required
                maxLength={5}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectInput
                label="Years at Current Address"
                name="lengthAtAddress"
                value={formData.lengthAtAddress}
                onChange={handleChange}
                error={errors.lengthAtAddress}
                options={[
                  { value: "", label: "Select years" },
                  { value: "0", label: "Less than 1 year" },
                  { value: "1", label: "1 year" },
                  { value: "2", label: "2 years" },
                  { value: "3", label: "3 years" },
                  { value: "4", label: "4 years" },
                  { value: "5", label: "5 years" },
                  { value: "6", label: "6 years" },
                  { value: "7", label: "7 years" },
                  { value: "8", label: "8 years" },
                  { value: "9", label: "9 years" },
                  { value: "10", label: "10+ years" },
                ]}
                required
              />
              <RadioGroup
                label="Do you Rent or Own?"
                name="rentOwn"
                value={formData.rentOwn}
                onChange={handleChange}
                error={errors.rentOwn}
                options={[
                  { value: "rent", label: "Rent" },
                  { value: "own", label: "Own" },
                ]}
                required
              />
            </div>
          </div>
        )}

        {/* STEP 3: FINANCIAL INFORMATION */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              Financial Information
            </h3>

            <div>
              <TextInput
                label="Requested Loan Amount"
                name="amount"
                type="tel"
                value={formData.amount}
                onChange={handleChange}
                error={errors.amount}
                placeholder="1,000"
                required
              />
              <p className="mt-2 text-xs text-gray-500">
                Amount must be between $100 and $5,000
              </p>
            </div>

            <div>
              <TextInput
                label="Social Security Number"
                name="ssn"
                type="tel"
                value={formData.ssn}
                onChange={handleChange}
                error={errors.ssn}
                placeholder="123-45-6789"
                required
                maxLength={11}
              />
              <p className="mt-2 text-xs text-gray-500 flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Your SSN is encrypted and secure
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectInput
                label="Income Source"
                name="incomeSource"
                value={formData.incomeSource}
                onChange={handleChange}
                error={errors.incomeSource}
                options={[
                  { value: "", label: "Select income source" },
                  { value: "employment", label: "Employment" },
                  { value: "selfemployment", label: "Self-Employment" },
                  { value: "benefits", label: "Benefits/Social Security" },
                  { value: "unemployed", label: "Unemployed" },
                ]}
                required
              />
              <TextInput
                label="Monthly Net Income"
                name="monthlyNetIncome"
                type="tel"
                value={formData.monthlyNetIncome}
                onChange={handleChange}
                error={errors.monthlyNetIncome}
                placeholder="2,500"
                required
              />
            </div>
          </div>
        )}

        {/* STEP 4: ADDITIONAL INFORMATION */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fadeIn">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              Additional Information
            </h3>

            <RadioGroup
              label="Best Time to Call"
              name="callTime"
              value={formData.callTime}
              onChange={handleChange}
              error={errors.callTime}
              options={[
                { value: "anytime", label: "Anytime" },
                { value: "morning", label: "Morning" },
                { value: "afternoon", label: "Afternoon" },
                { value: "evening", label: "Evening" },
              ]}
              required
            />

            <SelectInput
              label="Reason for Loan (Optional)"
              name="loan_reason"
              value={formData.loan_reason}
              onChange={handleChange}
              options={[
                { value: "", label: "Select reason" },
                { value: "debt_consolidation", label: "Debt Consolidation" },
                { value: "home_improvement", label: "Home Improvement" },
                { value: "auto_repair", label: "Auto Repair" },
                { value: "medical", label: "Medical Expenses" },
                { value: "emergency", label: "Emergency" },
                { value: "vacation", label: "Vacation" },
                { value: "business", label: "Business" },
                { value: "other", label: "Other" },
              ]}
            />

            <SelectInput
              label="Credit Rating (Optional)"
              name="credit_type"
              value={formData.credit_type}
              onChange={handleChange}
              options={[
                { value: "", label: "Select credit rating" },
                { value: "excellent", label: "Excellent (720+)" },
                { value: "good", label: "Good (680-719)" },
                { value: "fair", label: "Fair (640-679)" },
                { value: "poor", label: "Poor (580-639)" },
                { value: "verypoor", label: "Very Poor (below 580)" },
              ]}
            />
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
            >
              ← Back
            </button>
          ) : (
            <div></div>
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Next →
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          )}
        </div>
      </form>

      {/* Privacy Notice */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-xs text-gray-600 text-center">
          🔒 Your information is encrypted and secure. By submitting this form,
          you consent to be contacted by lenders regarding your loan request.
        </p>
      </div>
    </div>
  );
}

export default LeadForm;
