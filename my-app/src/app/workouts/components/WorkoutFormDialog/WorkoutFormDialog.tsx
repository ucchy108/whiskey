import React, { memo } from "react";
import { WorkoutSchema } from "@/app/workouts/schema";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { WorkoutNameTextField } from "../WorkoutNameTextField";
import { WorkoutTypeTextField } from "../WorkoutTypeTextField";
import { WorkoutDateDurationTextField } from "../WorkoutDateDurationTextField";

interface WorkoutFormDialogProps {
  workout: WorkoutSchema | null;
  openDialog: boolean;
  handleCloseDialog: () => void;
}

function WorkoutFormDialog({
  workout,
  openDialog,
  handleCloseDialog,
}: WorkoutFormDialogProps) {
  return (
    <Dialog open={openDialog} onClose={handleCloseDialog}>
      <DialogTitle>
        {workout ? "ワークアウトを追加" : "ワークアウトを編集"}
      </DialogTitle>
      <DialogContent>
        <WorkoutNameTextField />
        <WorkoutTypeTextField />
        <WorkoutDateDurationTextField />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog}>キャンセル</Button>
        <Button variant="contained">保存</Button>
      </DialogActions>
    </Dialog>
  );
}

const MemoizedWorkoutFormDialog = memo(WorkoutFormDialog);

export { MemoizedWorkoutFormDialog as WorkoutFormDialog };
