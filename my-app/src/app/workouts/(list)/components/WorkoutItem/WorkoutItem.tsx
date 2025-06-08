"use client";

import { Box, IconButton, ListItem, ListItemText } from "@mui/material";
import { Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";
import { WorkoutSchema } from "@/app/workouts/schema";
import { useFormDialog } from "@/app/workouts/(create)/hooks/useFormDialog";
import { useCallback } from "react";

interface WorkoutProps {
  workout: WorkoutSchema;
}

export function WorkoutItem({ workout }: WorkoutProps) {
  const { setSelectedItem } = useFormDialog();

  const handleEditClick = useCallback(() => {
    setSelectedItem(workout);
  }, [setSelectedItem, workout]);

  const handleDeleteClick = useCallback(() => {
    return;
  }, []);

  return (
    <ListItem>
      <ListItemText
        primary={workout.name}
        secondary={`${workout.date}分 / ${workout.reps}回 / ${workout.sets}セット`}
        sx={{ width: "100%" }}
      />
      <Box sx={{ justifyContent: "flex-end" }}>
        <IconButton edge="end" onClick={handleEditClick}>
          <EditIcon />
        </IconButton>
        <IconButton edge="end" onAbort={handleDeleteClick}>
          <DeleteIcon />
        </IconButton>
      </Box>
    </ListItem>
  );
}
