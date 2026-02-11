import { forwardRef, useImperativeHandle } from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import { ExerciseBlock } from '../ExerciseBlock';
import { workoutFormSchema, type WorkoutFormValues, type WorkoutFormFieldValues } from '../../schemas';
import type { Exercise } from '@/features/exercise';

export interface WorkoutFormHandle {
  submit: () => void;
  getValues: () => WorkoutFormFieldValues;
}

export interface WorkoutFormProps {
  exercises: Exercise[];
  onSubmit: (data: WorkoutFormValues) => void;
  isLoading?: boolean;
}

export const WorkoutForm = forwardRef<WorkoutFormHandle, WorkoutFormProps>(
  function WorkoutForm({ exercises, onSubmit, isLoading = false }, ref) {
    const methods = useForm<WorkoutFormFieldValues, unknown, WorkoutFormValues>({
      resolver: zodResolver(workoutFormSchema),
      defaultValues: {
        date: new Date().toISOString().slice(0, 10),
        exerciseBlocks: [
          {
            exerciseId: "",
            sets: [
              {
                weight: "",
                reps: "",
              },
            ],
          },
        ],
        memo: "",
      },
    });

    const {
      control,
      handleSubmit,
      register,
      getValues,
      formState: { errors },
    } = methods;

    const { fields, append, remove } = useFieldArray({
      control,
      name: "exerciseBlocks",
    });

    useImperativeHandle(ref, () => ({
      submit: handleSubmit((data) => onSubmit(data)),
      getValues,
    }));

    const onValid = (data: WorkoutFormValues) => {
      onSubmit(data);
    };

    return (
      <FormProvider {...methods}>
        <Box
          component="form"
          onSubmit={handleSubmit(onValid)}
          noValidate
          sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
        >
          {/* Date */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
            <Typography
              component="label"
              htmlFor="date"
              sx={{ fontSize: 13, fontWeight: 600, color: "text.secondary" }}
            >
              日付
            </Typography>
            <TextField
              id="date"
              type="date"
              disabled={isLoading}
              fullWidth
              error={!!errors.date}
              helperText={errors.date?.message}
              {...register("date")}
              InputProps={{ sx: { height: 44 } }}
            />
          </Box>

          {/* Exercise blocks */}
          {fields.map((field, index) => (
            <Box
              key={field.id}
              sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}
            >
              {index === 0 && (
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "text.secondary",
                  }}
                >
                  エクササイズ
                </Typography>
              )}
              <ExerciseBlock
                blockIndex={index}
                exercises={exercises}
                onRemoveBlock={() => remove(index)}
                disabled={isLoading}
              />
            </Box>
          ))}

          {/* Add exercise block button */}
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() =>
              append({
                exerciseId: "",
                sets: [
                  {
                    weight: "",
                    reps: "",
                  },
                ],
              })
            }
            disabled={isLoading}
            sx={{
              borderColor: "border.main",
              color: "text.secondary",
              "&:hover": {
                borderColor: "primary.main",
                color: "primary.main",
              },
            }}
          >
            エクササイズを追加
          </Button>

          {errors.exerciseBlocks?.message && (
            <Typography sx={{ fontSize: 12, color: "error.main" }}>
              {errors.exerciseBlocks.message}
            </Typography>
          )}

          {/* Memo */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
            <Typography
              component="label"
              htmlFor="memo"
              sx={{ fontSize: 13, fontWeight: 600, color: "text.secondary" }}
            >
              メモ
            </Typography>
            <TextField
              id="memo"
              multiline
              minRows={3}
              placeholder="今日のワークアウトについてメモ..."
              disabled={isLoading}
              fullWidth
              {...register("memo")}
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: "10px" },
              }}
            />
          </Box>
        </Box>
      </FormProvider>
    );
  },
);
