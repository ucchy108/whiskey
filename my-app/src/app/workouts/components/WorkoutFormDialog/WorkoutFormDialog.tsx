import React, { memo } from "react";
import {
  WorkoutFormSchema,
  workoutFormSchema,
  WorkoutSchema,
} from "@/app/workouts/schema";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { WorkoutNameTextField } from "../WorkoutNameTextField";
import { WorkoutDateTextField } from "../WorkoutDateTextField";
import { WorkoutWeightTextField } from "../WorkoutWeightTextField";
import { WorkoutRepsTextField } from "../WorkoutRepsTextField";
import { WorkoutSetsTextField } from "../WorkoutSetsTextField";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
  const workoutDialogTitle = workout
    ? "ワークアウトの編集"
    : "新しいワークアウト";

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<WorkoutFormSchema>({
    resolver: zodResolver(workoutFormSchema),
    defaultValues: {
      name: workout?.name || "",
      date: workout?.date || new Date().toISOString().split("T")[0],
      weight: workout?.weight || 0,
      reps: workout?.reps || 0,
      sets: workout?.sets || 0,
      memo: workout?.memo,
    },
  });

  const onSubmit = async (data: WorkoutFormSchema) => {
    // TODO: implement save logic
    console.log(data);
    handleCloseDialog();
  };

  return (
    <Dialog open={openDialog} onClose={handleCloseDialog}>
      <DialogTitle>{workoutDialogTitle}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <WorkoutNameTextField control={control} error={errors} />
          <WorkoutDateTextField control={control} error={errors} />
          <WorkoutWeightTextField control={control} error={errors} />
          <WorkoutRepsTextField control={control} error={errors} />
          <WorkoutSetsTextField control={control} error={errors} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>キャンセル</Button>
          <Button type="submit" variant="contained">
            保存
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

const MemoizedWorkoutFormDialog = memo(WorkoutFormDialog);

export { MemoizedWorkoutFormDialog as WorkoutFormDialog };
