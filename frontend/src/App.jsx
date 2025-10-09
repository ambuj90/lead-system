import { useState } from "react";
// import LeadForm from "./components/LeadForm";
// import TestingPanel from "./components/TestingPanel";
// import { SkipToContent } from "./components/Accessibility";
import Test from "./Test";

function App() {
  const [showDevPanel, setShowDevPanel] = useState(false);
  const [showTestPanel, setShowTestPanel] = useState(true);

  return (
    <>
      {/* Skip to Content Link for Accessibility */}
      {/* <SkipToContent /> */}

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Main Lead Form */}
          <Test />
        </div>
      </div>
    </>
  );
}

export default App;
