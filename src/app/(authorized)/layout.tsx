import React from "react";
import { Box, Container } from "@mui/material";
import { TabNavigation } from "@/app/(authorized)/components/TabNavigation/TabNavigation";
import { NavigationBar } from "./components/NavigationBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavigationBar />
      <Box component="main" sx={{ paddingTop: "64px" }}>
        <TabNavigation />
        <Container sx={{ mt: 3 }}>{children}</Container>
      </Box>
    </>
  );
}
