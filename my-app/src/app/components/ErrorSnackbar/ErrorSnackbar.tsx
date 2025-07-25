import {
  IconButton,
  Snackbar,
  SnackbarContent,
  styled,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import React from "react";
import { errorColor, onErrorColor, ThemeProps } from "@/theme";

const Content = styled(SnackbarContent)<ThemeProps>`
  && {
    background: ${({ theme }): string => errorColor(theme)};
    color: ${({ theme }): string => onErrorColor(theme)};
  }
`;

interface ErrorSnackbarProps {
  open: boolean;
  onClose: () => void;
  message: string;
}

function ErrorSnackbar({ open, onClose, message }: ErrorSnackbarProps) {
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
            <>
              <CheckCircleIcon color={"inherit"} />
              <Typography variant={"body2"} color="inherit">
                {message}
              </Typography>
            </>
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

const MemoizedErrorSnackbar = React.memo(ErrorSnackbar);

export { MemoizedErrorSnackbar as ErrorSnackbar };
