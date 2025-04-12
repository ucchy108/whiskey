import { IconButton, ListItem, ListItemText } from "@mui/material";
import { Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";

// ワークアウトの型定義
type Workout = {
  id: string;
  name: string;
  type: string;
  duration: number;
  date: string;
};

interface WorkoutProps {
  workout: Workout;
}

export function WorkoutItem({ workout }: WorkoutProps) {
  return (
    <ListItem>
      <ListItemText
        primary={workout.name}
        secondary={`${workout.type} / ${workout.duration}分 / ${workout.date}`}
      />
      <ListItem>
        <IconButton edge="end">
          <EditIcon />
        </IconButton>
        <IconButton edge="end">
          <DeleteIcon />
        </IconButton>
      </ListItem>
    </ListItem>
  );
}
