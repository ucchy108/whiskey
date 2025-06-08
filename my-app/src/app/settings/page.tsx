"use client";

import { Box, Typography } from "@mui/material";

export default function SettingsPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        設定
      </Typography>
      <Typography>
        アプリケーション設定をここで管理できます。
      </Typography>
    </Box>
  );
}
