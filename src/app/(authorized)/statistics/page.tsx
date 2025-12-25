"use client";

import { Box, Typography } from "@mui/material";

export default function StatisticsPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        統計
      </Typography>
      <Typography>
        ここにワークアウトの統計情報が表示されます。
      </Typography>
    </Box>
  );
}
