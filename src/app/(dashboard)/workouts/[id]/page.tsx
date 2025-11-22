"use client";

import { useParams } from "next/navigation";
import { Box, Typography } from "@mui/material";
import { WorkoutItem } from "./components/WorkoutItem";
import { useWorkout } from "./hooks/useWorkout";

export default function WorkoutDetailPage() {
  const params = useParams();
  const workoutId = params.id as string;

  const { workout, loading, error } = useWorkout(workoutId);

  if (loading) {
    return (
      <Box sx={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "200px",
        p: 3
      }}>
        <Typography variant="h6" color="text.secondary">
          読み込み中...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "200px",
        p: 3
      }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  return <WorkoutItem workout={workout} />;
}
