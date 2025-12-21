import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import App from "./App.tsx";
import "./index.css";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#6366f1", // Indigo
    },
    secondary: {
      main: "#8b5cf6", // Violet
    },
    background: {
      default: "#0f172a", // Slate 900
      paper: "#1e293b", // Slate 800
    },
  },
  typography: {
    fontFamily:
      '"DM Sans", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>
);
