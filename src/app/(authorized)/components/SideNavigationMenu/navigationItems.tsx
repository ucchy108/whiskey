import {
  Dashboard as DashboardIcon,
  FitnessCenter as FitnessCenterIcon,
  BarChart as BarChartIcon,
} from "@mui/icons-material";
import { JSX } from "react";

type NavigationItem = {
  label: string;
  path: string;
  icon: JSX.Element;
};

export const navigationItems: NavigationItem[] = [
  {
    label: "ダッシュボード",
    path: "/dashboard",
    icon: <DashboardIcon />,
  },
  {
    label: "ワークアウト",
    path: "/workouts",
    icon: <FitnessCenterIcon />,
  },
  {
    label: "統計",
    path: "/statistics",
    icon: <BarChartIcon />,
  },
];
