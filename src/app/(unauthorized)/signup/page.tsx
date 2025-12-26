"use client";

import { SignUpForm } from "./components/SignUpForm";
import { Box, Card, CardContent, Typography, Avatar } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";

function SignUpPage() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        py: 4,
        background: theme.happyHues.secondary,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Card
        elevation={8}
        sx={{
          width: 650,
          py: 4,
          px: 2,
          borderRadius: 4,
          position: "relative",
          zIndex: 1,
          backdropFilter: "blur(10px)",
          background: "rgba(255, 255, 255, 0.98)",
        }}
      >
        <CardContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Avatar
              sx={{
                bgcolor: theme.happyHues.button,
                width: 64,
                height: 64,
                mb: 2,
              }}
            >
              <FitnessCenterIcon sx={{ fontSize: 36 }} />
            </Avatar>
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{
                color: theme.happyHues.button,
                mb: 1,
              }}
            >
              Whiskey
            </Typography>
            <Typography variant="body2" color="text.secondary">
              新しいアカウントを作成
            </Typography>
          </Box>
          <SignUpForm />
        </CardContent>
      </Card>
    </Box>
  );
}

export default SignUpPage;
