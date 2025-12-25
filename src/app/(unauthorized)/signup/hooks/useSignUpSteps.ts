import { useCallback, useState } from "react";
import { UseFormTrigger } from "react-hook-form";
import { SignUpFormSchema } from "../components/SignUpForm/formSchema";

const STEPS = ["認証情報", "プロフィール"] as const;

interface UseSignUpStepsReturn {
  activeStep: number;
  steps: readonly string[];
  isLastStep: boolean;
  isFirstStep: boolean;
  handleNext: () => Promise<void>;
  handleBack: () => void;
}

export function useSignUpSteps(
  trigger: UseFormTrigger<SignUpFormSchema>
): UseSignUpStepsReturn {
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = useCallback(async () => {
    if (activeStep === 0) {
      const stepOneFields = ["email", "password"] as const;
      const isStepValid = await trigger(stepOneFields);
      
      if (isStepValid) {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
      }
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  }, [activeStep, trigger]);

  const handleBack = useCallback(() => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  }, []);

  const isLastStep = activeStep === STEPS.length - 1;
  const isFirstStep = activeStep === 0;

  return {
    activeStep,
    steps: STEPS,
    isLastStep,
    isFirstStep,
    handleNext,
    handleBack,
  };
}