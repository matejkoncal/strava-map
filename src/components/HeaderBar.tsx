import { Box, Button, Stack, Typography } from "@mui/material";
import { Logout as LogoutIcon } from "@mui/icons-material";

export function HeaderBar({
  onReset,
  isLoggedIn,
}: {
  onReset: () => void;
  isLoggedIn: boolean;
}) {
  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      mb={2}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Box
          sx={{
            width: 6,
            height: 48,
            borderRadius: 4,
            background: "linear-gradient(to bottom, #6366f1, #8b5cf6)",
            boxShadow: "0 4px 12px rgba(139, 92, 246, 0.5)",
          }}
        />
        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={500}
            letterSpacing={1}
          >
            JUST DO RECAP
          </Typography>
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{
              fontSize: { xs: "1.5rem", sm: "2.125rem" },
              background: "linear-gradient(45deg, #818cf8, #a78bfa)",
              backgroundClip: "text",
              textFillColor: "transparent",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Activity Insights
          </Typography>
        </Box>
      </Stack>

      {isLoggedIn && (
        <Button
          variant="outlined"
          color="inherit"
          startIcon={<LogoutIcon />}
          onClick={onReset}
          sx={{
            borderColor: "rgba(255,255,255,0.1)",
            "&:hover": { borderColor: "rgba(255,255,255,0.3)" },
          }}
        >
          Logout
        </Button>
      )}
    </Box>
  );
}
