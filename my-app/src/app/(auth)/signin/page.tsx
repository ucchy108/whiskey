"use client";

import {
  SignInEmailTextField,
  SignInPasswordTextField,
  SignInSubmitButton,
} from "@/features/signin";
import { Card, CardContent, Stack, Typography } from "@mui/material";

function SignInPage() {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h5">Sign In</Typography>
          <SignInEmailTextField />
          <SignInPasswordTextField />
          <SignInSubmitButton />
        </Stack>
      </CardContent>
    </Card>
  );
}

export default SignInPage;
