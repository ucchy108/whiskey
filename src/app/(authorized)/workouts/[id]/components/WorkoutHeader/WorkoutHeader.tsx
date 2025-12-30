import { Card, CardContent, Stack, Typography } from "@mui/material";
import { Assessment as AssessmentIcon } from "@mui/icons-material";
import { CalendarToday } from "@mui/icons-material";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

interface WorkoutHeaderProps {
  date: Date;
}

export function WorkoutHeader({ date }: WorkoutHeaderProps) {
  const formattedDate = format(date, "yyyy年MM月dd日(EEEE)", {
    locale: ja,
  });

  return (
    <Card
      sx={{
        background: (theme) => theme.happyHues.button,
      }}
    >
      <CardContent
        sx={{
          color: (theme) => theme.happyHues.buttonText,
          textAlign: "center",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={2}
          justifyContent="center"
          mb={1}
        >
          <AssessmentIcon sx={{ fontSize: 32 }} />
          <Typography variant="h4" fontWeight="bold">
            ワークアウトレポート
          </Typography>
        </Stack>
        <Stack
          direction="row"
          alignItems="center"
          spacing={2}
          justifyContent="center"
        >
          <CalendarToday sx={{ color: "white", fontSize: 28 }} />
          <Typography
            variant="h6"
            component="h1"
            fontWeight="medium"
            sx={{ color: "rgba(255,255,255,0.9)" }}
          >
            {formattedDate}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
