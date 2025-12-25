"use client";

import { Box, Card, CardContent, Typography, Avatar } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { SignInForm } from "./components/SignInForm/SignInForm";
import { useSuccessNotification } from "./hooks/useSuccessNotification";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";

function SignInPage() {
  const { SuccessSnackbar } = useSuccessNotification();
  const theme = useTheme();

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: theme.gradients.purple,
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: "-50%",
            right: "-10%",
            width: "600px",
            height: "600px",
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: "50%",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: "-30%",
            left: "-5%",
            width: "400px",
            height: "400px",
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: "50%",
          },
        }}
      >
        <Card
          elevation={8}
          sx={{
            width: 450,
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
                  bgcolor: theme.customColors.purple.main,
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
                  background: theme.gradients.purple,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  mb: 1,
                }}
              >
                Whiskey
              </Typography>
              <Typography variant="body2" color="text.secondary">
                あなたのワークアウトを記録しよう
              </Typography>
            </Box>
            <SignInForm />
          </CardContent>
        </Card>
      </Box>
      <SuccessSnackbar />
    </>
  );
}

export default SignInPage;
