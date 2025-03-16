import { TextField } from "@mui/material";

function SigniInPasswordTextField() {
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

export default SigniInPasswordTextField;
