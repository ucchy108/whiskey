import { useFieldArray, useFormContext } from 'react-hook-form';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { ExerciseSelector } from '@/features/exercise/components/ExerciseSelector';
import { SetInputRow } from '../SetInputRow';
import type { Exercise } from '@/features/exercise';
import type { WorkoutFormValues } from '../../schemas';

export interface ExerciseBlockProps {
  blockIndex: number;
  exercises: Exercise[];
  onRemoveBlock: () => void;
  disabled?: boolean;
}

export function ExerciseBlock({
  blockIndex,
  exercises,
  onRemoveBlock,
  disabled,
}: ExerciseBlockProps) {
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<WorkoutFormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: `exerciseBlocks.${blockIndex}.sets`,
  });

  const exerciseId = watch(`exerciseBlocks.${blockIndex}.exerciseId`);
  const blockErrors = errors.exerciseBlocks?.[blockIndex];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1.25,
      }}
    >
      {/* Exercise selector + remove button */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ flex: 1 }}>
          <ExerciseSelector
            exercises={exercises}
            value={exerciseId}
            onChange={(id) =>
              setValue(`exerciseBlocks.${blockIndex}.exerciseId`, id)
            }
            error={!!blockErrors?.exerciseId}
            helperText={blockErrors?.exerciseId?.message}
            disabled={disabled}
          />
        </Box>
        <IconButton
          onClick={onRemoveBlock}
          disabled={disabled}
          size="small"
          sx={{ color: 'textMuted.main' }}
          aria-label="エクササイズブロックを削除"
        >
          <DeleteOutlineIcon />
        </IconButton>
      </Box>

      {/* Sets table */}
      <Box
        sx={{
          borderRadius: '10px',
          bgcolor: 'background.paper',
          overflow: 'hidden',
        }}
      >
        {/* Table header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 1.75,
            py: 1.25,
            bgcolor: '#F9FAFB',
            borderBottom: '1px solid',
            borderColor: 'border.main',
          }}
        >
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 600,
              color: 'text.secondary',
              width: 40,
            }}
          >
            セット
          </Typography>
          <Typography
            sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', flex: 1 }}
          >
            重量 (kg)
          </Typography>
          <Typography
            sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', flex: 1 }}
          >
            レップ数
          </Typography>
          <Box sx={{ width: 34 }} />
        </Box>

        {/* Set rows */}
        {fields.map((field, setIndex) => {
          const setErrors = blockErrors?.sets?.[setIndex];
          return (
            <SetInputRow
              key={field.id}
              index={setIndex}
              weight={watch(
                `exerciseBlocks.${blockIndex}.sets.${setIndex}.weight`,
              )}
              reps={watch(
                `exerciseBlocks.${blockIndex}.sets.${setIndex}.reps`,
              )}
              onWeightChange={(val) =>
                setValue(
                  `exerciseBlocks.${blockIndex}.sets.${setIndex}.weight`,
                  val === '' ? ('' as unknown as number) : Number(val),
                )
              }
              onRepsChange={(val) =>
                setValue(
                  `exerciseBlocks.${blockIndex}.sets.${setIndex}.reps`,
                  val === '' ? ('' as unknown as number) : Number(val),
                )
              }
              onDelete={() => remove(setIndex)}
              weightError={setErrors?.weight?.message}
              repsError={setErrors?.reps?.message}
              disabled={disabled}
            />
          );
        })}
      </Box>

      {/* Add set button */}
      <Button
        variant="text"
        size="small"
        startIcon={<AddIcon sx={{ fontSize: 16 }} />}
        onClick={() => append({ weight: '' as unknown as number, reps: '' as unknown as number })}
        disabled={disabled}
        sx={{
          color: 'primary.main',
          fontSize: 13,
          fontWeight: 600,
          alignSelf: 'flex-start',
        }}
      >
        セットを追加
      </Button>

      {blockErrors?.sets?.message && (
        <Typography sx={{ fontSize: 12, color: 'error.main' }}>
          {blockErrors.sets.message}
        </Typography>
      )}
    </Box>
  );
}
