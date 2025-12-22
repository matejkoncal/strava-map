import { Fab, Tooltip, Zoom } from "@mui/material";
import { LocalCafe } from "@mui/icons-material";

export function BuyMeCoffeeFab() {
  return (
    <Zoom in={true} timeout={300}>
      <Tooltip title="Buy us a coffee" placement="left" arrow>
        <Fab
          aria-label="buy me a coffee"
          href="https://buymeacoffee.com/justdorecap"
          target="_blank"
          sx={{
            position: "fixed",
            bottom: { xs: 16, sm: 24 },
            right: { xs: 16, sm: 24 },
            bgcolor: "#FFDD00",
            color: "rgba(0, 0, 0, 0.87)",
            "&:hover": {
              bgcolor: "#FFEA00",
            },
            zIndex: 1200,
            boxShadow: 6,
          }}
        >
          <LocalCafe />
        </Fab>
      </Tooltip>
    </Zoom>
  );
}
