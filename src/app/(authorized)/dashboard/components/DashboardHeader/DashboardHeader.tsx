import { Avatar, Box, Paper, Typography, useTheme } from "@mui/material";
import WorkoutCreateButton from "../WorkoutCreateButton/WorkoutCreateButton";
import { Dashboard as DashboardIcon } from "@mui/icons-material";

interface DashboardHeaderProps {
  onClick: () => void;
}

export function DashboardHeader({ onClick }: DashboardHeaderProps) {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        background: theme.gradients.ocean,
        color: "#fff",
        p: 3,
        mb: 3,
        borderRadius: 2,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          right: 0,
          width: "150px",
          height: "150px",
          background: "rgba(255, 255, 255, 0.1)",
          borderRadius: "50%",
          transform: "translate(50px, -50px)",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
          zIndex: 1,
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
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
              あなたのワークアウトの記録を確認しましょう
            </Typography>
          </Box>
        </Box>
        <WorkoutCreateButton onClick={onClick} name={"ワークアウトを作成"} />
      </Box>
    </Paper>
  );
}
