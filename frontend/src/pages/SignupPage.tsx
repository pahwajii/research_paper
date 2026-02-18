import { Alert, Button, Card, CardContent, Stack, TextField, Typography } from "@mui/material";
import { FormEvent, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../api/client";
import { useAuth } from "../auth/AuthContext";

export const SignupPage = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const validationError = useMemo(() => {
    if (!name.trim()) return "Name is required.";
    if (!email.trim()) return "Email is required.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    return "";
  }, [name, email, password]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      const response = await signup({ name, email, password });
      signIn(response.token, response.user);
      navigate("/", { replace: true });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Signup failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="glass-card" sx={{ maxWidth: 520, mx: "auto" }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Signup
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Create an account to save and analyze papers securely.
        </Typography>

        <Stack component="form" spacing={2} onSubmit={onSubmit}>
          {error ? <Alert severity="error">{error}</Alert> : null}

          <TextField label="Name" value={name} onChange={(event) => setName(event.target.value)} required />

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
            {isSubmitting ? "Creating..." : "Signup"}
          </Button>

          <Typography variant="body2">
            Already have an account? <Link to="/login">Login</Link>
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};
