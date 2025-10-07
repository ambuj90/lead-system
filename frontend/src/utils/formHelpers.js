// =============================================
// US States List
// =============================================
export const US_STATES = [
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
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
];

// =============================================
// Months for Date of Birth
// =============================================
export const MONTHS = [
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

// =============================================
// Generate Days (1-31)
// =============================================
export const generateDays = () => {
  const days = [{ value: "", label: "Day" }];
  for (let i = 1; i <= 31; i++) {
    days.push({ value: i.toString(), label: i.toString() });
  }
  return days;
};

// =============================================
// Generate Years (18-100 years old)
// =============================================
export const generateYears = () => {
  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 100;
  const maxYear = currentYear - 18;

  const years = [{ value: "", label: "Year" }];
  for (let year = maxYear; year >= minYear; year--) {
    years.push({ value: year.toString(), label: year.toString() });
  }
  return years;
};

// =============================================
// Format Phone Number (XXX) XXX-XXXX
// =============================================
export const formatPhoneNumber = (value) => {
  const cleaned = value.replace(/\D/g, "");
  const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);

  if (!match) return value;

  let formatted = "";
  if (match[1]) formatted = `(${match[1]}`;
  if (match[2]) formatted += `) ${match[2]}`;
  if (match[3]) formatted += `-${match[3]}`;

  return formatted;
};

// =============================================
// Format SSN XXX-XX-XXXX
// =============================================
export const formatSSN = (value) => {
  const cleaned = value.replace(/\D/g, "");
  const match = cleaned.match(/^(\d{0,3})(\d{0,2})(\d{0,4})$/);

  if (!match) return value;

  let formatted = match[1];
  if (match[2]) formatted += `-${match[2]}`;
  if (match[3]) formatted += `-${match[3]}`;

  return formatted;
};

// =============================================
// Format ZIP Code (5 digits only)
// =============================================
export const formatZipCode = (value) => {
  return value.replace(/\D/g, "").slice(0, 5);
};

// =============================================
// Format Currency (add commas)
// =============================================
export const formatCurrency = (value) => {
  const cleaned = value.replace(/\D/g, "");
  return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// =============================================
// Get User's IP Address
// =============================================
export const getUserIP = async () => {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error("Error getting IP:", error);
    return "0.0.0.0"; // Fallback
  }
};

// =============================================
// Generate Unique Tracking ID
// =============================================
export const generateTrackingId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// =============================================
// Validation Helpers
// =============================================
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const isValidPhone = (phone) => {
  const cleaned = phone.replace(/\D/g, "");
  return cleaned.length === 10;
};

export const isValidSSN = (ssn) => {
  const cleaned = ssn.replace(/\D/g, "");
  return cleaned.length === 9;
};

export const isValidZip = (zip) => {
  return /^\d{5}$/.test(zip);
};

export const isValidAge = (month, day, year) => {
  if (!month || !day || !year) return false;

  const birthDate = new Date(year, month - 1, day);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    return age - 1 >= 18;
  }

  return age >= 18;
};
