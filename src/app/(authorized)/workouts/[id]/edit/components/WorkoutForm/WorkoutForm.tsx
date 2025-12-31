"use client";

import { useCallback } from "react";
import { FieldError, useFieldArray, useForm } from "react-hook-form";
import { WorkoutDateField } from "../WorkoutDateField";
import { DialyTextField } from "../DialyTextField";
import { workoutFormSchema, WorkoutFormSchema } from "./formSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { Exercise, WorkoutWithDetails } from "@/repositories/workoutRepository";
import { NotesTextField } from "../NotesTextField";
import { DurationTextField } from "../DurationTextField";
import { WeightTextField } from "../WeightTextField";
import { RepsTextField } from "../RepsTextField";
import { SetsTextField } from "../SetsTextField";
import { ExerciseTextField } from "../ExerciseTextField";
import { happyHuesColors } from "@/theme";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useUpdateWorkout } from "../../hooks/useUpdateWorkout";
import { useSuccessSnackbar } from "@/app/hooks/useSuccessSnackbar";
import { useErrorSnackbar } from "@/app/hooks/useErrorSnackbar";

// 運動詳細カードの背景色を順番に適用
const detailColors = [
  happyHuesColors.button,
  happyHuesColors.secondary,
  happyHuesColors.tertiary,
  happyHuesColors.button,
  happyHuesColors.secondary,
  happyHuesColors.tertiary,
];

interface WorkoutFormProps {
  workout: WorkoutWithDetails;
  exercises: Exercise[];
}

export function WorkoutForm({ workout, exercises }: WorkoutFormProps) {
  const router = useRouter();
  const { updateWorkout, error } = useUpdateWorkout();
  const { openSuccessSnackbar } = useSuccessSnackbar();
  const { openErrorSnackbar } = useErrorSnackbar();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<WorkoutFormSchema>({
    resolver: zodResolver(workoutFormSchema),
    mode: "onChange",
    defaultValues: {
      id: workout.id,
      date: workout.date.toString().split("T")[0],
      dialy: workout.dialy || "",
      details: workout.Detail.map((detail) => ({
        id: detail.id,
        exerciseId: detail.exerciseId,
        sets: detail.sets,
        reps: detail.reps || 0,
        weight: detail.weight || 0,
        duration: detail.duration || 0,
        notes: detail.notes || "",
      })),
    },
  });

  const { fields, remove, append } = useFieldArray({
    control,
    name: "details",
  });

  const createDefaultWorkoutDetail = useCallback(() => {
    append({
      id: "",
      exerciseId: exercises[0].id,
      sets: 0,
      reps: 0,
      weight: 0,
      duration: 0,
      notes: "",
    });
  }, [append, exercises]);

  const onSubmit = useCallback(
    async (value: WorkoutFormSchema) => {
      const originalDetailIds = workout.Detail.map((detail) => detail.id);
      const submittedDetailIds =
        value.details?.map((detail) => detail.id) || [];
      const deleteIds = originalDetailIds.filter(
        (id) => !submittedDetailIds.includes(id)
      );

      updateWorkout(value, deleteIds);
      openSuccessSnackbar("ワークアウトを更新しました");
      router.push(`/workouts/${workout.id}`);

      if (error) {
        openErrorSnackbar(error);
      }
    },
    [
      workout.Detail,
      workout.id,
      updateWorkout,
      openSuccessSnackbar,
      router,
      error,
      openErrorSnackbar,
    ]
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        <WorkoutDateField control={control} error={errors.date as FieldError} />
        <DialyTextField control={control} error={errors.dialy as FieldError} />

        {/* 運動詳細 */}
        <Box>
          <Typography variant="h6" gutterBottom>
            運動詳細
          </Typography>
          <Stack spacing={2}>
            {fields.map((field, index) => (
              <Paper
                key={field.id}
                elevation={2}
                sx={{
                  overflow: "hidden",
                  border: "none",
                }}
              >
                {/* カラフルなヘッダー */}
                <Box
                  sx={{
                    background: detailColors[index % detailColors.length],
                    color:
                      index % 3 === 1
                        ? happyHuesColors.headline
                        : happyHuesColors.buttonText,
                    p: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Chip
                      label={index + 1}
                      size="small"
                      sx={{
                        bgcolor: "rgba(255, 255, 255, 0.3)",
                        color: "#fff",
                        fontWeight: "bold",
                      }}
                    />
                    <Typography variant="subtitle1" fontWeight="bold">
                      運動 {index + 1}
                    </Typography>
                  </Box>
                  <IconButton
                    onClick={() => remove(index)}
                    size="small"
                    sx={{
                      color: "#fff",
                      "&:hover": {
                        bgcolor: "rgba(255, 255, 255, 0.2)",
                      },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>

                {/* フォーム内容 */}
                <Stack spacing={2} sx={{ p: 2 }}>
                  <ExerciseTextField
                    exercises={exercises}
                    control={control}
                    error={errors.details?.[index]?.exerciseId}
                    name={`details.${index}.exerciseId`}
                  />

                  <Box sx={{ display: "flex", gap: 2 }}>
                    <SetsTextField
                      control={control}
                      error={errors.details?.[index]?.sets}
                      name={`details.${index}.sets`}
                    />

                    <RepsTextField
                      control={control}
                      error={errors.details?.[index]?.reps}
                      name={`details.${index}.reps`}
                    />
                  </Box>

                  <Box sx={{ display: "flex", gap: 2 }}>
                    <WeightTextField
                      control={control}
                      error={errors.details?.[index]?.weight}
                      name={`details.${index}.weight`}
                    />

                    <DurationTextField
                      control={control}
                      error={errors.details?.[index]?.duration}
                      name={`details.${index}.duration`}
                    />
                  </Box>

                  <NotesTextField
                    control={control}
                    error={errors.details?.[index]?.notes}
                    name={`details.${index}.notes`}
                  />
                </Stack>
              </Paper>
            ))}

            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={createDefaultWorkoutDetail}
            >
              運動を追加
            </Button>
          </Stack>
        </Box>

        <Divider />

        {/* アクション */}
        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
          <Button
            variant="outlined"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            キャンセル
          </Button>
          <Button type="submit" variant="contained" loading={isSubmitting}>
            更新
          </Button>
        </Box>
      </Stack>
    </form>
  );
}
