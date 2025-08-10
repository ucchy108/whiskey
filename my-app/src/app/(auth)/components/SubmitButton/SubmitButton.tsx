import { memo } from "react";
import { Button } from "@mui/material";

interface SubmitButtonProps {
  onClick: () => void;
}

function SubmitButton({ onClick }: SubmitButtonProps) {
  return (
    <Button variant="contained" color="primary" onClick={onClick} fullWidth>
      Submit
    </Button>
  );
}

const MemoizedSubmitButton = memo(SubmitButton);

export { MemoizedSubmitButton as SubmitButton };
