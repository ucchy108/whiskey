import React from "react";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

const workoutTypes = [
  "ランニング",
  "サイクリング",
  "スイミング",
  "筋トレ",
  "ヨガ",
  "ピラティス",
  "ダンス",
  "その他",
];

function WorkoutTypeTextField() {
  return (
    <FormControl fullWidth sx={{ mb: 2 }}>
      <InputLabel>タイプ</InputLabel>
      <Select
        name="type"
        // value={formData.type}
        label="タイプ"
        // onChange={handleSelectChange}
      >
        {workoutTypes.map((type) => (
          <MenuItem key={type} value={type}>
            {type}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

const MemoizedWorkoutTypeTextField = React.memo(WorkoutTypeTextField);

export { MemoizedWorkoutTypeTextField as WorkoutTypeTextField };
