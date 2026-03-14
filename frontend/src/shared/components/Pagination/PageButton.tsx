import Box from '@mui/material/Box';

interface PageButtonProps {
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  'aria-label'?: string;
}

export function PageButton({
  children,
  active,
  disabled,
  onClick,
  'aria-label': ariaLabel,
}: PageButtonProps) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      sx={{
        width: 36,
        height: 36,
        borderRadius: '8px',
        border: 'none',
        bgcolor: active ? 'primary.main' : 'background.paper',
        color: active ? '#FFFFFF' : 'text.secondary',
        fontSize: 13,
        fontWeight: active ? 600 : 400,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '&:hover': {
          bgcolor: active ? 'primary.main' : 'border.light',
        },
      }}
    >
      {children}
    </Box>
  );
}
