import { useState, useRef, useEffect, useCallback } from "react";
import { TableCell, TextField } from "@mui/material";

interface EditableCellProps {
  value: string | null;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (newValue: string) => void;
  onCancel: () => void;
}

export function EditableCell({
  value,
  isEditing,
  onEdit,
  onSave,
  onCancel,
}: EditableCellProps) {
  const [editValue, setEditValue] = useState(value || "");
  const inputRef = useRef<HTMLInputElement>(null);

  // 編集モード開始時にフォーカス
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // 編集モード開始時に現在値をセット
  useEffect(() => {
    if (isEditing) {
      setEditValue(value || "");
    }
  }, [isEditing, value]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onSave(editValue);
      } else if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    },
    [editValue, onSave, onCancel]
  );

  const handleBlur = useCallback(() => {
    onSave(editValue);
  }, [editValue, onSave]);

  return (
    <TableCell
      onClick={isEditing ? undefined : onEdit}
      sx={{ cursor: isEditing ? "default" : "pointer" }}
    >
      {isEditing ? (
        <TextField
          inputRef={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          size="small"
          fullWidth
          variant="standard"
        />
      ) : (
        <span>{value || "-"}</span>
      )}
    </TableCell>
  );
}
