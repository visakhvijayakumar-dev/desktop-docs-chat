import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css"; // minimal reset
// app.css is imported inside App.tsx (step 1)

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
