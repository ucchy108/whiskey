"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  List,
} from "@mui/material";
import { WorkoutWithDetails } from "../../types";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { memo } from "react";
import { WorkoutItem } from "../WorkoutItem";

interface WorkoutListProps {
  workouts: WorkoutWithDetails[];
}

function WorkoutList({ workouts }: WorkoutListProps) {
  if (workouts.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="body1" color="textSecondary">
          ワークアウト記録がありません
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={2}>
      {workouts.map((workout) => (
        <Card key={workout.id} variant="outlined">
          <CardContent>
            <Box
              sx={{
                mb: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h6" component="h3">
                {format(new Date(workout.date), "yyyy年M月d日 (E)", {
                  locale: ja,
                })}
              </Typography>
              <Chip
                label={`${workout.Detail.length}種目`}
                size="small"
                color="primary"
                variant="outlined"
              />
            </Box>

            {workout.dialy && (
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                メモ: {workout.dialy}
              </Typography>
            )}

            <List dense>
              {workout.Detail.map((detail) => (
                <WorkoutItem key={detail.id} detail={detail} />
              ))}
            </List>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}

const MemoizedWorkoutList = memo(WorkoutList);

export { MemoizedWorkoutList as WorkoutList };
