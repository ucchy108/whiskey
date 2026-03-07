import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export interface ExerciseDeleteDialogProps {
  open: boolean;
  exerciseName: string;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ExerciseDeleteDialog({
  open,
  exerciseName,
  isLoading,
  onClose,
  onConfirm,
}: ExerciseDeleteDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>エクササイズを削除</DialogTitle>
      <DialogContent>
        <DialogContentText>
          「{exerciseName}」を削除しますか？この操作は取り消せません。
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isLoading}>
          キャンセル
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={onConfirm}
          disabled={isLoading}
        >
          削除
        </Button>
      </DialogActions>
    </Dialog>
  );
}
