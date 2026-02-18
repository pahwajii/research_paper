import { AppBar, Box, Button, Container, Toolbar, Typography } from "@mui/material";
import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const navItems = [
  { label: "Add Paper", to: "/" },
  { label: "Paper Library", to: "/library" },
  { label: "Analytics", to: "/analytics" }
];

export const AppShell = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const { isAuthenticated, user, signOut } = useAuth();

  return (
    <Box minHeight="100vh" sx={{ position: "relative", overflow: "hidden" }}>
      <Box
        sx={{
          position: "absolute",
          width: 380,
          height: 380,
          borderRadius: "50%",
          top: -120,
          right: -90,
          bgcolor: "rgba(11, 92, 173, 0.12)",
          filter: "blur(10px)",
          pointerEvents: "none"
        }}
      />
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "rgba(11, 92, 173, 0.88)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(255,255,255,0.2)"
        }}
      >
        <Toolbar sx={{ gap: 1, flexWrap: "wrap", minHeight: 72 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Research Paper Reading Tracker
          </Typography>
          {isAuthenticated
            ? navItems.map((item) => (
                <Button
                  key={item.to}
                  component={Link}
                  to={item.to}
                  color="inherit"
                  variant={location.pathname === item.to ? "outlined" : "text"}
                  sx={{ borderColor: "rgba(255,255,255,0.6)" }}
                >
                  {item.label}
                </Button>
              ))
            : null}
          {!isAuthenticated ? (
            <>
              <Button component={Link} to="/login" color="inherit">
                Login
              </Button>
              <Button component={Link} to="/signup" color="inherit" variant="outlined" sx={{ borderColor: "rgba(255,255,255,0.6)" }}>
                Signup
              </Button>
            </>
          ) : (
            <>
              <Typography variant="body2">{user?.name}</Typography>
              <Button color="inherit" onClick={signOut}>
                Logout
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 4, position: "relative" }}>
        <Box className="page-enter">{children}</Box>
      </Container>
    </Box>
  );
};
