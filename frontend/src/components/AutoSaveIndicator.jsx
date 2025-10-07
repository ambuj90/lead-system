import { useState, useEffect, useCallback, useRef } from "react";

// =============================================
// AUTO-SAVE HOOK
// =============================================
function useFormAutoSave(formKey, initialData = {}) {
  const [formData, setFormData] = useState(initialData);
  const [lastSaved, setLastSaved] = useState(null);
  const [saveStatus, setSaveStatus] = useState("idle");
  const [hasRestoredData, setHasRestoredData] = useState(false);

  const saveTimeoutRef = useRef(null);
  const STORAGE_KEY = `lead_form_${formKey}`;
  const TIMESTAMP_KEY = `${STORAGE_KEY}_timestamp`;

  // Load saved data on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      const savedTimestamp = localStorage.getItem(TIMESTAMP_KEY);

      if (savedData) {
        const parsed = JSON.parse(savedData);
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const timestamp = savedTimestamp ? parseInt(savedTimestamp) : 0;

        if (timestamp > sevenDaysAgo) {
          setFormData(parsed);
          setLastSaved(new Date(timestamp));
          setSaveStatus("restored");
          setHasRestoredData(true);
        } else {
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(TIMESTAMP_KEY);
        }
      }
    } catch (error) {
      console.error("Error loading saved form data:", error);
    }
  }, [STORAGE_KEY, TIMESTAMP_KEY]);

  // Save to localStorage
  const saveToStorage = useCallback(
    (data) => {
      try {
        const hasData = Object.values(data).some((val) => val !== "");
        if (!hasData) return;

        setSaveStatus("saving");
        const now = Date.now();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        localStorage.setItem(TIMESTAMP_KEY, now.toString());
        setLastSaved(new Date(now));
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch (error) {
        console.error("Error saving form data:", error);
        setSaveStatus("error");
      }
    },
    [STORAGE_KEY, TIMESTAMP_KEY]
  );

  // Debounced auto-save
  useEffect(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => saveToStorage(formData), 500);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [formData, saveToStorage]);

  const clearSavedData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TIMESTAMP_KEY);
    setLastSaved(null);
    setSaveStatus("idle");
    setHasRestoredData(false);
  }, [STORAGE_KEY, TIMESTAMP_KEY]);

  const updateFormData = useCallback((updates) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetFormData = useCallback(() => {
    setFormData(initialData);
    clearSavedData();
  }, [initialData, clearSavedData]);

  return {
    formData,
    setFormData,
    updateFormData,
    resetFormData,
    lastSaved,
    saveStatus,
    hasRestoredData,
    clearSavedData,
  };
}

// =============================================
// AUTO-SAVE INDICATOR
// =============================================
function AutoSaveIndicator({ lastSaved, saveStatus }) {
  if (saveStatus === "idle" && !lastSaved) return null;

  const icons = {
    saving: (
      <svg
        className="animate-spin h-4 w-4 text-blue-600"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    ),
    saved: (
      <svg
        className="h-4 w-4 text-green-600"
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
    ),
    restored: (
      <svg
        className="h-4 w-4 text-blue-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
    ),
    error: (
      <svg
        className="h-4 w-4 text-red-600"
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
    ),
  };

  const texts = {
    saving: "Saving...",
    saved: lastSaved ? `Saved at ${lastSaved.toLocaleTimeString()}` : "Saved",
    restored: "Progress restored",
    error: "Save failed",
  };

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
      {icons[saveStatus]}
      <span>{texts[saveStatus] || ""}</span>
    </div>
  );
}

// =============================================
// RESTORED DATA BANNER
// =============================================
function RestoredDataBanner({ onDismiss, onClear, lastSaved }) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
      <svg
        className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>

      <div className="flex-1">
        <h4 className="font-semibold text-blue-900 mb-1">
          Welcome back! We saved your progress.
        </h4>
        <p className="text-sm text-blue-700">
          Your form was last saved on {lastSaved?.toLocaleString()}. Continue
          where you left off or start fresh.
        </p>
      </div>

      <div className="flex gap-2 flex-shrink-0">
        <button
          type="button"
          onClick={onDismiss}
          className="px-3 py-1 text-sm font-medium text-blue-700 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
        >
          Continue
        </button>
        <button
          type="button"
          onClick={onClear}
          className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
        >
          Start Fresh
        </button>
      </div>
    </div>
  );
}

// =============================================
// MAIN LEAD FORM
// =============================================
export default function LeadFormWithAutoSave() {
  // Auto-save hook
  const {
    formData,
    updateFormData,
    resetFormData,
    lastSaved,
    saveStatus,
    hasRestoredData,
    clearSavedData,
  } = useFormAutoSave("lead_application", {
    fName: "",
    lName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    amount: "",
    incomeSource: "",
    monthlyNetIncome: "",
  });

  const [showBanner, setShowBanner] = useState(hasRestoredData);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null);

  useEffect(() => {
    setShowBanner(hasRestoredData);
  }, [hasRestoredData]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fName.trim()) newErrors.fName = "First name is required";
    if (!formData.lName.trim()) newErrors.lName = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email format";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!formData.amount) newErrors.amount = "Loan amount is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setSubmitStatus({
        type: "error",
        message: "Please fix the errors above",
      });
      return;
    }

    setLoading(true);
    setSubmitStatus(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Success - clear saved data
      clearSavedData();
      setSubmitStatus({
        type: "success",
        message: "Application submitted successfully!",
      });

      // Reset form after 3 seconds
      setTimeout(() => {
        resetFormData();
        setSubmitStatus(null);
      }, 3000);
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: "Submission failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearAndReset = () => {
    if (
      confirm(
        "Are you sure you want to start fresh? All progress will be lost."
      )
    ) {
      resetFormData();
      setShowBanner(false);
      setErrors({});
      setSubmitStatus(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Loan Application Form
          </h1>
          <p className="text-gray-600">
            Complete the form below to apply for a loan. Your progress is
            automatically saved!
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Restored Data Banner */}
          {showBanner && (
            <RestoredDataBanner
              lastSaved={lastSaved}
              onDismiss={() => setShowBanner(false)}
              onClear={handleClearAndReset}
            />
          )}

          {/* Auto-Save Indicator */}
          <div className="mb-6 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              All fields are required unless marked optional
            </div>
            <AutoSaveIndicator lastSaved={lastSaved} saveStatus={saveStatus} />
          </div>

          {/* Success/Error Message */}
          {submitStatus && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                submitStatus.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              <div className="flex items-center gap-2">
                {submitStatus.type === "success" ? (
                  <svg
                    className="h-5 w-5"
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
                ) : (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
                <span className="font-medium">{submitStatus.message}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="fName"
                    value={formData.fName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      errors.fName ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter first name"
                  />
                  {errors.fName && (
                    <p className="mt-1 text-sm text-red-600">{errors.fName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lName"
                    value={formData.lName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      errors.lName ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter last name"
                  />
                  {errors.lName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lName}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="(555) 123-4567"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Address
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="123 Main St"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="New York"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="NY"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    name="zip"
                    value={formData.zip}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="10001"
                  />
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Financial Information
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Requested Loan Amount *
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                    errors.amount ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="5000"
                  min="100"
                  step="100"
                />
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Income Source
                </label>
                <select
                  name="incomeSource"
                  value={formData.incomeSource}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select income source</option>
                  <option value="employment">Employment</option>
                  <option value="self_employed">Self-Employed</option>
                  <option value="benefits">Benefits</option>
                  <option value="retirement">Retirement</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Net Income
                </label>
                <input
                  type="number"
                  name="monthlyNetIncome"
                  value={formData.monthlyNetIncome}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="3000"
                  min="0"
                  step="100"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={handleClearAndReset}
                className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
              >
                Clear Form
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </button>
            </div>
          </form>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">
              💡 About Auto-Save:
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Your progress is automatically saved as you type</li>
              <li>• Data is stored locally in your browser</li>
              <li>• Saved data expires after 7 days</li>
              <li>• Refresh the page - your data will be restored!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
