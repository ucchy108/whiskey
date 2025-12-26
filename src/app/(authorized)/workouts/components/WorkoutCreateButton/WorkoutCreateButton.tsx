import { Add } from "@mui/icons-material";
import { Button, ButtonProps } from "@mui/material";

type WorkoutCreateButtonProps = {
  onClick: () => void;
  name: string;
  props?: ButtonProps;
};

function WorkoutCreateButton({ onClick, name }: WorkoutCreateButtonProps) {
  return (
    <Button
      variant="contained"
      size="large"
      startIcon={<Add />}
      onClick={onClick}
      sx={{
        mb: 6,
        py: 1.5,
        px: 4,
        borderRadius: 3,
        fontSize: "1.1rem",
        fontWeight: "bold",
      }}
    >
      {name}
    </Button>
  );
}

export default WorkoutCreateButton;
