import { Box, Button, Stack, Typography } from "@mui/material";
import { Logout as LogoutIcon } from "@mui/icons-material";
import logoFull from "../assets/justdorecap-logo.png";

export function HeaderBar({
  onReset,
  isLoggedIn,
}: {
  onReset: () => void;
  isLoggedIn: boolean;
}) {
  return (
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ width: "100%" }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            component="img"
            src={logoFull}
            alt="Just Do Recap"
            sx={{ height: { xs: 28, sm: 32, md: 40 }, width: "auto" }}
          />
          <Typography
            variant="h4"
            fontStyle={"italic"}
            color="text.primary"
            sx={{
              fontWeight: 700,
              letterSpacing: 0.5,
              fontSize: { xs: "1.5rem", sm: "2.125rem" },
            }}
          >
            justDo
            <Box component="span" sx={{ color: "#7C8CFF" }}>
              Recap
            </Box>
          </Typography>
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
      </Stack>
    </Box>
  );
}
