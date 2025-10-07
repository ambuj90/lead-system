import { useState, useEffect } from "react";

// US States
const US_STATES = [
  { value: "", label: "Select State" },
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
];

// Months
const MONTHS = [
  { value: "", label: "Month" },
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

// Generate Days
const generateDays = () => {
  const days = [{ value: "", label: "Day" }];
  for (let i = 1; i <= 31; i++) {
    days.push({ value: i.toString(), label: i.toString() });
  }
  return days;
};

// Generate Years
const generateYears = () => {
  const currentYear = new Date().getFullYear();
  const years = [{ value: "", label: "Year" }];
  for (let year = currentYear - 18; year >= currentYear - 100; year--) {
    years.push({ value: year.toString(), label: year.toString() });
  }
  return years;
};

// Format Phone
const formatPhoneNumber = (value) => {
  const cleaned = value.replace(/\D/g, "");
  const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
  if (!match) return value;
  let formatted = "";
  if (match[1]) formatted = `(${match[1]}`;
  if (match[2]) formatted += `) ${match[2]}`;
  if (match[3]) formatted += `-${match[3]}`;
  return formatted;
};

// Enhanced Input Component
function EnhancedInput({
  label,
  name,
  value,
  onChange,
  error,
  icon,
  tooltip,
  ...props
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="relative">
      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
        {label}
        {props.required && <span className="text-red-500">*</span>}
        {tooltip && (
          <div className="group relative">
            <svg
              className="w-4 h-4 text-gray-400 cursor-help"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl z-10">
              {tooltip}
            </div>
          </div>
        )}
      </label>

      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}

        <input
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full ${icon ? "pl-12" : "pl-4"} pr-4 py-3.5 text-base
            border-2 rounded-xl transition-all duration-200
            ${
              error
                ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                : focused
                ? "border-blue-500 bg-white focus:ring-4 focus:ring-blue-100"
                : "border-gray-300 bg-gray-50 hover:bg-white hover:border-gray-400"
            }
            focus:outline-none shadow-sm hover:shadow-md`}
          {...props}
        />

        {value && !error && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <svg
              className="w-5 h-5 text-green-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

// Select Component
function EnhancedSelect({
  label,
  name,
  value,
  onChange,
  options,
  error,
  ...props
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
        {props.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-3.5 border-2 rounded-xl transition-all
          ${
            error
              ? "border-red-400 bg-red-50"
              : "border-gray-300 bg-gray-50 hover:bg-white"
          }
          focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

// Radio Group
function RadioGroup({ label, name, value, onChange, options, error }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-3">
        {label}
      </label>
      <div className="flex gap-4">
        {options.map((opt) => (
          <label
            key={opt.value}
            className={`flex-1 flex items-center justify-center px-4 py-3 border-2 rounded-xl cursor-pointer transition-all
              ${
                value === opt.value
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-300 hover:border-gray-400 bg-white"
              }`}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={onChange}
              className="mr-2"
            />
            <span className="font-medium">{opt.label}</span>
          </label>
        ))}
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

// Step Indicator
function StepIndicator({ steps, currentStep }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={index} className="flex-1 flex items-center">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all
                ${
                  currentStep > index + 1
                    ? "bg-green-500 text-white"
                    : currentStep === index + 1
                    ? "bg-blue-600 text-white ring-4 ring-blue-200"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {currentStep > index + 1 ? (
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
                  index + 1
                )}
              </div>
              <div
                className={`mt-2 text-xs font-semibold text-center ${
                  currentStep === index + 1 ? "text-blue-600" : "text-gray-500"
                }`}
              >
                {step.title}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`h-1 flex-1 mx-2 rounded ${
                  currentStep > index + 1 ? "bg-green-500" : "bg-gray-200"
                }`}
              ></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Main Form Component
export default function MultiStepLeadForm() {
  const [currentStep, setCurrentStep] = useState(1);
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
  });
  const [errors, setErrors] = useState({});

  const steps = [
    { title: "Personal Info", icon: "👤" },
    { title: "Address", icon: "🏠" },
    { title: "Financial", icon: "💰" },
    { title: "Additional", icon: "📋" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "phone") {
      formattedValue = formatPhoneNumber(value);
    }

    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.fName.trim()) newErrors.fName = "First name required";
      if (!formData.lName.trim()) newErrors.lName = "Last name required";
      if (!formData.email.trim()) newErrors.email = "Email required";
      if (!/\S+@\S+\.\S+/.test(formData.email))
        newErrors.email = "Invalid email";
      if (!formData.phone.trim()) newErrors.phone = "Phone required";
      if (!formData.bMonth || !formData.bDay || !formData.bYear) {
        newErrors.bYear = "Complete date of birth required";
      }
    }

    if (step === 2) {
      if (!formData.address1.trim()) newErrors.address1 = "Address required";
      if (!formData.city.trim()) newErrors.city = "City required";
      if (!formData.state) newErrors.state = "State required";
      if (!formData.zip.trim()) newErrors.zip = "ZIP required";
      if (!formData.lengthAtAddress) newErrors.lengthAtAddress = "Required";
      if (!formData.rentOwn) newErrors.rentOwn = "Required";
    }

    if (step === 3) {
      if (!formData.amount) newErrors.amount = "Loan amount required";
      if (!formData.ssn) newErrors.ssn = "SSN required";
      if (!formData.incomeSource)
        newErrors.incomeSource = "Income source required";
      if (!formData.monthlyNetIncome)
        newErrors.monthlyNetIncome = "Income required";
    }

    if (step === 4) {
      if (!formData.callTime) newErrors.callTime = "Call time required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = () => {
    if (validateStep(4)) {
      alert("✅ Form submitted successfully!");
      console.log("Form Data:", formData);
    }
  };

  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl shadow-xl mb-4">
            <svg
              className="w-10 h-10 text-white"
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
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
            Installment Loan Application
          </h1>
          <p className="text-gray-600">
            Complete all steps to submit your application
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-700">
              Overall Progress
            </span>
            <span className="text-sm font-bold text-blue-600">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <StepIndicator steps={steps} currentStep={currentStep} />
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          {/* STEP 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl">
                  👤
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Personal Information
                  </h2>
                  <p className="text-sm text-gray-600">
                    Let's start with your basic details
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <EnhancedInput
                  label="First Name"
                  name="fName"
                  value={formData.fName}
                  onChange={handleChange}
                  error={errors.fName}
                  placeholder="John"
                  required
                  icon={
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  }
                  tooltip="Enter your legal first name"
                />

                <EnhancedInput
                  label="Last Name"
                  name="lName"
                  value={formData.lName}
                  onChange={handleChange}
                  error={errors.lName}
                  placeholder="Doe"
                  required
                  icon={
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  }
                  tooltip="Enter your legal last name"
                />
              </div>

              <EnhancedInput
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="john.doe@example.com"
                required
                icon={
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                }
                tooltip="We'll send your confirmation here"
              />

              <EnhancedInput
                label="Phone Number"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                placeholder="(555) 123-4567"
                required
                maxLength={14}
                icon={
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                }
                tooltip="Your contact number"
              />

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-4">
                  <EnhancedSelect
                    label=""
                    name="bMonth"
                    value={formData.bMonth}
                    onChange={handleChange}
                    options={MONTHS}
                    required
                  />
                  <EnhancedSelect
                    label=""
                    name="bDay"
                    value={formData.bDay}
                    onChange={handleChange}
                    options={generateDays()}
                    required
                  />
                  <EnhancedSelect
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

          {/* STEP 2: Address Information */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl">
                  🏠
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Address Information
                  </h2>
                  <p className="text-sm text-gray-600">
                    Where do you currently live?
                  </p>
                </div>
              </div>

              <EnhancedInput
                label="Street Address"
                name="address1"
                value={formData.address1}
                onChange={handleChange}
                error={errors.address1}
                placeholder="123 Main Street"
                required
                icon={
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                }
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <EnhancedInput
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  error={errors.city}
                  placeholder="New York"
                  required
                />

                <EnhancedSelect
                  label="State"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  error={errors.state}
                  options={US_STATES}
                  required
                />

                <EnhancedInput
                  label="ZIP Code"
                  name="zip"
                  value={formData.zip}
                  onChange={handleChange}
                  error={errors.zip}
                  placeholder="10001"
                  required
                  maxLength={5}
                />
              </div>

              <EnhancedSelect
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
                  { value: "3", label: "3+ years" },
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
              />
            </div>
          )}

          {/* STEP 3: Financial Information */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl">
                  💰
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Financial Information
                  </h2>
                  <p className="text-sm text-gray-600">
                    Tell us about your finances
                  </p>
                </div>
              </div>

              <EnhancedInput
                label="Requested Loan Amount"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleChange}
                error={errors.amount}
                placeholder="5000"
                required
                min="100"
                max="5000"
                icon={<span className="text-gray-500 font-bold">$</span>}
                tooltip="Amount between $100 - $5,000"
              />

              <EnhancedInput
                label="Social Security Number"
                name="ssn"
                type="password"
                value={formData.ssn}
                onChange={handleChange}
                error={errors.ssn}
                placeholder="XXX-XX-XXXX"
                required
                maxLength={11}
                icon={
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                }
                tooltip="Your SSN is encrypted and secure"
              />

              <EnhancedSelect
                label="Income Source"
                name="incomeSource"
                value={formData.incomeSource}
                onChange={handleChange}
                error={errors.incomeSource}
                options={[
                  { value: "", label: "Select income source" },
                  { value: "employment", label: "Employment" },
                  { value: "selfemployment", label: "Self-Employment" },
                  { value: "benefits", label: "Benefits" },
                  { value: "retirement", label: "Retirement" },
                ]}
                required
              />

              <EnhancedInput
                label="Monthly Net Income"
                name="monthlyNetIncome"
                type="number"
                value={formData.monthlyNetIncome}
                onChange={handleChange}
                error={errors.monthlyNetIncome}
                placeholder="3000"
                required
                min="800"
                icon={<span className="text-gray-500 font-bold">$</span>}
                tooltip="Your take-home pay after taxes"
              />
            </div>
          )}

          {/* STEP 4: Additional Information */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl">
                  📋
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Additional Information
                  </h2>
                  <p className="text-sm text-gray-600">
                    Just a few more details
                  </p>
                </div>
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
              />

              <EnhancedSelect
                label="Reason for Loan (Optional)"
                name="loan_reason"
                value={formData.loan_reason}
                onChange={handleChange}
                options={[
                  { value: "", label: "Select reason" },
                  { value: "debt_consolidation", label: "Debt Consolidation" },
                  { value: "home_improvement", label: "Home Improvement" },
                  { value: "auto_repair", label: "Auto Repair" },
                  { value: "medical", label: "Medical" },
                  { value: "emergency", label: "Emergency" },
                ]}
              />

              <EnhancedSelect
                label="Credit Rating (Optional)"
                name="credit_type"
                value={formData.credit_type}
                onChange={handleChange}
                options={[
                  { value: "", label: "Select rating" },
                  { value: "excellent", label: "Excellent (720+)" },
                  { value: "good", label: "Good (680-719)" },
                  { value: "fair", label: "Fair (640-679)" },
                  { value: "poor", label: "Poor (below 640)" },
                ]}
              />
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8 pt-6 border-t">
            {currentStep > 1 && (
              <button
                onClick={handlePrevious}
                className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Previous
              </button>
            )}

            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                Next Step
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                Submit Application
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex items-start gap-4">
            <svg
              className="w-8 h-8 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h4 className="font-bold text-lg mb-2">
                🔒 Your Information is Secure
              </h4>
              <p className="text-sm opacity-90">
                256-bit encryption • Data never shared without consent • SSL
                protected
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
