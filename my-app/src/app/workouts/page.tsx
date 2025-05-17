"use client";

import React from "react";
import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";

// ワークアウトの型定義
interface Workout {
  id: string;
  name: string;
  type: string;
  duration: number;
  date: string;
}

// ワークアウトタイプのオプション
const workoutTypes = [
  "ランニング",
  "ウェイトトレーニング",
  "ヨガ",
  "水泳",
  "サイクリング",
  "その他",
];

export default function Home() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [formData, setFormData] = useState<Omit<Workout, "id">>({
    name: "",
    type: "ランニング",
    duration: 30,
    date: new Date().toISOString().split("T")[0],
  });

  // ローカルストレージからワークアウトデータを読み込む
  useEffect(() => {
    const savedWorkouts = localStorage.getItem("workouts");
    if (savedWorkouts) {
      setWorkouts(JSON.parse(savedWorkouts));
    }
  }, []);

  // ワークアウトデータをローカルストレージに保存
  useEffect(() => {
    localStorage.setItem("workouts", JSON.stringify(workouts));
  }, [workouts]);

  // ダイアログを開く
  const handleOpenDialog = (workout?: Workout) => {
    if (workout) {
      setEditingWorkout(workout);
      setFormData({
        name: workout.name,
        type: workout.type,
        duration: workout.duration,
        date: workout.date,
      });
    } else {
      setEditingWorkout(null);
      setFormData({
        name: "",
        type: "ランニング",
        duration: 30,
        date: new Date().toISOString().split("T")[0],
      });
    }
    setOpenDialog(true);
  };

  // ダイアログを閉じる
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // フォームの入力変更を処理
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "duration" ? parseInt(value) || 0 : value,
    });
  };

  // セレクトの変更を処理
  const handleSelectChange = (e: SelectChangeEvent) => {
    setFormData({
      ...formData,
      type: e.target.value,
    });
  };

  // ワークアウトを保存
  const handleSaveWorkout = () => {
    if (editingWorkout) {
      // 既存のワークアウトを更新
      setWorkouts(
        workouts.map((w) =>
          w.id === editingWorkout.id
            ? { ...formData, id: editingWorkout.id }
            : w
        )
      );
    } else {
      // 新しいワークアウトを追加
      const newWorkout: Workout = {
        ...formData,
        id: Date.now().toString(),
      };
      setWorkouts([...workouts, newWorkout]);
    }
    handleCloseDialog();
  };

  // ワークアウトを削除
  return (
    // <ThemeProvider theme={darkTheme}>
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          ワークアウト管理
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            新しいワークアウト
          </Button>
        </Box>
      </Box>

      {/* ワークアウト追加/編集ダイアログ */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {editingWorkout ? "ワークアウトを編集" : "新しいワークアウト"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="ワークアウト名"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={handleFormChange}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>タイプ</InputLabel>
            <Select
              name="type"
              value={formData.type}
              label="タイプ"
              onChange={handleSelectChange}
            >
              {workoutTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            name="duration"
            label="時間（分）"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.duration}
            onChange={handleFormChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="date"
            label="日付"
            type="date"
            fullWidth
            variant="outlined"
            InputLabelProps={{
              shrink: true,
            }}
            value={formData.date}
            onChange={handleFormChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>キャンセル</Button>
          <Button onClick={handleSaveWorkout} variant="contained">
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
