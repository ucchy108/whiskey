import React from "react";
import { TextField } from "@mui/material";

function WorkoutDateDurationTextField() {
  return (
    <>
      <TextField
        margin="dense"
        name="duration"
        label="時間（分）"
        type="number"
        fullWidth
        variant="outlined"
        // value={formData.duration}
        // onChange={handleFormChange}
        sx={{ mb: 2 }}
      />
      <TextField
        margin="dense"
        name="date"
        label="日付"
        type="date"
        fullWidth
        variant="outlined"
        // value={formData.date}
        // onChange={handleFormChange}
      />
    </>
  );
}

const MemoizedWorkoutDateDurationTextField = React.memo(
  WorkoutDateDurationTextField
);

export { MemoizedWorkoutDateDurationTextField as WorkoutDateDurationTextField };
