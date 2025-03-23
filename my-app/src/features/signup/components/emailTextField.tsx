import { TextField } from "@mui/material";

export function SignUpEmailTextField() {
  return (
    <TextField
      id="email"
      label="Email"
      type="email"
      variant="outlined"
      fullWidth
      required
    />
  );
}
