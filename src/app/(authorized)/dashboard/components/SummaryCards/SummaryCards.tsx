import {
  Grid2 as Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useDashboardStats } from "../../hooks/useDashboardStats";
import { createSummaryCards } from "./createSummaryCards";

export function SummaryCards() {
  const { stats, loading, error } = useDashboardStats();

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!stats) {
    return null;
  }

  const summaryCards = createSummaryCards(stats);

  return (
    <Grid container spacing={3}>
      {summaryCards.map((card, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
          <Card
            sx={{
              background: card.bgGradient,
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
