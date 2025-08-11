import { memo } from "react";
import { WorkoutDetailWithExercise } from "../../types";
import { Box, Chip, ListItem, ListItemText, Typography } from "@mui/material";

type WorkoutItemProps = {
  detail: WorkoutDetailWithExercise;
};

function WorkoutItem({ detail }: WorkoutItemProps) {
  return (
    <ListItem key={detail.id} sx={{ pl: 0, flexDirection: 'column', alignItems: 'flex-start' }}>
      <ListItemText
        primary={
          <Typography variant="subtitle2" component="div">
            {detail.Exercise.name}
          </Typography>
        }
      />
      <Box
        sx={{
          display: "flex",
          gap: 1,
          flexWrap: "wrap",
          mt: 0.5,
        }}
      >
        <Chip
          label={`${detail.sets}セット`}
          size="small"
          variant="filled"
          color="secondary"
        />
        <Chip
          label={`${detail.reps}回`}
          size="small"
          variant="filled"
          color="secondary"
        />
        {detail.weight && (
          <Chip
            label={`${detail.weight}kg`}
            size="small"
            variant="filled"
            color="secondary"
          />
        )}
        {detail.duration && (
          <Chip
            label={`${Math.floor(detail.duration / 60)}分${
              detail.duration % 60
            }秒`}
            size="small"
            variant="filled"
            color="secondary"
          />
        )}
      </Box>
      {detail.notes && (
        <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
          {detail.notes}
        </Typography>
      )}
    </ListItem>
  );
}

const MemoizedWorkoutItem = memo(WorkoutItem);

export { MemoizedWorkoutItem as WorkoutItem };
