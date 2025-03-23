import { TextField } from "@mui/material";
import { Control, Controller } from "react-hook-form";
import { SignUpFormSchema } from "../schema";

interface SignUpPasswordTextFieldProps {
  control: Control<SignUpFormSchema>;
}

function SignUpPasswordTextField({ control }: SignUpPasswordTextFieldProps) {
  return (
    <Controller
      name="password"
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          id="password"
          label="Password"
          type="password"
          variant="outlined"
          fullWidth
          required
        />
      )}
    />
  );
}

export default SignUpPasswordTextField;
