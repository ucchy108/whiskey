import { useSuccessSnackbar } from "@/app/hooks/useSuccessSnackbar";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

interface UseSuccessNotification {
  SuccessSnackbar: () => React.ReactNode;
}

export const useSuccessNotification = (): UseSuccessNotification => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { openSuccessSnackbar, SuccessSnackbar } = useSuccessSnackbar();

  useEffect(() => {
    if (searchParams.get("create_success")) {
      openSuccessSnackbar(decodeURIComponent("アカウントが作成されました"));
      router.replace("/signin");
    }
  }, [searchParams, openSuccessSnackbar, router]);

  return {
    SuccessSnackbar: SuccessSnackbar,
  };
};
