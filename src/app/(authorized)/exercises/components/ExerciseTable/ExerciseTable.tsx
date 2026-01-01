import { useState, useCallback } from "react";
import { Exercise } from "@/repositories/exerciseRepository";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { EditableCell } from "../EditableCell";
import { DeleteConfirmDialog } from "../DeleteConfirmDialog";
import { DeletableCell } from "../DeletableCell/DeletableCell";
import { useUpdateExercise } from "../../hooks/useUpdateExercise";
import { useDeleteExercise } from "../../hooks/useDeleteExercise";
import { useSuccessSnackbar } from "@/app/hooks/useSuccessSnackbar";
import { useErrorSnackbar } from "@/app/hooks/useErrorSnackbar";

type EditingCell = {
  exerciseId: string;
  field: "name" | "description";
} | null;

interface ExerciseTableProps {
  exercises: Exercise[];
  onRefresh?: () => void;
}

export function ExerciseTable({ exercises, onRefresh }: ExerciseTableProps) {
  const [editingCell, setEditingCell] = useState<EditingCell>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState<Exercise | null>(
    null
  );

  const { updateExercise, loading: updateLoading } = useUpdateExercise();
  const { deleteExercise, loading: deleteLoading } = useDeleteExercise();
  const { openSuccessSnackbar } = useSuccessSnackbar();
  const { openErrorSnackbar } = useErrorSnackbar();

  const handleEdit = useCallback(
    (exerciseId: string, field: "name" | "description") => {
      setEditingCell({ exerciseId, field });
    },
    []
  );

  const handleSave = useCallback(
    async (
      exerciseId: string,
      field: "name" | "description",
      newValue: string
    ) => {
      const updateData = { [field]: newValue };
      const result = await updateExercise(exerciseId, updateData);

      if (result) {
        openSuccessSnackbar("更新しました");
        if (onRefresh) {
          onRefresh();
        }
      } else {
        openErrorSnackbar("更新に失敗しました");
      }

      setEditingCell(null);
    },
    [updateExercise, openSuccessSnackbar, openErrorSnackbar, onRefresh]
  );

  const handleCancel = useCallback(() => {
    setEditingCell(null);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!exerciseToDelete) return;

    const success = await deleteExercise(exerciseToDelete.id);

    if (success) {
      openSuccessSnackbar("削除しました");
      if (onRefresh) {
        onRefresh();
      }
    } else {
      openErrorSnackbar("削除に失敗しました");
    }

    setDeleteDialogOpen(false);
    setExerciseToDelete(null);
  }, [
    exerciseToDelete,
    deleteExercise,
    openSuccessSnackbar,
    openErrorSnackbar,
    onRefresh,
  ]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialogOpen(false);
    setExerciseToDelete(null);
  }, []);

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>名前</TableCell>
              <TableCell>説明</TableCell>
              <TableCell width={60} />
            </TableRow>
          </TableHead>
          <TableBody>
            {exercises.map((exercise) => (
              <TableRow key={exercise.id}>
                <EditableCell
                  value={exercise.name}
                  isEditing={
                    editingCell?.exerciseId === exercise.id &&
                    editingCell?.field === "name"
                  }
                  onEdit={() => handleEdit(exercise.id, "name")}
                  onSave={(newValue) =>
                    handleSave(exercise.id, "name", newValue)
                  }
                  onCancel={handleCancel}
                />
                <EditableCell
                  value={exercise.description}
                  isEditing={
                    editingCell?.exerciseId === exercise.id &&
                    editingCell?.field === "description"
                  }
                  onEdit={() => handleEdit(exercise.id, "description")}
                  onSave={(newValue) =>
                    handleSave(exercise.id, "description", newValue)
                  }
                  onCancel={handleCancel}
                />
                <DeletableCell
                  exercise={exercise}
                  setExerciseToDelete={setExerciseToDelete}
                  setDeleteDialogOpen={setDeleteDialogOpen}
                  disabled={updateLoading || deleteLoading}
                />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        exerciseName={exerciseToDelete?.name || ""}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </>
  );
}
