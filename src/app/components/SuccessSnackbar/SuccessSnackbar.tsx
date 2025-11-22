import React from "react";
import { successColor, onSuccessColor, ThemeProps } from "@/theme";
import {
  Box,
  IconButton,
  Snackbar,
  SnackbarContent,
  styled,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";

const Content = styled(SnackbarContent)<ThemeProps>`
  && {
    background: ${({ theme }): string => successColor(theme)};
    color: ${({ theme }): string => onSuccessColor(theme)};
  }
`;

interface ErrorSnackbarProps {
  open: boolean;
  onClose: () => void;
  message: string;
}

function SuccessSnackbar({ open, onClose, message }: ErrorSnackbarProps) {
  return (
    <>
      <Snackbar
        open={open}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        autoHideDuration={6000}
        onClose={onClose}
      >
        <Content
          message={
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <CheckCircleIcon color={"inherit"} />
              <Typography variant={"body2"} color="inherit">
                {message}
              </Typography>
            </Box>
          }
          action={
            <IconButton color="inherit" onClick={onClose} size={"large"}>
              <CloseIcon color={"inherit"} />
            </IconButton>
          }
        ></Content>
      </Snackbar>
    </>
  );
}

const MemoizedSuccessSnackbar = React.memo(SuccessSnackbar);

export { MemoizedSuccessSnackbar as SuccessSnackbar };
