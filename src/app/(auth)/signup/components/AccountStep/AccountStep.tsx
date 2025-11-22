import { NameTextField } from "../NameTextField";
import { AgeTextField } from "../AgeTextField";
import { WeightTextField } from "../WeightTextField";
import { HeightTextField } from "../HeightTextField";
import { Stack } from "@mui/material";
import { Control, FieldError } from "react-hook-form";
import { SignUpFormSchema } from "../SignUpForm/formSchema";

interface AccountStepProps {
  control: Control<SignUpFormSchema>;
  errors: {
    name?: FieldError;
    age?: FieldError;
    weight?: FieldError;
    height?: FieldError;
  };
}

export function AccountStep({ control, errors }: AccountStepProps) {
  return (
    <Stack spacing={2}>
      <NameTextField control={control} error={errors.name as FieldError} />
      <AgeTextField control={control} error={errors.age as FieldError} />
      <WeightTextField control={control} error={errors.weight as FieldError} />
      <HeightTextField control={control} error={errors.height as FieldError} />
    </Stack>
  );
}
