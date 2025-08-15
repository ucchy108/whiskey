import { memo } from "react";
import {
  Grid2 as Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
} from "@mui/material";
import { WorkoutWithDetails } from "../../types";
import { useSummaryStats } from "../../hooks/useSummaryStats";
import { createSummaryCards } from "../../utils/createSummaryCards";

interface SummaryCardsProps {
  workouts: WorkoutWithDetails[];
}

function SummaryCards({ workouts }: SummaryCardsProps) {
  const summaryStats = useSummaryStats(workouts);
  const summaryCards = createSummaryCards(summaryStats);

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {summaryCards.map((card, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
          <Card
            sx={{
              background: card.bgGradient,
              color: card.color,
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                right: 0,
                width: "100px",
                height: "100px",
                background: "rgba(255, 255, 255, 0.1)",
                borderRadius: "50%",
                transform: "translate(30px, -30px)",
              },
            }}
          >
            <CardContent sx={{ position: "relative", zIndex: 1 }}>
              <Stack spacing={2}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ opacity: 0.9, fontWeight: 500 }}
                  >
                    {card.title}
                  </Typography>
                  <Box sx={{ opacity: 0.8 }}>{card.icon}</Box>
                </Box>
                <Box>
                  <Typography
                    variant="h3"
                    fontWeight="bold"
                    sx={{ lineHeight: 1 }}
                  >
                    {card.value}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    {card.subtitle}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

const MemoizedSummaryCards = memo(SummaryCards);

export { MemoizedSummaryCards as SummaryCards };
