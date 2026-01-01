import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { theme } from "@/theme";
import { usePathname, useRouter } from "next/navigation";
import { navigationItems } from "./navigationItems";
import { useCallback } from "react";

export function SideNavigationMenu() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = useCallback(
    (path: string) => {
      return pathname.startsWith(path);
    },
    [pathname]
  );

  const handleNavigate = useCallback(
    (path: string) => {
      router.push(path);
    },
    [router]
  );
  return (
    <Box sx={{ flexGrow: 1, overflow: "auto", py: 2 }}>
      <Box sx={{ px: 2, mb: 2 }}>
        <Typography
          variant="overline"
          sx={{
            color: theme.palette.text.secondary,
            fontWeight: 700,
            letterSpacing: 1.2,
          }}
        >
          メニュー
        </Typography>
      </Box>
      <List sx={{ px: 1 }}>
        <Stack spacing={1}>
          {navigationItems.map((item) => {
            const active = isActive(item.path);
            return (
              <ListItemButton
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                selected={active}
                sx={{
                  borderRadius: 2,
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    backgroundColor: theme.happyHues.secondary,
                    transform: "translateX(4px)",
                  },
                  "&.Mui-selected": {
                    backgroundColor: theme.happyHues.button,
                    color: theme.happyHues.buttonText,
                    "&:hover": {
                      backgroundColor: theme.happyHues.button,
                      opacity: 0.9,
                    },
                    "& .MuiListItemIcon-root": {
                      color: theme.happyHues.buttonText,
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: active
                      ? theme.happyHues.buttonText
                      : theme.palette.text.primary,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            );
          })}
        </Stack>
      </List>
    </Box>
  );
}
