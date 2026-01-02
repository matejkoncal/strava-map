import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";

export function LoadingState({ status }: { status: "loading" | "exchanging" }) {
  const label =
    status === "exchanging" ? "Loading..." : "Loading activities...";
  return (
    <Card variant="outlined" sx={{ bgcolor: "rgba(255,255,255,0.02)" }}>
      <CardContent sx={{ p: 4 }}>
        <Stack direction="row" spacing={3} alignItems="center">
          <CircularProgress color="secondary" size={40} />
          <Box>
            <Typography variant="h6" fontWeight="bold">
              {label}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait.
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
