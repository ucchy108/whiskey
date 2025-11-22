"use client";

import React, { useCallback } from "react";
import { AppBar, Button, Toolbar, Typography } from "@mui/material";
import { useSession, signOut } from "next-auth/react";

function NavigationBar() {
  const { data: session } = useSession();

  const handleSignOut = useCallback(() => {
    signOut({ callbackUrl: "/signin" });
  }, []);

  return (
    <AppBar
      position="fixed"
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
    >
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Whiskey
        </Typography>
        {session?.user && (
          <Button color="inherit" onClick={handleSignOut}>
            Sign Out
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}

const MemoizedNavigationBar = React.memo(NavigationBar);

export { MemoizedNavigationBar as NavigationBar };
