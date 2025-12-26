import { Stepper, Step, StepLabel } from "@mui/material";
import { useTheme } from "@mui/material/styles";

interface SignUpStepperProps {
  activeStep: number;
  steps: readonly string[];
}

export function SignUpStepper({ activeStep, steps }: SignUpStepperProps) {
  const theme = useTheme();

  return (
    <Stepper
      activeStep={activeStep}
      alternativeLabel
      sx={{
        "& .MuiStepIcon-root": {
          color: "rgba(98, 70, 234, 0.3)",
          "&.Mui-active": {
            color: theme.happyHues.button,
          },
          "&.Mui-completed": {
            color: theme.happyHues.button,
          },
        },
        "& .MuiStepConnector-line": {
          borderColor: "rgba(98, 70, 234, 0.3)",
        },
        "& .Mui-active .MuiStepConnector-line": {
          borderColor: theme.happyHues.button,
        },
        "& .Mui-completed .MuiStepConnector-line": {
          borderColor: theme.happyHues.button,
        },
      }}
    >
      {steps.map((label) => (
        <Step key={label}>
          <StepLabel>{label}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}