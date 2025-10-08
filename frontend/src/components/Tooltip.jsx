import { useState } from "react";

// =============================================
// Tooltip Component
// Shows helpful hints on hover/click
// =============================================

export function Tooltip({ children, content, position = "top" }) {
  const [show, setShow] = useState(false);

  const positions = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowPositions = {
    top: "top-full left-1/2 -translate-x-1/2 -mt-1",
    bottom: "bottom-full left-1/2 -translate-x-1/2 -mb-1",
    left: "left-full top-1/2 -translate-y-1/2 -ml-1",
    right: "right-full top-1/2 -translate-y-1/2 -mr-1",
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
      >
        {children}
      </div>

      {show && (
        <div className={`absolute ${positions[position]} z-50 animate-fadeIn`}>
          <div className="bg-gray-900 text-white text-sm rounded-lg px-3 py-2 shadow-lg max-w-xs">
            {content}
          </div>
          <div
            className={`absolute ${arrowPositions[position]} w-2 h-2 bg-gray-900 transform rotate-45`}
          ></div>
        </div>
      )}
    </div>
  );
}

// =============================================
// Info Icon with Tooltip
// =============================================

export function InfoTooltip({ content, position = "top" }) {
  return (
    <Tooltip content={content} position={position}>
      <button
        type="button"
        className="inline-flex items-center justify-center w-5 h-5 text-gray-400 hover:text-blue-600 transition-colors"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </Tooltip>
  );
}

// =============================================
// Help Text Component
// =============================================

export function HelpText({ children, className = "", id }) {
  return (
    <p
      id={id}
      className={`text-xs text-gray-500 mt-2 flex items-start ${className}`}
    >
      <svg
        className="w-4 h-4 mr-1 flex-shrink-0 mt-0.5 text-gray-400"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clipRule="evenodd"
        />
      </svg>
      <span>{children}</span>
    </p>
  );
}
