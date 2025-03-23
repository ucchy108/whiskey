import {
  SignUpEmailTextField,
  SignUpPasswordTextField,
  SignUpSubmitButton,
} from "@/features/signup";
import { Card, CardContent, Stack, Typography } from "@mui/material";

function SignUpPage() {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h5">Sign Up</Typography>
          <SignUpEmailTextField />
          <SignUpPasswordTextField />
          <SignUpSubmitButton />
        </Stack>
      </CardContent>
    </Card>
  );
}

export default SignUpPage;
