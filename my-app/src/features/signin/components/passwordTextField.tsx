import { TextField } from "@mui/material";

export function SignInPasswordTextField() {
  return (
    <TextField
      id="password"
      label="Password"
      type="password"
      name="password"
      variant="outlined"
      fullWidth
      required
    />
  );
}
