import {
  FileSpreadsheetIcon,
  Home,
  Sheet,
  TimerIcon,
  Tv2,
  Users,
} from "lucide-react";

export const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "My Research Projects",
    url: "/research",
    icon: Sheet,
  },
  {
    title: "Apes",
    url: "/ape",
    icon: Users,
  },
  {
    title: "Logs",
    url: "/log",
    icon: Tv2,
  },
];

export const actions = [
  {
    title: "Start live observation",
    url: "/live-observation",
    icon: Tv2,
  },
  // {
  //   title: "Record Post-Observation Data",
  //   url: "/",
  //   icon: PlusCircle,
  // },
  // {
  //   title: "Import Excel File",
  //   url: "/",
  //   icon: Sheet,
  // },
];

export const adminMenuItems = [
  {
    title: "Session Management",
    url: "/admin/session",
    icon: TimerIcon,
  },
  {
    title: "Method Management",
    url: "/admin/method",
    icon: FileSpreadsheetIcon,
  },
];

// export const teams = [
//   {
//     title: "Team 1",
//     url: "/",
//     icon: Users,
//   },
//   {
//     title: "Team 2",
//     url: "/",
//     icon: Users,
//   },
// ];
