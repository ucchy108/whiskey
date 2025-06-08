"use client";

import React from "react";
import { Container, Typography, Box, Button } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { WorkoutList } from "./components/WorkoutList";
import { useFormDialog } from "./hooks/useFormDialog";
import { FormDialog as WorkoutFormDialog } from "./components/FormDialog";
import { useGetWorkouts } from "./hooks/useGetWorkouts";

export default function Home() {
  const { open, handleClick, selectedItem } = useFormDialog();
  const { workouts } = useGetWorkouts();
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          ワークアウト管理
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleClick}
          >
            新しいワークアウト
          </Button>
        </Box>
      </Box>
      <WorkoutList workouts={workouts} />
      <WorkoutFormDialog
        workout={selectedItem}
        openDialog={open}
        handleCloseDialog={handleClick}
      />
    </Container>
  );
}
