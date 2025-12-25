import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  Fade,
} from "@mui/material";
import {
  FitnessCenter,
  TrendingUp,
  Psychology,
  EmojiEvents,
  Timeline,
} from "@mui/icons-material";
import WorkoutCreateButton from "../WorkoutCreateButton/WorkoutCreateButton";

interface EmptyStateProps {
  onCreateWorkout: () => void;
}

export function EmptyState({ onCreateWorkout }: EmptyStateProps) {
  const tips = [
    {
      icon: <Psychology />,
      title: "目標を設定しよう",
      description: "小さな目標から始めて、徐々にレベルアップ",
      color: "#9c27b0",
    },
    {
      icon: <Timeline />,
      title: "記録を続けよう",
      description: "継続は力なり！毎日の積み重ねが大切",
      color: "#2196f3",
    },
    {
      icon: <TrendingUp />,
      title: "進捗を追跡しよう",
      description: "データで自分の成長を実感できる",
      color: "#ff9800",
    },
  ];

  return (
    <Fade in timeout={1000}>
      <Box sx={{ textAlign: "center", py: 6 }}>
        {/* メインイラストレーション */}
        <Box
          sx={{
            mb: 4,
            position: "relative",
            display: "inline-block",
          }}
        >
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 2,
              position: "relative",
              "&::before": {
                content: '""',
                position: "absolute",
                top: -10,
                left: -10,
                right: -10,
                bottom: -10,
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, #667eea20 0%, #764ba220 100%)",
                animation: "pulse 2s infinite",
              },
              "@keyframes pulse": {
                "0%": {
                  transform: "scale(1)",
                  opacity: 1,
                },
                "50%": {
                  transform: "scale(1.1)",
                  opacity: 0.7,
                },
                "100%": {
                  transform: "scale(1)",
                  opacity: 1,
                },
              },
            }}
          >
            <FitnessCenter sx={{ fontSize: 48, color: "white" }} />
          </Box>
        </Box>

        {/* メインメッセージ */}
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
          🏋️ ワークアウトを始めよう！
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 4, maxWidth: 400, mx: "auto" }}
        >
          まだワークアウト記録がありません。
          <br />
          今日から健康的な生活をスタートしませんか？
        </Typography>

        <WorkoutCreateButton
          name={"最初のワークアウトを記録"}
          onClick={onCreateWorkout}
        />

        {/* ヒントカード */}
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
          💡 ワークアウトのコツ
        </Typography>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={3}
          sx={{ maxWidth: 900, mx: "auto", mb: 4 }}
        >
          {tips.map((tip, index) => (
            <Fade in timeout={1500 + index * 200} key={index}>
              <Card
                sx={{
                  flex: 1,
                  borderRadius: 3,
                  border: "2px solid",
                  borderColor: "grey.100",
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
                    borderColor: tip.color,
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      backgroundColor: tip.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      mb: 2,
                    }}
                  >
                    {tip.icon && (
                      <Box sx={{ color: "white", fontSize: 24 }}>
                        {tip.icon}
                      </Box>
                    )}
                  </Box>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                    {tip.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {tip.description}
                  </Typography>
                </CardContent>
              </Card>
            </Fade>
          ))}
        </Stack>

        {/* 追加のモチベーション要素 */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            今すぐ始められる簡単な運動
          </Typography>
          <Stack
            direction="row"
            spacing={1}
            justifyContent="center"
            flexWrap="wrap"
            gap={1}
          >
            {[
              "プッシュアップ",
              "スクワット",
              "プランク",
              "ウォーキング",
              "ストレッチ",
              "腹筋",
            ].map((exercise) => (
              <Chip
                key={exercise}
                label={exercise}
                variant="outlined"
                size="small"
                sx={{
                  borderRadius: 2,
                  "&:hover": {
                    backgroundColor: "primary.main",
                    color: "white",
                    borderColor: "primary.main",
                  },
                  transition: "all 0.2s ease-in-out",
                }}
              />
            ))}
          </Stack>
        </Box>

        {/* アイコン装飾 */}
        <Box sx={{ mt: 4, opacity: 0.3 }}>
          <Stack direction="row" justifyContent="center" spacing={3}>
            <EmojiEvents sx={{ fontSize: 32, color: "#ffd700" }} />
            <TrendingUp sx={{ fontSize: 32, color: "#4caf50" }} />
            <FitnessCenter sx={{ fontSize: 32, color: "#2196f3" }} />
          </Stack>
        </Box>
      </Box>
    </Fade>
  );
}
