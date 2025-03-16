import { Card, CardContent, Stack, Typography } from "@mui/material";
import SignInEmailTextField from "./components/emailTextField";
import SignInSubmitButton from "./components/submitButton";
import SigniInPasswordTextField from "./components/passwordTextField";

function Form() {
  return (
    <>
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h5">Sign In</Typography>
            <SignInEmailTextField />
            <SigniInPasswordTextField />
            <SignInSubmitButton />
          </Stack>
        </CardContent>
      </Card>
    </>
  );
}

export default Form;
