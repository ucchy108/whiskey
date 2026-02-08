import Box from '@mui/material/Box';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 1,
        py: 1,
      }}
    >
      <PageButton
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        aria-label="前のページ"
      >
        <ChevronLeftIcon sx={{ fontSize: 18 }} />
      </PageButton>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <PageButton
          key={p}
          active={p === currentPage}
          onClick={() => onPageChange(p)}
          aria-label={`ページ${p}`}
        >
          {p}
        </PageButton>
      ))}
      <PageButton
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        aria-label="次のページ"
      >
        <ChevronRightIcon sx={{ fontSize: 18 }} />
      </PageButton>
    </Box>
  );
}

function PageButton({
  children,
  active,
  disabled,
  onClick,
  'aria-label': ariaLabel,
}: {
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  'aria-label'?: string;
}) {
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
