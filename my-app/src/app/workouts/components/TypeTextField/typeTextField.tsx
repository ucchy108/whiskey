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

function TypeTextField() {
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

const MemoizedTypeTextField = React.memo(TypeTextField);

export { MemoizedTypeTextField as TypeTextField };
