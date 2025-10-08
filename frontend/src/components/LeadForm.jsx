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
  // Form State
  // =============================================
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const [formData, setFormData] = useState({
    fName: "",
    lName: "",
    email: "",
    phone: "",
    bMonth: "",
    bDay: "",
    bYear: "",
    address1: "",
    city: "",
    state: "",
    zip: "",
    lengthAtAddress: "",
    rentOwn: "",
    amount: "",
    ssn: "",
    incomeSource: "",
    monthlyNetIncome: "",
    callTime: "",
    loan_reason: "",
    credit_type: "",
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
  // Progress Calculation
  // =============================================
  const calculateProgress = () => {
    return Math.round((currentStep / totalSteps) * 100);
  };

  const progress = calculateProgress();

  // =============================================
  // Handle Input Changes
  // =============================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

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

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  // =============================================
  // Validate Current Step
  // =============================================
  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      // Personal Information
      if (!formData.fName.trim()) newErrors.fName = "First name is required";
      if (!formData.lName.trim()) newErrors.lName = "Last name is required";
      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!isValidEmail(formData.email)) {
        newErrors.email = "Invalid email format";
      }
      if (!formData.phone.trim()) {
        newErrors.phone = "Phone number is required";
      } else if (!isValidPhone(formData.phone)) {
        newErrors.phone = "Phone must be 10 digits";
      }
      if (!formData.bMonth) newErrors.bMonth = "Month required";
      if (!formData.bDay) newErrors.bDay = "Day required";
      if (!formData.bYear) newErrors.bYear = "Year required";
      if (formData.bMonth && formData.bDay && formData.bYear) {
        if (!isValidAge(formData.bMonth, formData.bDay, formData.bYear)) {
          newErrors.bYear = "Must be 18 years or older";
        }
      }
    } else if (step === 2) {
      // Address Information
      if (!formData.address1.trim()) newErrors.address1 = "Address is required";
      if (!formData.city.trim()) newErrors.city = "City is required";
      if (!formData.state) newErrors.state = "State is required";
      if (!formData.zip) {
        newErrors.zip = "ZIP code is required";
      } else if (!isValidZip(formData.zip)) {
        newErrors.zip = "ZIP must be 5 digits";
      }
      if (!formData.lengthAtAddress) newErrors.lengthAtAddress = "Required";
      if (!formData.rentOwn) newErrors.rentOwn = "Required";
    } else if (step === 3) {
      // Financial Information
      if (!formData.amount) {
        newErrors.amount = "Loan amount is required";
      } else {
        const amt = parseInt(formData.amount.replace(/,/g, ""));
        if (amt < 100 || amt > 5000) {
          newErrors.amount = "Amount must be between $100 - $5,000";
        }
      }
      if (!formData.ssn) {
        newErrors.ssn = "SSN is required";
      } else if (!isValidSSN(formData.ssn)) {
        newErrors.ssn = "SSN must be 9 digits";
      }
      if (!formData.incomeSource)
        newErrors.incomeSource = "Income source required";
      if (!formData.monthlyNetIncome) {
        newErrors.monthlyNetIncome = "Monthly income required";
      } else {
        const income = parseInt(formData.monthlyNetIncome.replace(/,/g, ""));
        if (income < 800) {
          newErrors.monthlyNetIncome = "Minimum income is $800/month";
        }
      }
    } else if (step === 4) {
      // Additional Information
      if (!formData.callTime)
        newErrors.callTime = "Call time preference required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // =============================================
  // Navigation
  // =============================================
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const firstError = document.querySelector(".border-red-400");
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // =============================================
  // Form Submission
  // =============================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(currentStep)) {
      return;
    }

    setLoading(true);
    setSubmitStatus(null);

    try {
      const ipAddress = await getUserIP();
      const userAgent = navigator.userAgent;

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

      const apiUrl = import.meta.env.VITE_API_URL || "";
      const response = await fetch(`${apiUrl}/api/lead`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

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
      console.error("Submission error:", error);
      setSubmitStatus("error");
    } finally {
      setLoading(false);
    }
  };

  // =============================================
  // Render Processing/Status Screens
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
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl p-8 text-center animate-scaleIn">
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-yellow-600"
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
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            No Match Found
          </h2>
          <p className="text-gray-600 mb-8">
            Unfortunately, we couldn't match you with a lender at this time.
            This could be due to various factors in your application.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3.5 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (submitStatus === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl p-8 text-center animate-shake">
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-red-600"
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
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 mb-8">
            There was an error processing your application. Please try again.
          </p>
          <button
            onClick={() => setSubmitStatus(null)}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3.5 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
          >
            Back to Form
          </button>
        </div>
      </div>
    );
  }

  // =============================================
  // Render Multi-Step Form
  // =============================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-3">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <svg
                className="w-7 h-7 md:w-9 md:h-9 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          <p className="text-gray-600 text-sm md:text-base">
            AI bot instantly matches you with the best loan offers tailored to
            your profile.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-sm md:text-base transition-all duration-300 ${
                      currentStep > step
                        ? "bg-green-500 text-white shadow-lg"
                        : currentStep === step
                        ? "bg-blue-600 text-white shadow-lg ring-4 ring-blue-200"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {currentStep > step ? (
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      step
                    )}
                  </div>
                  <span
                    className={`mt-2 text-xs md:text-sm font-medium hidden md:block ${
                      currentStep >= step ? "text-gray-900" : "text-gray-500"
                    }`}
                  >
                    {step === 1 && "Personal"}
                    {step === 2 && "Address"}
                    {step === 3 && "Financial"}
                    {step === 4 && "Additional"}
                  </span>
                </div>
                {step < 4 && (
                  <div
                    className={`h-1 flex-1 mx-2 rounded transition-all duration-300 ${
                      currentStep > step ? "bg-green-500" : "bg-gray-200"
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Personal Information
                  </h2>
                  <p className="text-sm text-gray-600">
                    Let's start with your basic information
                  </p>
                </div>

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
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
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

            {/* Step 2: Address Information */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Address Information
                  </h2>
                  <p className="text-sm text-gray-600">
                    Where do you currently live?
                  </p>
                </div>

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
            )}

            {/* Step 3: Financial Information */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Financial Information
                  </h2>
                  <p className="text-sm text-gray-600">
                    Tell us about your financial situation
                  </p>
                </div>

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
                      className="w-4 h-4 mr-1 text-green-600"
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
                      {
                        value: "benefits",
                        label: "Benefits/Social Security",
                      },
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

            {/* Step 4: Additional Information */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Additional Information
                  </h2>
                  <p className="text-sm text-gray-600">
                    Just a few more details
                  </p>
                </div>

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
                    {
                      value: "debt_consolidation",
                      label: "Debt Consolidation",
                    },
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
            <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 px-6 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
                >
                  ← Previous
                </button>
              )}

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Continue →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin h-5 w-5 mr-3"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    "Submit Application"
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Privacy Notice */}
        <div className="mt-6 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs text-gray-600 text-center flex items-center justify-center">
            <svg
              className="w-4 h-4 mr-2 text-green-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
            Your information is encrypted and secure. By submitting this form,
            you consent to be contacted by lenders.
          </p>
        </div>
      </div>
    </div>
  );
}

export default LeadForm;
