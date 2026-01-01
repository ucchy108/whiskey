import { theme } from "@/theme";
import { Box, Typography } from "@mui/material";
import { FitnessCenter as FitnessCenterIcon } from "@mui/icons-material";

export function ExerciseHeader() {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        position: "relative",
        zIndex: 1,
      }}
    >
      <FitnessCenterIcon sx={{ fontSize: 40, color: theme.happyHues.button }} />
      <Box>
        <Typography
          variant="h4"
          fontWeight="bold"
          color={theme.happyHues.button}
        >
          エクササイズ一覧
        </Typography>
        <Typography
          variant="body2"
          color={theme.happyHues.button}
          sx={{ opacity: 0.9, mt: 0.5 }}
        >
          あなたのエクササイズを確認・管理しましょう
        </Typography>
      </Box>
    </Box>
  );
}
