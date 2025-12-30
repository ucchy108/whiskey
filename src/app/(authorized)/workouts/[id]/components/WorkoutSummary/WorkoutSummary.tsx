import { Grid2 as Grid, Typography, Box, Stack } from "@mui/material";
import { useWorkoutStats } from "../../hooks/useWorkoutStats";
import { createWorkoutMetrics } from "./workoutMetrics";
import { WorkoutDetail } from "@/repositories/workoutRepository";

interface WorkoutSummaryProps {
  exercises: WorkoutDetail[];
}

export function WorkoutSummary({ exercises }: WorkoutSummaryProps) {
  const stats = useWorkoutStats(exercises);
  const metrics = createWorkoutMetrics(stats);

  return (
    <Grid container spacing={2}>
      {metrics.map((metric, index) => (
        <Grid size={{ xs: 6, sm: 3 }} key={index}>
          <Box
            sx={{
              textAlign: "center",
              p: 2,
              borderRadius: 2,
              backgroundColor: metric.color,
              backdropFilter: "blur(10px)",
            }}
          >
            <Stack alignItems="center" spacing={1}>
              <Box
                sx={{
                  color: "white",
                  fontSize: "24px",
                }}
              >
                {metric.icon}
              </Box>
              <Typography variant="h4" fontWeight="bold" color="white">
                {metric.value}
              </Typography>
              <Typography variant="body2" color="white">
                {metric.unit}
              </Typography>
              <Typography variant="caption" color="white">
                {metric.label}
              </Typography>
            </Stack>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
}
