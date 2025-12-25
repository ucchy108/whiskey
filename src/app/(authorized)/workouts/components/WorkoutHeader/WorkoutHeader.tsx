import { Avatar, Box, Paper, Typography, useTheme } from "@mui/material";
import WorkoutCreateButton from "../WorkoutCreateButton/WorkoutCreateButton";
import { Dashboard as DashboardIcon } from "@mui/icons-material";

interface DashboardHeaderProps {
  onClick: () => void;
}

export function WorkoutHeader({ onClick }: DashboardHeaderProps) {
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
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
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
              ワークアウト一覧
            </Typography>
            <Typography variant="body2">
              最近のワークアウトを確認しましょう
            </Typography>
          </Box>
        </Box>
        <WorkoutCreateButton onClick={onClick} name={"ワークアウトを作成"} />
      </Box>
    </Paper>
  );
}
