import { JSX, memo } from "react";
import { Button, ButtonProps } from "@mui/material";

type SubmitButtonProps = ButtonProps & {
  loading: boolean;
};

function SubmitButton({
  children,
  loading,
  loadingIndicator = "通信中...",
  ...props
}: SubmitButtonProps): JSX.Element {
  return (
    <Button
      variant="contained"
      color="primary"
      type="submit"
      loading={loading}
      loadingIndicator={loadingIndicator}
      {...props}
    >
      {children}
    </Button>
  );
}

const MemoizedSubmitButton = memo(SubmitButton);

export { MemoizedSubmitButton as SubmitButton };
