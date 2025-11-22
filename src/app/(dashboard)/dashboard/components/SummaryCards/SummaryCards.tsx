import { memo } from "react";
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
import { createSummaryCards } from "../../utils/createSummaryCards";

function SummaryCards() {
  const { stats, loading, error } = useDashboardStats();

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 4 }}>
        {error}
      </Alert>
    );
  }

  if (!stats) {
    return null;
  }

  const summaryCards = createSummaryCards(stats);

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
