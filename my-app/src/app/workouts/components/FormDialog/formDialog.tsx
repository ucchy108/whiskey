import React, { memo } from "react";
import { WorkoutSchema } from "@/app/workouts/schema";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { NameTextField } from "../NameTextField";
import { TypeTextField } from "../TypeTextField";
import { DateDurationTextField } from "../DateDurationTextField";

interface FormDialogProps {
  workout: WorkoutSchema | null;
  openDialog: boolean;
  handleCloseDialog: () => void;
}

function FormDialog({
  workout,
  openDialog,
  handleCloseDialog,
}: FormDialogProps) {
  return (
    <Dialog open={openDialog} onClose={handleCloseDialog}>
      <DialogTitle>
        {workout ? "ワークアウトを追加" : "ワークアウトを編集"}
      </DialogTitle>
      <DialogContent>
        <NameTextField />
        <TypeTextField />
        <DateDurationTextField />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog}>キャンセル</Button>
        <Button variant="contained">保存</Button>
      </DialogActions>
    </Dialog>
  );
}

const MemoizedFormDialog = memo(FormDialog);

export { MemoizedFormDialog as FormDialog };
