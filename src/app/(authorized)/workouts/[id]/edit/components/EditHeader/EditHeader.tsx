"use client";

import { Box, Paper, Typography } from "@mui/material";
import { FitnessCenter as FitnessCenterIcon } from "@mui/icons-material";

export function EditHeader() {
  return (
    <Paper
      elevation={0}
      sx={{
        background: (theme) => theme.happyHues.button,
        color: (theme) => theme.happyHues.buttonText,
        p: 3,
        borderRadius: 2,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <FitnessCenterIcon sx={{ fontSize: 40 }} />
        <Box>
          <Typography variant="h4" fontWeight="bold">
            ワークアウト編集
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
            トレーニングを編集しましょう
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}
