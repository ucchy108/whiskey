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
          color: "rgba(79, 172, 254, 0.3)",
          "&.Mui-active": {
            color: theme.customColors.blue.main,
          },
          "&.Mui-completed": {
            color: theme.customColors.blue.main,
          },
        },
        "& .MuiStepConnector-line": {
          borderColor: "rgba(79, 172, 254, 0.3)",
        },
        "& .Mui-active .MuiStepConnector-line": {
          borderColor: theme.customColors.blue.main,
        },
        "& .Mui-completed .MuiStepConnector-line": {
          borderColor: theme.customColors.blue.main,
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