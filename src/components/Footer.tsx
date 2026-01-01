import { useState } from "react";
import {
  Box,
  Container,
  Link,
  Typography,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import { Email, Lock, Code, Close, Info, LocalCafe } from "@mui/icons-material";

export function Footer() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Box
        component="footer"
        sx={{
          py: 3,
          mt: "auto",
          backgroundColor: (theme) =>
            theme.palette.mode === "light"
              ? theme.palette.grey[100]
              : theme.palette.grey[900],
          borderTop: 1,
          borderColor: "divider",
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Typography variant="body2" color="text.secondary">
              {"Copyright © "}
              <Link color="inherit" href="https://justdorecap.com/">
                Just Do Recap
              </Link>{" "}
              {new Date().getFullYear()}
            </Typography>

            <Stack direction="row" spacing={2}>
              <Button
                startIcon={<Info />}
                size="small"
                color="inherit"
                onClick={() => setOpen(true)}
              >
                About & Privacy
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            m: 0,
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" component="div">
            About Just Do Recap
          </Typography>
          <IconButton
            aria-label="close"
            onClick={() => setOpen(false)}
            sx={{
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack direction={{ xs: "column", md: "row" }} spacing={4}>
            <Box flex={1}>
              <Stack spacing={2}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Code color="primary" />
                  <Typography
                    variant="h6"
                    color="text.primary"
                    gutterBottom
                    sx={{ mb: 0 }}
                  >
                    About the Project
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Just Do Recap is a hobby project created by developers who
                  love running and coding. Our goal is to provide a simple,
                  beautiful way to visualize your Strava activities.
                </Typography>
                <Box>
                  <Typography
                    variant="subtitle2"
                    color="text.primary"
                    gutterBottom
                  >
                    Created by:
                  </Typography>
                  <Stack spacing={1}>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        Matej Koncal
                      </Typography>
                      <Link
                        href="mailto:matej.koncal@justdorecap.com"
                        color="text.secondary"
                        variant="body2"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                      >
                        <Email fontSize="inherit" />{" "}
                        matej.koncal@justdorecap.com
                      </Link>
                    </Box>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        Martin Liscinsky
                      </Typography>
                      <Link
                        href="mailto:martin.liscinsky@justdorecap.com"
                        color="text.secondary"
                        variant="body2"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                      >
                        <Email fontSize="inherit" />{" "}
                        martin.liscinsky@justdorecap.com
                      </Link>
                    </Box>
                  </Stack>
                </Box>

                <Box pt={1}>
                  <Button
                    variant="outlined"
                    startIcon={<LocalCafe />}
                    href="https://buymeacoffee.com/justdorecap"
                    target="_blank"
                    color="inherit"
                    sx={{
                      borderColor: "#FFDD00",
                      color: (theme) =>
                        theme.palette.mode === "dark" ? "#FFDD00" : "#B89E00",
                      "&:hover": {
                        borderColor: "#FFDD00",
                        bgcolor: "rgba(255, 221, 0, 0.08)",
                      },
                    }}
                  >
                    Support us with a coffee
                  </Button>
                </Box>
              </Stack>
            </Box>
            <Box flex={1}>
              <Stack spacing={2}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Lock color="primary" />
                  <Typography
                    variant="h6"
                    color="text.primary"
                    gutterBottom
                    sx={{ mb: 0 }}
                  >
                    Privacy & Data
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  We take your privacy seriously. This application runs entirely
                  in your browser.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • We do <strong>not</strong> store any of your activity data
                  on our servers.
                  <br />
                  • Your Strava tokens are exchanged securely and stored only in
                  your browser's local storage.
                  <br />• No personal information is shared with third parties.
                </Typography>
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}
