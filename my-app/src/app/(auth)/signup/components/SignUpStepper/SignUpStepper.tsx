import { Stepper, Step, StepLabel } from "@mui/material";

interface SignUpStepperProps {
  activeStep: number;
  steps: readonly string[];
}

export function SignUpStepper({ activeStep, steps }: SignUpStepperProps) {
  return (
    <Stepper activeStep={activeStep} alternativeLabel>
      {steps.map((label) => (
        <Step key={label}>
          <StepLabel>{label}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}