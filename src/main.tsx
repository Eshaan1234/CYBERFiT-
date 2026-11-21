import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Remove the static boot placeholder once React has painted.
requestAnimationFrame(() => {
  window.setTimeout(() => document.getElementById("boot")?.remove(), 60);
});
