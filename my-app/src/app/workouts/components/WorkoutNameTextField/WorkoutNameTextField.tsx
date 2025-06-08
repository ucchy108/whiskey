import React from "react";
import { TextField } from "@mui/material";

function WorkoutNameTextField() {
  return (
    <TextField
      autoFocus
      margin="dense"
      name="name"
      label="ワークアウト名"
      fullWidth
      variant="outlined"
      sx={{ mb: 2 }}
    />
  );
}

const MemoizedWorkoutNameTextField = React.memo(WorkoutNameTextField);

export { MemoizedWorkoutNameTextField as WorkoutNameTextField };
