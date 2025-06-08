"use client";

import { Card } from "@mui/material";
import { WorkoutItem } from "../WorkoutItem";
import { WorkoutSchema } from "@/app/workouts/schema";

interface WorkoutListProps {
  workouts?: WorkoutSchema[];
}

export function WorkoutList({ workouts }: WorkoutListProps) {
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
