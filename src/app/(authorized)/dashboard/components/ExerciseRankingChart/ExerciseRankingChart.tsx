import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid2 as Grid,
  Stack,
  LinearProgress,
} from "@mui/material";
import { BarChart } from "@mui/icons-material";
import { ExerciseDistribution } from "../../hooks/useWorkoutChart";

interface ExerciseRankingChartProps {
  exerciseDistributions: ExerciseDistribution[];
}

export function ExerciseRankingChart({
  exerciseDistributions,
}: ExerciseRankingChartProps) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
          <BarChart color="primary" />
          <Typography variant="h6" fontWeight="bold">
            人気種目ランキング
          </Typography>
        </Stack>

        <Grid container spacing={2}>
          {exerciseDistributions.map((exercise, index) => (
            <Grid size={{ xs: 12, sm: 6 }} key={index}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: "grey.50",
                  border: "1px solid",
                  borderColor: "grey.200",
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      backgroundColor: `hsl(${index * 60}, 70%, 50%)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: "bold",
                    }}
                  >
                    {index + 1}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {exercise.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {exercise.count}回 ({exercise.percentage}%)
                    </Typography>
                  </Box>
                </Stack>

                <LinearProgress
                  variant="determinate"
                  value={exercise.percentage}
                  sx={{
                    mt: 1,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: "grey.200",
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: `hsl(${index * 60}, 70%, 50%)`,
                      borderRadius: 2,
                    },
                  }}
                />
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}
