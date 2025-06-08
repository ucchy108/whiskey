import React from "react";
import { TextField } from "@mui/material";

function NameTextField() {
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

const MemoizedNameTextField = React.memo(NameTextField);

export { MemoizedNameTextField as NameTextField };
