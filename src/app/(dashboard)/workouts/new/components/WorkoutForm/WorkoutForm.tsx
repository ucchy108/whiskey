"use client";

import { memo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  TextField,
  Stack,
  Typography,
  MenuItem,
  IconButton,
  Paper,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { workoutFormSchema, WorkoutFormSchema } from "./formSchema";
import { useErrorSnackbar } from "@/app/hooks/useErrorSnackbar";
import { useSuccessSnackbar } from "@/app/hooks/useSuccessSnackbar";
import { useExercises } from "../../hooks/useExercises";

function WorkoutForm() {
  const router = useRouter();
  const { openErrorSnackbar, ErrorSnackbar } = useErrorSnackbar();
  const { openSuccessSnackbar, SuccessSnackbar } = useSuccessSnackbar();
  const { exercises, loading: exercisesLoading } = useExercises();

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

  const onSubmit = useCallback(
    async (values: WorkoutFormSchema) => {
      try {
        const response = await fetch("/api/workouts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            date: values.date,
            dialy: values.dialy || undefined,
            details: values.details,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "ワークアウトの作成に失敗しました");
        }

        openSuccessSnackbar("ワークアウトを作成しました");
        router.push("/workouts");
      } catch (error) {
        openErrorSnackbar(
          error instanceof Error
            ? error.message
            : "ワークアウトの作成に失敗しました"
        );
      }
    },
    [openErrorSnackbar, openSuccessSnackbar, router]
  );

  return (
    <>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          {/* 基本情報 */}
          <Controller
            name="date"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="date"
                label="日付"
                fullWidth
                required
                error={!!errors.date}
                helperText={errors.date?.message}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            )}
          />

          <Controller
            name="dialy"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="メモ"
                multiline
                rows={3}
                fullWidth
                placeholder="今日のワークアウトについてメモを残しましょう"
                error={!!errors.dialy}
                helperText={errors.dialy?.message}
              />
            )}
          />

          <Divider />

          {/* 運動詳細 */}
          <Box>
            <Typography variant="h6" gutterBottom>
              運動詳細
            </Typography>
            <Stack spacing={2}>
              {fields.map((field, index) => (
                <Paper key={field.id} sx={{ p: 2 }} variant="outlined">
                  <Stack spacing={2}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="subtitle1">
                        運動 {index + 1}
                      </Typography>
                      <IconButton
                        onClick={() => remove(index)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>

                    <Controller
                      name={`details.${index}.exerciseId`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          select
                          label="運動種目"
                          fullWidth
                          required
                          error={!!errors.details?.[index]?.exerciseId}
                          helperText={
                            errors.details?.[index]?.exerciseId?.message
                          }
                          disabled={exercisesLoading}
                        >
                          {exercises.map((exercise) => (
                            <MenuItem key={exercise.id} value={exercise.id}>
                              {exercise.name}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />

                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Controller
                        name={`details.${index}.sets`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            type="number"
                            label="セット数"
                            fullWidth
                            required
                            inputProps={{ min: 1 }}
                            error={!!errors.details?.[index]?.sets}
                            helperText={errors.details?.[index]?.sets?.message}
                          />
                        )}
                      />

                      <Controller
                        name={`details.${index}.reps`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            type="number"
                            label="レップ数"
                            fullWidth
                            required
                            inputProps={{ min: 1 }}
                            error={!!errors.details?.[index]?.reps}
                            helperText={errors.details?.[index]?.reps?.message}
                          />
                        )}
                      />
                    </Box>

                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Controller
                        name={`details.${index}.weight`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            type="number"
                            label="重量 (kg)"
                            fullWidth
                            inputProps={{ min: 0, step: 0.5 }}
                            error={!!errors.details?.[index]?.weight}
                            helperText={
                              errors.details?.[index]?.weight?.message
                            }
                          />
                        )}
                      />

                      <Controller
                        name={`details.${index}.duration`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            type="number"
                            label="時間 (秒)"
                            fullWidth
                            inputProps={{ min: 0 }}
                            error={!!errors.details?.[index]?.duration}
                            helperText={
                              errors.details?.[index]?.duration?.message
                            }
                          />
                        )}
                      />
                    </Box>

                    <Controller
                      name={`details.${index}.notes`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="メモ"
                          multiline
                          rows={2}
                          fullWidth
                          placeholder="フォームや感想など"
                          error={!!errors.details?.[index]?.notes}
                          helperText={errors.details?.[index]?.notes?.message}
                        />
                      )}
                    />
                  </Stack>
                </Paper>
              ))}

              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() =>
                  append({
                    exerciseId: "",
                    sets: 0,
                    reps: 0,
                    weight: undefined,
                    duration: undefined,
                    notes: "",
                  })
                }
                disabled={exercisesLoading}
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
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? "作成中..." : "作成"}
            </Button>
          </Box>
        </Stack>
      </Box>

      <ErrorSnackbar />
      <SuccessSnackbar />
    </>
  );
}

export default memo(WorkoutForm);
