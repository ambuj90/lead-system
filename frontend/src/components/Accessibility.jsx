import { useEffect } from "react";

// =============================================
// Accessibility Components and Utilities
// =============================================

/**
 * Skip to Content Link
 * Allows keyboard users to skip navigation
 */
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:shadow-lg"
    >
      Skip to main content
    </a>
  );
}

/**
 * Screen Reader Only Text
 */
export function ScreenReaderOnly({ children }) {
  return <span className="sr-only">{children}</span>;
}

/**
 * Accessible Icon Button
 */
export function IconButton({ icon, label, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    >
      {icon}
      <ScreenReaderOnly>{label}</ScreenReaderOnly>
    </button>
  );
}

/**
 * Accessible Modal
 */
export function AccessibleModal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (isOpen) {
      // Trap focus in modal
      const modal = document.getElementById("accessible-modal");
      const focusableElements = modal?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements && focusableElements.length > 0) {
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleTab = (e) => {
          if (e.key === "Tab") {
            if (e.shiftKey) {
              if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
              }
            } else {
              if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
              }
            }
          }

          if (e.key === "Escape") {
            onClose();
          }
        };

        document.addEventListener("keydown", handleTab);
        firstElement?.focus();

        return () => document.removeEventListener("keydown", handleTab);
      }
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      id="accessible-modal"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6">
        <h2 id="modal-title" className="text-xl font-bold text-gray-900 mb-4">
          {title}
        </h2>

        {children}

        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
        >
          <svg
            className="w-6 h-6"
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
        </button>
      </div>
    </div>
  );
}

/**
 * Progress Indicator with ARIA
 */
export function AccessibleProgress({ value, max = 100, label }) {
  const percentage = (value / max) * 100;

  return (
    <div>
      <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
        <span id="progress-label">{label}</span>
        <span aria-live="polite">{Math.round(percentage)}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-labelledby="progress-label"
        className="w-full bg-gray-200 rounded-full h-3 overflow-hidden"
      >
        <div
          className="bg-blue-600 h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

/**
 * Alert/Notification with ARIA
 */
export function AccessibleAlert({ type = "info", title, message, onClose }) {
  const types = {
    info: {
      role: "status",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      ),
      color: "bg-blue-50 text-blue-800 border-blue-200",
    },
    success: {
      role: "status",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      ),
      color: "bg-green-50 text-green-800 border-green-200",
    },
    warning: {
      role: "alert",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      ),
      color: "bg-yellow-50 text-yellow-800 border-yellow-200",
    },
    error: {
      role: "alert",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      ),
      color: "bg-red-50 text-red-800 border-red-200",
    },
  };

  const config = types[type];

  return (
    <div
      role={config.role}
      aria-live={
        type === "error" || type === "warning" ? "assertive" : "polite"
      }
      className={`p-4 rounded-lg border ${config.color} flex items-start`}
    >
      <div className="flex-shrink-0">{config.icon}</div>
      <div className="ml-3 flex-1">
        {title && <h3 className="font-medium">{title}</h3>}
        {message && <p className="mt-1 text-sm">{message}</p>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Dismiss alert"
          className="ml-4 flex-shrink-0 p-1 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

/**
 * Live Region for Dynamic Announcements
 */
export function LiveRegion({ children, priority = "polite" }) {
  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {children}
    </div>
  );
}

/**
 * Keyboard Navigation Helper
 */
export function useKeyboardNavigation(refs, options = {}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      const currentIndex = refs.findIndex(
        (ref) => ref.current === document.activeElement
      );

      if (e.key === "ArrowDown" || (e.key === "Tab" && !e.shiftKey)) {
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % refs.length;
        refs[nextIndex]?.current?.focus();
      }

      if (e.key === "ArrowUp" || (e.key === "Tab" && e.shiftKey)) {
        e.preventDefault();
        const prevIndex =
          currentIndex === 0 ? refs.length - 1 : currentIndex - 1;
        refs[prevIndex]?.current?.focus();
      }

      if (options.onEscape && e.key === "Escape") {
        options.onEscape();
      }

      if (options.onEnter && e.key === "Enter") {
        options.onEnter();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [refs, options]);
}

/**
 * Focus Trap Component
 */
export function FocusTrap({ children, active = true }) {
  useEffect(() => {
    if (!active) return;

    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTab = (e) => {
      if (e.key === "Tab") {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener("keydown", handleTab);
    return () => document.removeEventListener("keydown", handleTab);
  }, [active]);

  return <>{children}</>;
}
