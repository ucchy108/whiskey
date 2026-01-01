import {
  Box,
  Chip,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { WorkoutDetail } from "@/repositories/workoutRepository";

type WorkoutItemProps = {
  detail: WorkoutDetail;
};

export function WorkoutItem({ detail }: WorkoutItemProps) {
  return (
    <ListItem
      key={detail.id}
      sx={{ pl: 0, flexDirection: "column", alignItems: "flex-start" }}
    >
      <Stack spacing={1}>
        <ListItemText
          primary={
            <Typography variant="subtitle2" component="div">
              {detail.exercise.name}
            </Typography>
          }
        />
        <Box
          sx={{
            display: "flex",
            gap: 1,
            flexWrap: "wrap",
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
      </Stack>
    </ListItem>
  );
}
