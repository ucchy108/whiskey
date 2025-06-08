"use client";

import React from "react";
import { Box, Tab, Tabs } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import { FitnessCenter as FitnessCenterIcon, Dashboard as DashboardIcon, BarChart as BarChartIcon, Settings as SettingsIcon } from "@mui/icons-material";

function TabNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const getCurrentTab = () => {
    const path = pathname.split("/")[1];
    return path || "dashboard";
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    router.push(`/${newValue}`);
  };

  return (
    <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
      <Tabs value={getCurrentTab()} onChange={handleTabChange}>
        <Tab
          icon={<DashboardIcon />}
          iconPosition="start"
          label="ダッシュボード"
          value="dashboard"
        />
        <Tab
          icon={<FitnessCenterIcon />}
          iconPosition="start"
          label="ワークアウト"
          value="workouts"
        />
        <Tab
          icon={<BarChartIcon />}
          iconPosition="start"
          label="統計"
          value="statistics"
        />
        <Tab
          icon={<SettingsIcon />}
          iconPosition="start"
          label="設定"
          value="settings"
        />
      </Tabs>
    </Box>
  );
}

const MemoizedTabNavigation = React.memo(TabNavigation);

export { MemoizedTabNavigation as TabNavigation };