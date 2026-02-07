import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';

const HEATMAP_COLORS = [
  '#22C55E',
  '#22C55E88',
  '#22C55E55',
  '#22C55E33',
  '#333333',
] as const;

// 19 columns x 5 rows heatmap grid pattern (pre-defined for decoration)
const HEATMAP_GRID: number[][] = [
  [3, 0, 1, 4, 2],
  [4, 2, 0, 0, 4],
  [0, 1, 4, 2, 0],
  [2, 4, 3, 0, 1],
  [4, 0, 2, 1, 4],
  [1, 0, 0, 3, 4],
  [0, 4, 1, 0, 2],
  [3, 0, 0, 4, 1],
  [2, 1, 3, 0, 0],
  [4, 2, 0, 2, 1],
  [0, 0, 2, 1, 4],
  [1, 4, 0, 3, 0],
  [4, 2, 1, 0, 2],
  [2, 0, 4, 0, 1],
  [0, 1, 2, 4, 0],
  [3, 0, 0, 1, 2],
  [1, 4, 0, 0, 3],
  [4, 2, 1, 2, 0],
  [2, 0, 0, 3, 4],
];

const STATS = [
  { value: '10K+', label: 'ワークアウト' },
  { value: '500+', label: 'ユーザー' },
  { value: '95%', label: '継続率' },
];

export function BrandPanel() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        height: '100%',
        bgcolor: 'dark.main',
        gap: 4,
        p: '60px 80px',
      }}
    >
      {/* Brand Content */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <FitnessCenterIcon
            sx={{ fontSize: 36, color: 'primary.main' }}
          />
          <Typography
            sx={{
              fontSize: 36,
              fontWeight: 700,
              color: 'dark.contrastText',
              fontFamily: '"Bricolage Grotesque", sans-serif',
            }}
          >
            Whiskey
          </Typography>
        </Box>

        {/* Tagline */}
        <Typography
          sx={{
            fontSize: 28,
            fontWeight: 700,
            lineHeight: 1.4,
            color: 'dark.contrastText',
            fontFamily: '"Bricolage Grotesque", sans-serif',
            width: 400,
            maxWidth: '100%',
            whiteSpace: 'pre-line',
          }}
        >
          {'筋トレを記録し、\n成長を可視化しよう。'}
        </Typography>

        {/* Subtitle */}
        <Typography
          sx={{
            fontSize: 16,
            lineHeight: 1.6,
            color: 'textMuted.main',
            width: 400,
            maxWidth: '100%',
            whiteSpace: 'pre-line',
          }}
        >
          {'毎日のトレーニングを記録し、\nヒートマップやグラフで進歩を実感しよう。'}
        </Typography>

        {/* Heatmap Preview */}
        <Box
          sx={{
            bgcolor: '#2A2A2A',
            borderRadius: 4,
            p: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 1.25,
            width: 400,
            maxWidth: '100%',
          }}
        >
          <Typography
            sx={{ fontSize: 13, fontWeight: 500, color: 'text.secondary' }}
          >
            トレーニング活動
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {HEATMAP_GRID.map((col, colIdx) => (
              <Box
                key={colIdx}
                sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}
              >
                {col.map((colorIdx, rowIdx) => (
                  <Box
                    key={rowIdx}
                    sx={{
                      width: 14,
                      height: 14,
                      borderRadius: '3px',
                      bgcolor: HEATMAP_COLORS[colorIdx],
                    }}
                  />
                ))}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Stats Row */}
      <Box sx={{ display: 'flex', gap: 5 }}>
        {STATS.map((stat) => (
          <Box
            key={stat.label}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <Typography
              sx={{
                fontSize: 24,
                fontWeight: 800,
                color: 'primary.main',
                fontFamily: '"Bricolage Grotesque", sans-serif',
              }}
            >
              {stat.value}
            </Typography>
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
              {stat.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
