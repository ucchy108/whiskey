import { forwardRef, useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Lock from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

export interface PasswordFieldProps {
  id: string;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  name?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  function PasswordField(
    { id, label, placeholder, disabled, error, helperText, name, onChange, onBlur },
    ref,
  ) {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        <Typography
          component="label"
          htmlFor={id}
          sx={{ fontSize: 14, fontWeight: 500, color: 'text.primary' }}
        >
          {label}
        </Typography>
        <TextField
          id={id}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          disabled={disabled}
          fullWidth
          error={error}
          helperText={helperText}
          name={name}
          onChange={onChange}
          onBlur={onBlur}
          inputRef={ref}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock sx={{ fontSize: 18, color: 'textMuted.main' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  size="small"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <Visibility
                      sx={{ fontSize: 18, color: 'textMuted.main' }}
                    />
                  ) : (
                    <VisibilityOff
                      sx={{ fontSize: 18, color: 'textMuted.main' }}
                    />
                  )}
                </IconButton>
              </InputAdornment>
            ),
            sx: { height: 48 },
          }}
        />
      </Box>
    );
  },
);
