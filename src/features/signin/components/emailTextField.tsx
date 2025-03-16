import { TextField } from "@mui/material";

function SignInEmailTextField() {
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

export default SignInEmailTextField;
