import { TextField } from "@mui/material";
import { Control, Controller } from "react-hook-form";
import { SignUpFormSchema } from "../schema";

interface SignUpEmailTextFieldProps {
  control: Control<SignUpFormSchema>;
}

function SignUpEmailTextField({ control }: SignUpEmailTextFieldProps) {
  return (
    <Controller
      name="email"
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          id="email"
          label="Email"
          type="email"
          variant="outlined"
          fullWidth
          required
        />
      )}
    />
  );
}

export default SignUpEmailTextField;
