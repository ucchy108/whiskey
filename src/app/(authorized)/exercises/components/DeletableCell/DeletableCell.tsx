import { IconButton, TableCell } from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import { Exercise } from "@/repositories/workoutRepository";
import { useCallback } from "react";

interface DeletableCellProps {
  exercise: Exercise;
  setExerciseToDelete: (exercise: Exercise) => void;
  setDeleteDialogOpen: (open: boolean) => void;
  disabled?: boolean;
}

export function DeletableCell({
  exercise,
  setExerciseToDelete,
  setDeleteDialogOpen,
  disabled = false,
}: DeletableCellProps) {
  const handleDeleteClick = useCallback(() => {
    setExerciseToDelete(exercise);
    setDeleteDialogOpen(true);
  }, [exercise, setExerciseToDelete, setDeleteDialogOpen]);

  return (
    <TableCell>
      <IconButton
        size="small"
        color="error"
        onClick={handleDeleteClick}
        disabled={disabled}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
    </TableCell>
  );
}
