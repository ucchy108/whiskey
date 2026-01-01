import { theme } from "@/theme";
import { Avatar, Box, Typography } from "@mui/material";
import { FitnessCenter as FitnessCenterIcon } from "@mui/icons-material";

export function SideNavigationHeader() {
  return (
    <Box
      sx={{
        p: 2,
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Avatar
        sx={{
          bgcolor: theme.happyHues.button,
          width: 40,
          height: 40,
        }}
      >
        <FitnessCenterIcon />
      </Avatar>
      <Typography
        variant="h6"
        component="div"
        sx={{
          fontWeight: "bold",
          letterSpacing: "0.5px",
          color: theme.palette.text.primary,
        }}
      >
        Whiskey
      </Typography>
    </Box>
  );
}
