import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { SystemMonitor } from "./pages/modules/SystemMonitor";
import { ModulePlaceholder } from "./components/ModulePlaceholder";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/modules/system-monitor" element={<SystemMonitor />} />
          <Route
            path="/modules/hosts"
            element={<ModulePlaceholder title="Hosts Manager" />}
          />
          <Route
            path="/modules/proxy"
            element={<ModulePlaceholder title="Reverse Proxy" />}
          />
          <Route
            path="/modules/mock"
            element={<ModulePlaceholder title="Mock API" />}
          />
          <Route
            path="/console"
            element={<ModulePlaceholder title="System Console" />}
          />
          <Route
            path="/settings"
            element={<ModulePlaceholder title="Settings" />}
          />
          {/* Fallback */}
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
