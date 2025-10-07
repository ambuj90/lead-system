import { useState, useEffect } from "react";

// =============================================
// Mobile-Optimized Components
// =============================================

/**
 * Mobile Header - Sticky header for mobile
 */
export function MobileHeader({ title, progress }) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY < lastScrollY || currentScrollY < 50);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <div
      className={`lg:hidden fixed top-0 left-0 right-0 bg-white shadow-md z-40 transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="px-4 py-3">
        <h1 className="text-lg font-bold text-gray-900">{title}</h1>
        {progress !== undefined && (
          <div className="mt-2 flex items-center">
            <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium text-gray-700">
              {progress}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Mobile Bottom Bar - Fixed bottom action bar
 */
export function MobileBottomBar({ children, show = true }) {
  if (!show) return null;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40 safe-area-bottom">
      <div className="px-4 py-3">{children}</div>
    </div>
  );
}

/**
 * Touch-Friendly Button
 */
export function TouchButton({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  fullWidth = false,
  className = "",
}) {
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400",
    danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-6 py-3.5 rounded-lg font-semibold
        transition-all duration-200
        active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed
        touch-manipulation
        ${variants[variant]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      style={{ minHeight: "48px" }} // Touch target size
    >
      {children}
    </button>
  );
}

/**
 * Swipeable Card
 */
export function SwipeableCard({ children, onSwipeLeft, onSwipeRight }) {
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft();
    }
    if (isRightSwipe && onSwipeRight) {
      onSwipeRight();
    }
  };

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className="touch-pan-y"
    >
      {children}
    </div>
  );
}

/**
 * Mobile Select - Native select with better styling
 */
export function MobileSelect({ label, value, onChange, options, error }) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <select
        value={value}
        onChange={onChange}
        className={`
          w-full px-4 py-3 text-base
          border-2 rounded-lg
          appearance-none
          ${error ? "border-red-500" : "border-gray-300"}
          focus:outline-none focus:ring-2 focus:ring-blue-500
        `}
        style={{ minHeight: "48px" }} // Touch target
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * Pull to Refresh
 */
export function PullToRefresh({ onRefresh, children }) {
  const [pulling, setPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  const handleTouchStart = (e) => {
    if (window.scrollY === 0) {
      setPulling(true);
    }
  };

  const handleTouchMove = (e) => {
    if (pulling && window.scrollY === 0) {
      setPullDistance(Math.min(e.touches[0].clientY, 100));
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance > 70) {
      onRefresh();
    }
    setPulling(false);
    setPullDistance(0);
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {pulling && (
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-center transition-all"
          style={{ height: pullDistance }}
        >
          <div className="animate-spin h-6 w-6 border-3 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      )}
      <div style={{ transform: `translateY(${pullDistance}px)` }}>
        {children}
      </div>
    </div>
  );
}

/**
 * Mobile Tab Bar
 */
export function MobileTabBar({ tabs, activeTab, onChange }) {
  return (
    <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-200">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`
            flex-shrink-0 px-6 py-3 text-sm font-medium
            border-b-2 transition-colors
            ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

/**
 * Floating Action Button (FAB)
 */
export function FAB({ onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className="
        fixed bottom-6 right-6 lg:hidden
        w-14 h-14 rounded-full
        bg-blue-600 text-white
        shadow-lg hover:shadow-xl
        flex items-center justify-center
        active:scale-95 transition-all
        z-30
      "
      aria-label={label}
    >
      {icon}
    </button>
  );
}

/**
 * Mobile Drawer/Bottom Sheet
 */
export function MobileDrawer({ isOpen, onClose, children, title }) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden animate-fadeIn"
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 max-h-[90vh] overflow-hidden lg:hidden animate-slideUp">
        {/* Handle */}
        <div className="flex justify-center py-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-4">
          {children}
        </div>
      </div>
    </>
  );
}
