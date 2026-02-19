import { Alert, Button, Card, CardContent, Stack, TextField, Typography } from "@mui/material";
import { FormEvent, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { login } from "../api/client";
import { useAuth } from "../auth/AuthContext";

interface LocationState {
  from?: string;
}

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, isAuthenticated, isHydrated } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, isHydrated, navigate]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      setIsSubmitting(true);
      setError("");
      const response = await login({ email, password });
      signIn(response.token, response.user);

      const state = location.state as LocationState | null;
      navigate(state?.from || "/", { replace: true });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="glass-card" sx={{ maxWidth: 520, mx: "auto" }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Login
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Sign in to access your research paper tracker.
        </Typography>

        <Stack component="form" spacing={2} onSubmit={onSubmit}>
          {error ? <Alert severity="error">{error}</Alert> : null}

          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            sx={{ py: 1.2, background: "linear-gradient(135deg, #0B5CAD 0%, #1F8A70 100%)" }}
          >
            {isSubmitting ? "Signing in..." : "Login"}
          </Button>

          <Typography variant="body2">
            New user? <Link to="/signup">Create an account</Link>
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};
