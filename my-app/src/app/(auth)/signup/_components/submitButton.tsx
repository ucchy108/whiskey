import { Button } from "@mui/material";

interface SignUpSubmitButtonProps {
  onClick: () => void;
}

export function SignUpSubmitButton({ onClick }: SignUpSubmitButtonProps) {
  return (
    <Button type="submit" variant="contained" onClick={onClick}>
      Sign Up
    </Button>
  );
}
