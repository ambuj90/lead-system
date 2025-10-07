// =============================================
// Loading States & Skeleton Components
// =============================================

/**
 * Spinner - Simple loading spinner
 */
export function Spinner({ size = "md", color = "blue" }) {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  const colors = {
    blue: "border-blue-600",
    white: "border-white",
    gray: "border-gray-600",
  };

  return (
    <div
      className={`${sizes[size]} border-4 ${colors[color]} border-t-transparent rounded-full animate-spin`}
    ></div>
  );
}

/**
 * Loading Button - Button with loading state
 */
export function LoadingButton({
  loading,
  children,
  onClick,
  disabled,
  className = "",
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className={`relative ${className} ${
        loading || disabled ? "opacity-70 cursor-not-allowed" : ""
      }`}
    >
      {loading && (
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Spinner size="sm" color="white" />
        </span>
      )}
      <span className={loading ? "opacity-0" : ""}>{children}</span>
    </button>
  );
}

/**
 * Skeleton - Loading placeholder
 */
export function Skeleton({ className = "", animate = true }) {
  return (
    <div
      className={`bg-gray-200 rounded ${
        animate ? "animate-pulse" : ""
      } ${className}`}
    ></div>
  );
}

/**
 * Skeleton Text - Text loading placeholder
 */
export function SkeletonText({ lines = 3, className = "" }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {[...Array(lines)].map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i === lines - 1 ? "w-3/4" : "w-full"}`}
        />
      ))}
    </div>
  );
}

/**
 * Skeleton Form Field - Form input placeholder
 */
export function SkeletonFormField() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

/**
 * Processing Overlay - Full screen loading
 */
export function ProcessingOverlay({ message = "Processing...", steps = [] }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="flex flex-col items-center">
          {/* Main spinner */}
          <Spinner size="xl" color="blue" />

          {/* Message */}
          <h3 className="mt-6 text-xl font-semibold text-gray-900">
            {message}
          </h3>

          {/* Steps */}
          {steps.length > 0 && (
            <div className="mt-6 w-full space-y-3">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center text-sm">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                      step.status === "completed"
                        ? "bg-green-500"
                        : step.status === "active"
                        ? "bg-blue-500"
                        : "bg-gray-300"
                    }`}
                  >
                    {step.status === "completed" ? (
                      <svg
                        className="w-4 h-4 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : step.status === "active" ? (
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                    ) : (
                      <span className="text-white text-xs">{index + 1}</span>
                    )}
                  </div>
                  <span
                    className={`${
                      step.status === "completed"
                        ? "text-green-600"
                        : step.status === "active"
                        ? "text-blue-600 font-medium"
                        : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Helpful message */}
          <p className="mt-4 text-sm text-gray-500 text-center">
            Please don't close this window
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Dots Loading - Simple animated dots
 */
export function DotsLoading({ color = "blue" }) {
  const dotColor = {
    blue: "bg-blue-600",
    gray: "bg-gray-600",
    white: "bg-white",
  };

  return (
    <div className="flex space-x-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`w-2 h-2 ${dotColor[color]} rounded-full animate-bounce`}
          style={{ animationDelay: `${i * 0.1}s` }}
        ></div>
      ))}
    </div>
  );
}

/**
 * Progress Ring - Circular progress indicator
 */
export function ProgressRing({ progress, size = 120, strokeWidth = 8 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-blue-600 transition-all duration-500"
          strokeLinecap="round"
        />
      </svg>
      {/* Percentage text */}
      <span className="absolute text-2xl font-bold text-gray-900">
        {Math.round(progress)}%
      </span>
    </div>
  );
}

/**
 * Loading Bar - Linear progress indicator
 */
export function LoadingBar({
  progress,
  showPercentage = true,
  className = "",
}) {
  return (
    <div className={className}>
      {showPercentage && (
        <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500 ease-out relative overflow-hidden"
          style={{ width: `${progress}%` }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
        </div>
      </div>
    </div>
  );
}
