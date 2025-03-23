import { TextField } from "@mui/material";

export function SignUpPasswordTextField() {
  return (
    <TextField
      id="password"
      label="Password"
      type="password"
      variant="outlined"
      fullWidth
      required
    />
  );
}
