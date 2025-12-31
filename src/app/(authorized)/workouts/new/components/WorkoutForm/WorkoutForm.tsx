"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, FieldError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Stack,
  Typography,
  Divider,
  Paper,
  Chip,
  IconButton,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { workoutFormSchema, WorkoutFormSchema } from "./formSchema";
import { useErrorSnackbar } from "@/app/hooks/useErrorSnackbar";
import { useSuccessSnackbar } from "@/app/hooks/useSuccessSnackbar";
import { Exercise } from "@/repositories/workoutRepository";
import { WorkoutDateField } from "../WorkoutDateField";
import { DialyTextField } from "../DialyTextField";
import { useCreateWorkout } from "../../hooks/useCreateWorkout";
import { happyHuesColors } from "@/theme";
import { ExerciseTextField } from "../ExerciseTextField";
import { SetsTextField } from "../SetsTextField";
import { RepsTextField } from "../RepsTextField";
import { WeightTextField } from "../WeightTextField";
import { DurationTextField } from "../DurationTextField";
import { NotesTextField } from "../NotesTextField";

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
  exercises: Exercise[];
  loading: boolean;
}

export function WorkoutForm({ exercises, loading }: WorkoutFormProps) {
  const router = useRouter();
  const { openErrorSnackbar } = useErrorSnackbar();
  const { openSuccessSnackbar } = useSuccessSnackbar();
  const { createWorkout, error } = useCreateWorkout();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<WorkoutFormSchema>({
    resolver: zodResolver(workoutFormSchema),
    mode: "onChange",
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      dialy: "",
      details: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "details",
  });

  const createDefaultWorkoutDetail = useCallback(() => {
    append({
      exerciseId: exercises[0].id,
      sets: 0,
      reps: 0,
      weight: 0,
      duration: 0,
      notes: "",
    });
  }, [append, exercises]);

  const onSubmit = useCallback(
    async (values: WorkoutFormSchema) => {
      createWorkout(values);
      openSuccessSnackbar("ワークアウトを作成しました");
      router.push("/workouts");

      if (error) {
        openErrorSnackbar(error);
      }
    },
    [openErrorSnackbar, openSuccessSnackbar, router, createWorkout, error]
  );

  return (
    <>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          {/* 基本情報 */}
          <WorkoutDateField
            control={control}
            error={errors.date as FieldError}
          />

          <DialyTextField
            control={control}
            error={errors.dialy as FieldError}
          />

          <Divider />

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
                loading={loading}
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
              作成
            </Button>
          </Box>
        </Stack>
      </Box>
    </>
  );
}
