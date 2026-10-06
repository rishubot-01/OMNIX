import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import "./styles/globals.css";

import App from "./App.jsx";

import { AuthProvider } from "./context/AuthContext";
import { AppProvider } from "./context/AppContext";
import { SocketProvider } from "./context/SocketContext";
import GlobalMessageProvider from "./components/message/GlobalMessageManager";

createRoot(
  document.getElementById("root")
).render(
  <StrictMode>
    <AuthProvider>
      <SocketProvider>
        <AppProvider>
          <GlobalMessageProvider>
            <App />
          </GlobalMessageProvider>
        </AppProvider>
      </SocketProvider>
    </AuthProvider>
  </StrictMode>
);