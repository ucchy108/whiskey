"use client";

import { Card } from "@mui/material";
import { useGetWorkouts } from "../../hooks/useGetWorkouts";
import { WorkoutItem } from "../WorkoutItem";

export function WorkoutList() {
  const { workouts } = useGetWorkouts();

  return (
    <>
      {workouts?.map((workout) => {
        return (
          <Card key={workout.id} sx={{ margin: 1 }}>
            <WorkoutItem workout={workout} />
          </Card>
        );
      })}
    </>
  );
}
