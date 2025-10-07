import { useState } from "react";

function TestingPanel() {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});

  const runTest = async (testName, endpoint) => {
    setLoading((prev) => ({ ...prev, [testName]: true }));
    try {
      const response = await fetch(endpoint);
      const data = await response.json();
      setResults((prev) => ({
        ...prev,
        [testName]: {
          success: response.ok,
          data,
        },
      }));
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        [testName]: {
          success: false,
          error: error.message,
        },
      }));
    } finally {
      setLoading((prev) => ({ ...prev, [testName]: false }));
    }
  };

  const tests = [
    {
      name: "Database Connection",
      key: "database",
      endpoint: "/api/test-db",
      description: "Test MySQL connection",
    },
    {
      name: "Vendor Configuration",
      key: "vendors",
      endpoint: "/api/test-vendors",
      description: "Check ITMedia & LeadsMarket credentials",
    },
    {
      name: "Statistics",
      key: "stats",
      endpoint: "/api/leads/stats/summary",
      description: "View lead statistics",
    },
    {
      name: "Recent Leads",
      key: "leads",
      endpoint: "/api/leads",
      description: "View recent lead submissions",
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          🧪 System Testing Panel
        </h2>
        <span className="text-sm text-gray-500">Phase 3 Complete</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {tests.map((test) => (
          <div
            key={test.key}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-gray-800">{test.name}</h3>
                <p className="text-sm text-gray-500">{test.description}</p>
              </div>
              {results[test.key] && (
                <span
                  className={`text-2xl ${
                    results[test.key].success
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {results[test.key].success ? "✓" : "✗"}
                </span>
              )}
            </div>

            <button
              onClick={() => runTest(test.key, test.endpoint)}
              disabled={loading[test.key]}
              className="mt-2 w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 text-sm font-medium transition-colors"
            >
              {loading[test.key] ? "Testing..." : "Run Test"}
            </button>

            {results[test.key] && (
              <div className="mt-3">
                <details className="text-xs">
                  <summary className="cursor-pointer text-gray-600 hover:text-gray-800 font-medium">
                    View Response
                  </summary>
                  <pre className="mt-2 p-2 bg-gray-50 rounded border border-gray-200 overflow-auto max-h-40 text-xs">
                    {JSON.stringify(
                      results[test.key].data || results[test.key].error,
                      null,
                      2
                    )}
                  </pre>
                </details>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 pt-4">
        <h3 className="font-semibold text-gray-800 mb-3">Quick Links</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <a
            href="http://localhost:5000/api/health"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            API Health →
          </a>
          <a
            href="http://localhost:5000/api/vendors"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            Vendors Config →
          </a>
          <a
            href="http://localhost:5000/api/generate-test-data"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            Test Data →
          </a>
          <a
            href="http://localhost/phpmyadmin"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            phpMyAdmin →
          </a>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>💡 Tip:</strong> Run all tests to verify your system is ready.
          Make sure USE_TEST_MODE=true in your .env file during development.
        </p>
      </div>
    </div>
  );
}

export default TestingPanel;
