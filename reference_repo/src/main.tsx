import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles/tokens.css";

// Note: React.StrictMode is intentionally omitted. Its double-mount in dev makes
// VideoSDK's auto-join fire twice, creating a duplicate local participant.
createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
