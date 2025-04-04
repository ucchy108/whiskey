import { Button } from "@mui/material";

interface SignInSubmitButtonProps {
  onClick: () => void;
}

export function SignInSubmitButton({ onClick }: SignInSubmitButtonProps) {
  return (
    <Button type="submit" variant="contained" onClick={onClick}>
      Sign in
    </Button>
  );
}
