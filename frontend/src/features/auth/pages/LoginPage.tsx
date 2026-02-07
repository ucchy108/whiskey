import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

export function LoginPage() {
  return (
    <Container maxWidth="sm">
      <Typography variant="h4" component="h1" gutterBottom>
        ログイン
      </Typography>
      <Typography color="text.secondary">ログインフォームをここに実装</Typography>
    </Container>
  );
}
