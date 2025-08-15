import { memo } from "react";
import {
  Card,
  CardContent,
  Grid2 as Grid,
  Typography,
  Box,
  Stack,
} from "@mui/material";
import { BarChart } from "@mui/icons-material";
import { WorkoutDetailWithExercise } from "@/app/(dashboard)/dashboard/types";
import { useWorkoutStats } from "../../hooks/useWorkoutStats";
import { createWorkoutMetrics } from "../../utils/workoutMetrics";

interface WorkoutSummaryProps {
  exercises: WorkoutDetailWithExercise[];
}

function WorkoutSummary({ exercises }: WorkoutSummaryProps) {
  const stats = useWorkoutStats(exercises);
  const metrics = createWorkoutMetrics(stats);

  return (
    <Card sx={{ mb: 3, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
      <CardContent sx={{ color: "white" }}>
        <Stack direction="row" alignItems="center" spacing={2} justifyContent="center" mb={3}>
          <BarChart sx={{ fontSize: 28 }} />
          <Typography variant="h6" fontWeight="bold">
            ワークアウトサマリー
          </Typography>
        </Stack>
        
        <Grid container spacing={2}>
          {metrics.map((metric, index) => (
            <Grid size={{ xs: 6, sm: 3 }} key={index}>
              <Box
                sx={{
                  textAlign: "center",
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <Stack alignItems="center" spacing={1}>
                  <Box
                    sx={{
                      color: "white",
                      fontSize: "24px",
                      opacity: 0.9,
                    }}
                  >
                    {metric.icon}
                  </Box>
                  <Typography variant="h4" fontWeight="bold">
                    {metric.value}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {metric.unit}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    {metric.label}
                  </Typography>
                </Stack>
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}

const MemoizedWorkoutSummary = memo(WorkoutSummary);

export { MemoizedWorkoutSummary as WorkoutSummary };