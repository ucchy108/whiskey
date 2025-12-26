import {
  Grid2 as Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
} from "@mui/material";
import { createSummaryCards } from "./createSummaryCards";
import { DashboardStatsWithCharts } from "@/repositories/statsRepository";

interface SummaryCardsProps {
  stats: DashboardStatsWithCharts;
}

export function SummaryCards({ stats }: SummaryCardsProps) {
  const summaryCards = createSummaryCards(stats);

  return (
    <Grid container spacing={3}>
      {summaryCards.map((card, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
          <Card
            sx={{
              background: card.bgColor,
              color: card.color,
              position: "relative",
              overflow: "hidden",
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
