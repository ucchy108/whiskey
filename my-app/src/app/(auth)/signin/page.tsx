"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Box, Card, CardContent } from "@mui/material";
import { SignInForm } from "./components/SignInForm/SignInForm";
import { useSuccessSnackbar } from "@/app/hooks/useSuccessSnackbar";

function SignInPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { openSuccessSnackbar, SuccessSnackbar } = useSuccessSnackbar();

  useEffect(() => {
    if (searchParams.get("create_success")) {
      openSuccessSnackbar(decodeURIComponent("アカウントが作成されました"));
      router.replace("/signin");
    }
  }, [searchParams, openSuccessSnackbar, router]);

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
