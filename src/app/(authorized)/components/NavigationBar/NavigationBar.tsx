"use client";

import React, { useCallback } from "react";
import {
  AppBar,
  Button,
  Toolbar,
  Typography,
  Box,
  Avatar,
  Chip,
} from "@mui/material";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "@mui/material/styles";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import LogoutIcon from "@mui/icons-material/Logout";

function NavigationBar() {
  const { data: session } = useSession();
  const theme = useTheme();

  const handleSignOut = useCallback(() => {
    signOut({ callbackUrl: "/signin" });
  }, []);

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: theme.happyHues.button,
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <Toolbar>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.2)",
              width: 40,
              height: 40,
            }}
          >
            <FitnessCenterIcon />
          </Avatar>
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: "bold",
              letterSpacing: "0.5px",
            }}
          >
            Whiskey
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {session?.user && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Chip
              avatar={
                <Avatar sx={{ bgcolor: "rgba(255, 255, 255, 0.3)" }}>
                  {session.user.name?.[0]?.toUpperCase()}
                </Avatar>
              }
              label={session.user.name}
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.15)",
                color: "#fff",
                fontWeight: 500,
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.25)",
                },
              }}
            />
            <Button
              color="inherit"
              onClick={handleSignOut}
              startIcon={<LogoutIcon />}
              sx={{
                borderRadius: 2,
                px: 2,
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.15)",
                },
              }}
            >
              Sign Out
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}

const MemoizedNavigationBar = React.memo(NavigationBar);

export { MemoizedNavigationBar as NavigationBar };
