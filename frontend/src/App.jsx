import { useState } from "react";
import LeadForm from "./components/LeadForm";

function App() {
  const [showDevPanel, setShowDevPanel] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Main Content Container */}
      <LeadForm />
    </div>
  );
}

export default App;
