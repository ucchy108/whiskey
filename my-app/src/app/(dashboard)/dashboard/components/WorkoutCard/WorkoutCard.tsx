import { memo, useCallback } from "react";
import { Box, Card, CardContent, Chip, List, Typography } from "@mui/material";
import { WorkoutItem } from "../WorkoutItem";
import { WorkoutWithDetails } from "../../types";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

function WorkoutCard({ workout }: { workout: WorkoutWithDetails }) {
  const router = useRouter();

  const handleWorkoutClick = useCallback(() => {
    router.push(`/workouts/${workout.id}`);
  }, [router, workout.id]);

  return (
    <Card
      key={workout.id}
      variant="outlined"
      sx={{
        cursor: "pointer",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          backgroundColor: "action.hover",
          transform: "translateY(-1px)",
          boxShadow: 2,
        },
      }}
      onClick={handleWorkoutClick}
    >
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
  );
}

const MemoizedWorkoutCard = memo(WorkoutCard);

export { MemoizedWorkoutCard as WorkoutCard };
