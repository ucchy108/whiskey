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
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        "&:hover": {
          background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
          transform: "translateY(-2px)",
          boxShadow: "0 8px 25px rgba(102, 126, 234, 0.3)",
        },
        transition: "all 0.3s ease-in-out",
      }}
    >
      {name}
    </Button>
  );
}

export default WorkoutCreateButton;
