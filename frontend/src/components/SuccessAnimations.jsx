import { useEffect, useState } from "react";

// =============================================
// Success Animations & Celebration Components
// =============================================

/**
 * Confetti Component
 * Creates falling confetti particles
 */
export function Confetti({ active = true, duration = 5000 }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!active) return;

    // Generate confetti particles
    const newParticles = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10,
      rotation: Math.random() * 360,
      color: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"][
        Math.floor(Math.random() * 5)
      ],
      size: Math.random() * 10 + 5,
      delay: Math.random() * 1000,
      duration: Math.random() * 3000 + 2000,
    }));

    setParticles(newParticles);

    // Clear confetti after duration
    const timer = setTimeout(() => {
      setParticles([]);
    }, duration);

    return () => clearTimeout(timer);
  }, [active, duration]);

  if (!active || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            transform: `rotate(${particle.rotation}deg)`,
            animationDelay: `${particle.delay}ms`,
            animationDuration: `${particle.duration}ms`,
          }}
        />
      ))}
    </div>
  );
}

/**
 * Success Checkmark Animation
 */
export function AnimatedCheckmark({ size = 80, color = "green" }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
  }, []);

  const colors = {
    green: "text-green-500",
    blue: "text-blue-500",
  };

  return (
    <div className={`relative ${show ? "animate-scaleIn" : "opacity-0"}`}>
      {/* Circle background */}
      <div
        className={`rounded-full ${colors[color]} bg-opacity-10 flex items-center justify-center`}
        style={{ width: size, height: size }}
      >
        {/* Checkmark SVG */}
        <svg
          className={colors[color]}
          width={size * 0.6}
          height={size * 0.6}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            className="animate-checkmark"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
    </div>
  );
}

/**
 * Success Card with Animation
 */
export function SuccessCard({
  title = "Success!",
  message,
  redirectUrl,
  countdown = 3,
  onClose,
}) {
  const [timeLeft, setTimeLeft] = useState(countdown);

  useEffect(() => {
    if (!redirectUrl || countdown <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = redirectUrl;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [redirectUrl, countdown]);

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-2xl p-8 text-center animate-scaleIn">
      {/* Checkmark Icon */}
      <div className="flex justify-center mb-6">
        <AnimatedCheckmark size={100} color="green" />
      </div>

      {/* Title */}
      <h2 className="text-3xl font-bold text-gray-900 mb-4 animate-fadeIn">
        {title}
      </h2>

      {/* Message */}
      <p
        className="text-lg text-gray-600 mb-6 animate-fadeIn"
        style={{ animationDelay: "0.2s" }}
      >
        {message}
      </p>

      {/* Redirect Countdown */}
      {redirectUrl && timeLeft > 0 && (
        <div className="animate-fadeIn" style={{ animationDelay: "0.4s" }}>
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="animate-spin h-5 w-5 border-3 border-blue-500 border-t-transparent rounded-full"></div>
            <p className="text-sm text-gray-500">
              Redirecting in {timeLeft} second{timeLeft !== 1 ? "s" : ""}...
            </p>
          </div>
        </div>
      )}

      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          className="mt-4 text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Close
        </button>
      )}
    </div>
  );
}

/**
 * Success Toast Notification
 */
export function SuccessToast({ message, duration = 3000, onClose }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      if (onClose) {
        setTimeout(onClose, 300);
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!show) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slideInRight">
      <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3">
        {/* Check Icon */}
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>

        {/* Message */}
        <span className="font-medium">{message}</span>

        {/* Close Button */}
        <button
          onClick={() => {
            setShow(false);
            if (onClose) setTimeout(onClose, 300);
          }}
          className="ml-4 hover:bg-green-600 rounded p-1"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

/**
 * Celebration Fireworks
 */
export function Fireworks({ active = true, duration = 3000 }) {
  const [bursts, setBursts] = useState([]);

  useEffect(() => {
    if (!active) return;

    const createBurst = () => {
      const burst = {
        id: Date.now(),
        x: Math.random() * 80 + 10,
        y: Math.random() * 50 + 10,
        color: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"][
          Math.floor(Math.random() * 5)
        ],
      };

      setBursts((prev) => [...prev, burst]);

      setTimeout(() => {
        setBursts((prev) => prev.filter((b) => b.id !== burst.id));
      }, 1000);
    };

    const interval = setInterval(createBurst, 500);
    const timer = setTimeout(() => {
      clearInterval(interval);
      setBursts([]);
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [active, duration]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {bursts.map((burst) => (
        <div
          key={burst.id}
          className="absolute"
          style={{ left: `${burst.x}%`, top: `${burst.y}%` }}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-firework"
              style={{
                backgroundColor: burst.color,
                transform: `rotate(${i * 30}deg) translateY(-40px)`,
                animationDelay: `${i * 0.05}s`,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Pulsing Success Badge
 */
export function SuccessBadge({ text = "Success", pulse = true }) {
  return (
    <div
      className={`inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full font-medium ${
        pulse ? "animate-pulse" : ""
      }`}
    >
      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
      {text}
    </div>
  );
}

/**
 * Success Page with Full Effects
 */
export function SuccessPage({
  title = "Congratulations! 🎉",
  message,
  price,
  vendor,
  redirectUrl,
  countdown = 5,
}) {
  return (
    <>
      {/* Confetti */}
      <Confetti active={true} duration={5000} />

      {/* Fireworks */}
      <Fireworks active={true} duration={3000} />

      {/* Success Card */}
      <div className="min-h-screen flex items-center justify-center p-4">
        <SuccessCard
          title={title}
          message={message}
          redirectUrl={redirectUrl}
          countdown={countdown}
        />
      </div>
    </>
  );
}
