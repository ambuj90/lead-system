import { useState } from "react";

// Mock data and utilities
const US_STATES = [
  { value: "", label: "Select State" },
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "CA", label: "California" },
  { value: "FL", label: "Florida" },
  { value: "NY", label: "New York" },
  { value: "TX", label: "Texas" },
];

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

const generateDays = () => {
  const days = [{ value: "", label: "Day" }];
  for (let i = 1; i <= 31; i++) {
    days.push({ value: i.toString(), label: i.toString() });
  }
  return days;
};

const generateYears = () => {
  const currentYear = new Date().getFullYear();
  const years = [{ value: "", label: "Year" }];
  for (let year = currentYear - 18; year >= currentYear - 100; year--) {
    years.push({ value: year.toString(), label: year.toString() });
  }
  return years;
};

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

const formatSSN = (value) => {
  const cleaned = value.replace(/\D/g, "");
  const match = cleaned.match(/^(\d{0,3})(\d{0,2})(\d{0,4})$/);
  if (!match) return value;
  let formatted = match[1];
  if (match[2]) formatted += `-${match[2]}`;
  if (match[3]) formatted += `-${match[3]}`;
  return formatted;
};

const formatCurrency = (value) => {
  const cleaned = value.replace(/\D/g, "");
  return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Simple Input Components
function TextInput({
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
  required,
  type = "text",
  maxLength,
}) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 border rounded-lg transition-all text-base ${
          error
            ? "border-red-500 bg-red-50"
            : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        }`}
      />
      {error && <p className="mt-1 text-xs sm:text-sm text-red-600">{error}</p>}
    </div>
  );
}

function SelectInput({
  label,
  name,
  value,
  onChange,
  error,
  options,
  required,
}) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 border rounded-lg transition-all text-base ${
          error
            ? "border-red-500 bg-red-50"
            : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        }`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs sm:text-sm text-red-600">{error}</p>}
    </div>
  );
}

function RadioGroup({
  label,
  name,
  value,
  onChange,
  error,
  options,
  required,
}) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        {options.map((opt) => (
          <label
            key={opt.value}
            className={`flex-1 flex items-center justify-center px-4 py-3 border-2 rounded-lg cursor-pointer transition-all text-sm sm:text-base ${
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
      {error && <p className="mt-1 text-xs sm:text-sm text-red-600">{error}</p>}
    </div>
  );
}

function LeadForm() {
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
  const [loading, setLoading] = useState(false);

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
      case "amount":
      case "monthlyNetIncome":
        formattedValue = formatCurrency(value);
        break;
      case "fName":
      case "lName":
      case "city":
        formattedValue = value.charAt(0).toUpperCase() + value.slice(1);
        break;
    }

    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const calculateProgress = () => {
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
    ];
    const filledRequired = requiredFields.filter(
      (field) => formData[field] && formData[field].toString().trim() !== ""
    ).length;
    return Math.round((filledRequired / requiredFields.length) * 100);
  };

  const progress = calculateProgress();

  const handleSubmit = () => {
    console.log("Form submitted:", formData);
    alert("Form submitted! (Demo mode)");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-4 sm:py-8 px-3 sm:px-4 lg:px-6">
      {/* Mobile Header - Sticky on mobile */}
      <div className="lg:hidden sticky top-0 z-10 bg-white/95 backdrop-blur-sm shadow-sm rounded-lg mb-4 p-4">
        <h2 className="text-lg font-bold text-gray-900 mb-2">
          Installment Loan Application
        </h2>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="text-sm font-bold text-blue-600 min-w-[45px] text-right">
            {progress}%
          </span>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="w-full mx-auto">
        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg overflow-hidden">
          {/* Desktop Header */}
          <div className="hidden lg:block bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white form-header-lead">
            <h2 className="text-3xl font-bold mb-2 p-10">
              Apply for Installment Loan
            </h2>
            <p className="text-blue-100 mb-4">
              Complete the form below to get matched with lenders. All
              information is secure and confidential.
            </p>
            <div className="max-w-md">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">
                  Application Progress
                </span>
                <span className="text-sm font-bold">{progress}%</span>
              </div>
              <div className="w-full bg-blue-800/30 rounded-full h-3">
                <div
                  className="bg-white h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
            {/* SECTION 1: Personal Information */}
            <div className="border-b border-gray-200 pb-6 sm:pb-8">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6 flex items-center">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span>Personal Information</span>
              </h3>

              <div className="space-y-4 sm:space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  <div className="md:col-span-1">
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
                  </div>
                  <div className="md:col-span-1">
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  <div className="md:col-span-1">
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
                  </div>
                  <div className="md:col-span-1">
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    You must be 18 years or older to apply
                  </p>
                  <div className="grid grid-cols-3 gap-2 sm:gap-4">
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
            </div>

            {/* SECTION 2: Address Information */}
            <div className="border-b border-gray-200 pb-6 sm:pb-8">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6 flex items-center">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                <span>Address Information</span>
              </h3>

              <div className="space-y-4 sm:space-y-5">
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

                {/* City, State, ZIP - Stack on mobile, row on larger screens */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
                  <div className="md:col-span-1">
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
                  </div>
                  <div className="md:col-span-1">
                    <SelectInput
                      label="State"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      error={errors.state}
                      options={US_STATES}
                      required
                    />
                  </div>
                  <div className="md:col-span-1">
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  <div className="md:col-span-1">
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
                        { value: "5", label: "5 years" },
                        { value: "10", label: "10+ years" },
                      ]}
                      required
                    />
                  </div>
                  <div className="md:col-span-1">
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
              </div>
            </div>

            {/* SECTION 3: Financial Information */}
            <div className="border-b border-gray-200 pb-6 sm:pb-8">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6 flex items-center">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-blue-600"
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
                <span>Financial Information</span>
              </h3>

              <div className="space-y-4 sm:space-y-5">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  <div className="md:col-span-1">
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
                  </div>
                  <div className="md:col-span-1">
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
              </div>
            </div>

            {/* SECTION 4: Additional Information */}
            <div className="border-b border-gray-200 pb-6 sm:pb-8">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6 flex items-center">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <span>Additional Information</span>
              </h3>

              <div className="space-y-4 sm:space-y-5">
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
            </div>

            {/* Submit Button - Visible on desktop */}
            <div className="hidden lg:block pt-4">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl text-lg"
              >
                {loading ? "Processing..." : "Submit Application"}
              </button>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="bg-gray-50 px-4 sm:px-6 lg:px-8 py-4 border-t border-gray-200">
            <p className="text-xs sm:text-sm text-gray-600 text-center">
              🔒 Your information is encrypted and secure. By submitting this,
              you consent to be contacted by lenders regarding your loan
              request.
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Submit Button - Fixed Bottom */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-3 z-20">
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white py-3.5 px-6 rounded-lg font-semibold active:bg-blue-800 transition-all shadow-lg text-base"
        >
          Submit Application
        </button>
      </div>

      {/* Spacer for fixed button on mobile */}
      <div className="lg:hidden h-20"></div>
    </div>
  );
}

export default LeadForm;
