import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

export function DashboardPage() {
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        ダッシュボード
      </Typography>
      <Typography color="text.secondary">
        ヒートマップ・進捗グラフをここに実装
      </Typography>
    </Container>
  );
}
