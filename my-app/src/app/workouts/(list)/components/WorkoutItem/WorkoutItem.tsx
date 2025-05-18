"use client";

import { Box, IconButton, ListItem, ListItemText } from "@mui/material";
import { Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";
import { WorkoutSchema } from "@/app/workouts/schema";

interface WorkoutProps {
  workout: WorkoutSchema;
}

export function WorkoutItem({ workout }: WorkoutProps) {
  return (
    <ListItem>
      <ListItemText
        primary={workout.name}
        secondary={`${workout.date}分 / ${workout.reps}回 / ${workout.sets}セット`}
        sx={{ width: "100%" }}
      />
      <Box sx={{ justifyContent: "flex-end" }}>
        <IconButton edge="end">
          <EditIcon />
        </IconButton>
        <IconButton edge="end">
          <DeleteIcon />
        </IconButton>
      </Box>
    </ListItem>
  );
}
