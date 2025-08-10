"use client";

import { Box, Card, CardContent } from "@mui/material";
import { SignInForm } from "./components/SignInForm/SignInForm";

function SignInPage() {
  return (
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
  );
}

export default SignInPage;
