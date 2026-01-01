import { Button, Card, CardContent, Stack, Typography } from "@mui/material";

export function Hero({ onLoginClick }: { onLoginClick: () => void }) {
  return (
    <Card
      elevation={0}
      sx={{
        background:
          "linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.05))",
        border: "1px solid rgba(139, 92, 246, 0.2)",
        backdropFilter: "blur(20px)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <CardContent
        sx={{ p: { xs: 4, md: 6 }, position: "relative", zIndex: 1 }}
      >
        <Stack spacing={4} maxWidth="md">
          <Stack spacing={2}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: "2.5rem", md: "3.5rem" },
                background: "linear-gradient(to right, #818cf8, #60a5fa)",
                backgroundClip: "text",
                textFillColor: "transparent",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Your Personal Activity Recap
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ fontWeight: 400, lineHeight: 1.6 }}
            >
              Explore your activities, generate beautiful recaps, and share them with your friends. Log in to get started!
            </Typography>
          </Stack>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems="center"
          >
            <Button
              variant="contained"
              size="large"
              onClick={onLoginClick}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: "1.1rem",
                background: "linear-gradient(45deg, #6366f1, #8b5cf6)",
                boxShadow: "0 8px 20px rgba(99, 102, 241, 0.3)",
              }}
            >
              Login with Strava
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
