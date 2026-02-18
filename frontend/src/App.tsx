import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { AddPaperPage } from "./pages/AddPaperPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { LoginPage } from "./pages/LoginPage";
import { PaperLibraryPage } from "./pages/PaperLibraryPage";
import { SignupPage } from "./pages/SignupPage";

const theme = createTheme({
  palette: {
    primary: {
      main: "#0B5CAD"
    },
    secondary: {
      main: "#1F8A70"
    },
    background: {
      default: "#f2f7ff"
    }
  },
  typography: {
    fontFamily: "'Plus Jakarta Sans', 'Segoe UI', sans-serif",
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 }
  },
  shape: {
    borderRadius: 16
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          boxShadow: "0 14px 35px rgba(11, 55, 100, 0.08)",
          border: "1px solid rgba(255,255,255,0.55)",
          background: "rgba(255,255,255,0.78)",
          backdropFilter: "blur(8px)",
          transition: "transform 180ms ease, box-shadow 180ms ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 20px 38px rgba(11, 55, 100, 0.12)"
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: "none",
          fontWeight: 600
        }
      }
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined"
      }
    }
  }
});

const App = () => {
  const AuthRedirect = () => {
    const { isAuthenticated } = useAuth();
    if (isAuthenticated) {
      return <Navigate to="/" replace />;
    }
    return <Navigate to="/login" replace />;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <AppShell>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AddPaperPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/library"
                element={
                  <ProtectedRoute>
                    <PaperLibraryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <AnalyticsPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<AuthRedirect />} />
            </Routes>
          </AppShell>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
