import React from "react";
import { Box, Container } from "@mui/material";
import { TabNavigation } from "@/app/(dashboard)/components/TabNavigation/TabNavigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box component="main" sx={{ paddingTop: "64px" }}>
      <TabNavigation />
      <Container sx={{ mt: 3 }}>{children}</Container>
    </Box>
  );
}
