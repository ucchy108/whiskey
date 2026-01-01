import { useCallback, useState } from "react";
import { theme } from "@/theme";
import {
  Avatar,
  Box,
  Divider,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Settings as SettingsIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { DRAWER_WIDTH } from "../SideNavigation/SideNavigation";

export function SideNavigationFooter() {
  const { data: session } = useSession();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleUserMenuOpen = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      setAnchorEl(event.currentTarget);
    },
    []
  );

  const handleUserMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleSettings = useCallback(() => {
    handleUserMenuClose();
    router.push("/settings");
  }, [router, handleUserMenuClose]);

  const handleSignOut = useCallback(() => {
    handleUserMenuClose();
    signOut({ callbackUrl: "/signin" });
  }, [handleUserMenuClose]);

  return (
    session?.user && (
      <>
        <Divider />
        <Box sx={{ p: 1 }}>
          <ListItemButton onClick={handleUserMenuOpen}>
            <ListItemIcon>
              <Avatar
                sx={{
                  bgcolor: theme.happyHues.button,
                  color: theme.happyHues.buttonText,
                }}
              >
                {session.user.name?.[0]?.toUpperCase()}
              </Avatar>
            </ListItemIcon>
            <ListItemText primary={session.user.name} />
          </ListItemButton>

          <Menu
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={handleUserMenuClose}
            anchorOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
            transformOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            sx={{
              "& .MuiPaper-root": {
                width: DRAWER_WIDTH - 32,
                borderRadius: 2,
              },
            }}
          >
            <MenuItem onClick={handleSettings}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>設定</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={handleSignOut}
              sx={{
                color: theme.happyHues.tertiary,
                "&:hover": {
                  backgroundColor: "rgba(228, 88, 88, 0.08)",
                },
              }}
            >
              <ListItemIcon>
                <LogoutIcon
                  fontSize="small"
                  sx={{ color: theme.happyHues.tertiary }}
                />
              </ListItemIcon>
              <ListItemText>Sign Out</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </>
    )
  );
}
