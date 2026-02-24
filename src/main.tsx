/**
 * The entry point of the application.
 * This file renders the root App component into the DOM.
 */
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
