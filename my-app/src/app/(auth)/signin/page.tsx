"use client";

import { Box, Card, CardContent } from "@mui/material";
import { SignInForm } from "./components/SignInForm/SignInForm";
import { useSuccessNotification } from "./hooks/useSuccessNotification";

function SignInPage() {
  const { SuccessSnackbar } = useSuccessNotification();

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Card variant="outlined" sx={{ width: 400, py: 4 }}>
          <CardContent>
            <SignInForm />
          </CardContent>
        </Card>
      </Box>
      <SuccessSnackbar />
    </>
  );
}

export default SignInPage;
