import { Avatar, Box, Paper, Typography, useTheme } from "@mui/material";
import { Dashboard as DashboardIcon } from "@mui/icons-material";

export function DashboardHeader() {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        background: theme.gradients.ocean,
        color: "#fff",
        p: 3,
        borderRadius: 2,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Avatar
          sx={{
            bgcolor: "rgba(255, 255, 255, 0.2)",
            width: 48,
            height: 48,
          }}
        >
          <DashboardIcon sx={{ fontSize: 28 }} />
        </Avatar>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            ダッシュボード
          </Typography>
          <Typography variant="body2">
            あなたのワークアウトの記録を確認しましょう
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}
