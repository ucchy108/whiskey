import { Card, CardContent, Stack, Typography } from "@mui/material";
import { Note } from "@mui/icons-material";
import { theme } from "@/theme";

interface WorkoutMemoProps {
  memo: string;
}

export function WorkoutDialy({ memo }: WorkoutMemoProps) {
  if (!memo) {
    return null;
  }

  return (
    <Card>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Note color="primary" />
          <Typography variant="h6" color={theme.happyHues.paragraph}>
            メモ
          </Typography>
        </Stack>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            pl: 5,
            whiteSpace: "pre-wrap",
            lineHeight: 1.6,
          }}
        >
          {memo}
        </Typography>
      </CardContent>
    </Card>
  );
}
