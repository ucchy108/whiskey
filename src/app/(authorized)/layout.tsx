"use client";

import React from "react";
import { Box, Container } from "@mui/material";
import { SideNavigation, DRAWER_WIDTH } from "./components/SideNavigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ display: "flex" }}>
      <SideNavigation />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: "100vh",
          backgroundColor: (theme) => theme.palette.background.default,
        }}
      >
        <Container sx={{ py: 3 }}>{children}</Container>
      </Box>
    </Box>
  );
}
