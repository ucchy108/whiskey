import { Button } from "@mui/material";

interface SignInSubmitButtonProps {
  onClick: () => void;
}

export function SignInSubmitButton({ onClick }: SignInSubmitButtonProps) {
  return (
    <Button type="submit" variant="contained" fullWidth onClick={onClick}>
      Sign in
    </Button>
  );
}
