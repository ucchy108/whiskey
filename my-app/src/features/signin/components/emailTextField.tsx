import { TextField } from "@mui/material";

export function SignInEmailTextField() {
  return (
    <TextField
      id="email"
      label="Email"
      type="email"
      name="email"
      variant="outlined"
      fullWidth
      required
    />
  );
}
