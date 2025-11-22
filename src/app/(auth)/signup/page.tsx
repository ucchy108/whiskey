"use client";

import { SignUpForm } from "./components/SignUpForm";
import { Box, Card, CardContent } from "@mui/material";

function SignUpPage() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Card variant="outlined" sx={{ width: 600, py: 4 }}>
        <CardContent>
          <SignUpForm />
        </CardContent>
      </Card>
    </Box>
  );
}

export default SignUpPage;
