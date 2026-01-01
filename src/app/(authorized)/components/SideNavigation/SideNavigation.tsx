"use client";

import React from "react";
import { Drawer } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { SideNavigationHeader } from "../SideNavigationHeader";
import { SideNavigationFooter } from "../SideNavigationFooter";
import { SideNavigationMenu } from "../SideNavigationMenu/SideNavigationMenu";

export const DRAWER_WIDTH = 240;

export function SideNavigation() {
  const theme = useTheme();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: DRAWER_WIDTH,
          boxSizing: "border-box",
          borderRight: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.happyHues.background,
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <SideNavigationHeader />
      <SideNavigationMenu />
      <SideNavigationFooter />
    </Drawer>
  );
}
