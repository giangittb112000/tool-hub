import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { SystemMonitor } from "./pages/modules/system-monitor";
import { JsonFormatter } from "./pages/modules/json-formatter";
import { ModulePlaceholder } from "./components/ModulePlaceholder";
import { MockApi } from "./pages/modules/mock-api";

import { ToastProvider } from "./components/ui/Toast";

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/modules/system-monitor" element={<SystemMonitor />} />
            <Route path="/modules/json-formatter" element={<JsonFormatter />} />
            <Route
              path="/modules/hosts"
              element={<ModulePlaceholder title="Hosts Manager" />}
            />
            <Route
              path="/modules/proxy"
              element={<ModulePlaceholder title="Reverse Proxy" />}
            />
            <Route path="/modules/mock" element={<MockApi />} />
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
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
