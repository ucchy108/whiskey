import { Button, ButtonProps } from "@mui/material";

type WorkoutCreateButtonProps = {
  onClick: () => void;
  name: string;
  props?: ButtonProps;
};

function WorkoutCreateButton({
  onClick,
  name,
  props,
}: WorkoutCreateButtonProps) {
  return (
    <Button variant="contained" onClick={onClick} sx={{ mb: 2 }} {...props}>
      {name}
    </Button>
  );
}

export default WorkoutCreateButton;
