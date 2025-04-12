import { Box, List, Typography } from "@mui/material";
import { WorkoutItem } from "../_components/workoutItem";

// TODO: どこかに移す
type Workout = {
  id: string;
  name: string;
  type: string;
  duration: number;
  date: string;
};

export function WorkoutsPage(workouts: Workout[]) {
  return (
    <>
      {workouts.length > 0 ? (
        <List>
          {workouts.map((workout) => (
            <WorkoutItem key={workout.id} workout={workout} />
          ))}
        </List>
      ) : (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            ワークアウトが登録されていません。「新しいワークアウト」ボタンをクリックしてワークアウトを追加してください。
          </Typography>
        </Box>
      )}
    </>
  );
}
