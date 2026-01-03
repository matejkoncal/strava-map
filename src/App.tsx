import { useMemo, useState, useEffect } from "react";
import {
  Alert,
  Box,
  Chip,
  Container,
  Stack,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  Snackbar,
} from "@mui/material";
import {
  ErrorOutline as ErrorIcon,
  Map as MapIcon,
  List as ListIcon,
  FilterList as FilterIcon,
  Assessment as HeatmapIcon,
} from "@mui/icons-material";

import "./App.css";
import { useStravaAuth } from "./hooks/useStravaAuth";
import { useVisitedCountries } from "./hooks/useVisitedCountries";
import { HeaderBar } from "./components/HeaderBar";
import { Hero } from "./components/Hero";
import { LoadingState } from "./components/LoadingState";
import { CountryFlags } from "./components/CountryFlags";
import { ActivityList } from "./components/ActivityList";
import { MapView } from "./components/MapView";
import { HeatmapView } from "./components/HeatmapView";
import { DateFilter } from "./components/DateFilter";
import { Footer } from "./components/Footer";
import { BuyMeCoffeeFab } from "./components/BuyMeCoffeeFab";
import type { DateRange } from "./components/DateFilter";
import type { SportType } from "./types";
import { getActivityLabel } from "./utils/getActivityLabel";
import { isInAppBrowser } from "./utils/inAppBrowser";

function App() {
  const {
    accessToken,
    activities,
    status,
    errorMessage,
    authUrl,
    handleReset,
    loadActivitiesForYear,
  } = useStravaAuth();

  const { activityCountries, geoJsonData } = useVisitedCountries(activities);

  const [viewMode, setViewMode] = useState<"list" | "map" | "heatmap">(
    "heatmap"
  );
  const [filterType, setFilterType] = useState<string>("All");
  const [dateRange, setDateRange] = useState<DateRange>("lastYear");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [inApp] = useState(() => isInAppBrowser());
  const [copyOpen, setCopyOpen] = useState(false);

  // Load activities based on selected date range
  useEffect(() => {
    if (!accessToken) return;

    const currentYear = new Date().getFullYear();
 
    if (dateRange === "lastYear") {
      void loadActivitiesForYear(accessToken, currentYear - 1);
    } else {
      void loadActivitiesForYear(accessToken, currentYear);
    }
  }, [dateRange, accessToken, loadActivitiesForYear]);

  const filteredActivities = useMemo(() => {
    let filtered = activities;

    // Filter by Type
    if (filterType !== "All") {
      filtered = filtered.filter((a) => a.sport_type === filterType);
    }

    // Filter by Country
    if (selectedCountry) {
      filtered = filtered.filter(
        (a) => activityCountries.get(a.id) === selectedCountry
      );
    }

    // Filter by Date Range
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Get start of week (Monday)
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ...
    const diff = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1); // adjust when day is sunday
    const startOfWeek = new Date(now.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);

    filtered = filtered.filter((a) => {
      if (!a.start_date) return false;
      const activityDate = new Date(a.start_date);

      if (dateRange === "year") {
        return activityDate.getFullYear() === currentYear;
      }

      if (dateRange === "lastYear") {
        return activityDate.getFullYear() === currentYear - 1;
      }

      if (dateRange === "month") {
        return (
          activityDate.getFullYear() === currentYear &&
          activityDate.getMonth() === currentMonth
        );
      }

      if (dateRange === "week") {
        return activityDate >= startOfWeek;
      }

      return true;
    });

    return filtered;
  }, [activities, filterType, selectedCountry, activityCountries, dateRange]);

  const visibleCountries = useMemo(() => {
    const countries = new Set<string>();
    filteredActivities.forEach((a) => {
      const code = activityCountries.get(a.id);
      if (code) countries.add(code);
    });
    return countries;
  }, [filteredActivities, activityCountries]);

  const activityTypes = useMemo(() => {
    const types = new Set(
      filteredActivities
        .map((a) => a.sport_type)
        .filter((t): t is SportType => !!t)
    );
    return ["All", ...Array.from(types)];
  }, [filteredActivities]);

  const showLoader = status === "loading" || status === "exchanging";
  const isLoggedIn = Boolean(accessToken);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <Container
        maxWidth="lg"
        sx={{ py: { xs: 3, md: 6 }, px: { xs: 2, sm: 3 }, flexGrow: 1 }}
      >
        <Stack spacing={{ xs: 3, md: 4 }}>
          <HeaderBar onReset={handleReset} isLoggedIn={isLoggedIn} />

          {inApp ? (
            <>
              <Alert severity="info" variant="outlined">
                <Typography variant="h6" gutterBottom>
                  Open this page in your browser
                </Typography>
                <Typography variant="body2" gutterBottom>
                  It looks like you opened this page inside an in-app browser
                  (Instagram, Facebook or Messenger). Because of the
                  limitations of these browsers, some features may not work
                  correctly.
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Please open this page in your normal browser (Chrome, Safari,
                  etc.). You can copy the link below and paste it into your
                  browser:
                </Typography>
                <Box mt={1}>
                  <Typography
                    variant="body2"
                    sx={{ wordBreak: "break-all", fontFamily: "monospace" }}
                  >
                    {typeof window !== "undefined" ? window.location.href : ""}
                  </Typography>
                </Box>
                <Box mt={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={async () => {
                      if (typeof window === "undefined") return;
                      const url = window.location.href;
                      try {
                        if (navigator.clipboard && navigator.clipboard.writeText) {
                          await navigator.clipboard.writeText(url);
                        }
                        setCopyOpen(true);
                      } catch {
                        // ignore errors; user can still copy manually
                      }
                    }}
                  >
                    Copy link
                  </Button>
                </Box>
                <Typography variant="body2" mt={2}>
                  If copying does not work, please manually type justDoRecap.com
                  into the browser which you normally use and open the site
                  from there.
                </Typography>
              </Alert>

              <Snackbar
                open={copyOpen}
                autoHideDuration={3000}
                onClose={() => setCopyOpen(false)}
                message="Link copied to clipboard"
              />
            </>
          ) : (
            <>
              {!isLoggedIn && (
                <Hero
                  onLoginClick={() => (window.location.href = authUrl)}
                />
              )}

              {showLoader && <LoadingState status={status} />}

              {status === "error" && errorMessage && (
                <Alert
                  severity="error"
                  variant="outlined"
                  icon={<ErrorIcon fontSize="inherit" />}
                >
                  {errorMessage}
                </Alert>
              )}

              {status === "ready" && (
                <Stack spacing={{ xs: 2, md: 3 }}>
                  <Stack spacing={2}>
                    <Box sx={{ display: { xs: "none", md: "block" } }}>
                      <DateFilter
                        selectedRange={dateRange}
                        onSelectRange={setDateRange}
                      />
                    </Box>
                    <Box
                      sx={{
                        display: { xs: "block", md: "none" },
                        width: "100%",
                        overflowX: "auto",
                        pb: 1,
                      }}
                    >
                      <DateFilter
                        selectedRange={dateRange}
                        onSelectRange={setDateRange}
                      />
                    </Box>

                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      flexWrap="wrap"
                      useFlexGap
                    >
                      <FilterIcon color="action" />
                      {activityTypes.map((type) => (
                        <Chip
                          key={type}
                          label={
                            type === "All"
                              ? "All"
                              : getActivityLabel(type as SportType)
                          }
                          onClick={() => setFilterType(type)}
                          color={filterType === type ? "primary" : "default"}
                          variant={filterType === type ? "filled" : "outlined"}
                          clickable
                        />
                      ))}
                    </Stack>

                    <Stack direction="row" alignItems="center">
                      <ToggleButtonGroup
                        value={viewMode}
                        exclusive
                        onChange={(_, newView) => newView && setViewMode(newView)}
                        aria-label="view mode"
                        size="small"
                        fullWidth={false}
                      >
                        <ToggleButton value="heatmap" aria-label="heatmap view">
                          <HeatmapIcon sx={{ mr: 1 }} /> Overview
                        </ToggleButton>
                        <ToggleButton value="list" aria-label="list view">
                          <ListIcon sx={{ mr: 1 }} /> List
                        </ToggleButton>
                        <ToggleButton value="map" aria-label="map view">
                          <MapIcon sx={{ mr: 1 }} /> Map
                        </ToggleButton>
                      </ToggleButtonGroup>
                    </Stack>
                  </Stack>

                  <Box
                    key={viewMode}
                    sx={{
                      animation: "fadeIn 0.3s ease-in-out",
                      "@keyframes fadeIn": {
                        "0%": { opacity: 0, transform: "translateY(10px)" },
                        "100%": { opacity: 1, transform: "translateY(0)" },
                      },
                    }}
                  >
                    {viewMode === "list" ? (
                      <>
                        {visibleCountries.size > 0 && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary">
                              Visited Countries:
                            </Typography>
                            <CountryFlags
                              countries={visibleCountries}
                              selectedCountry={selectedCountry}
                              onSelectCountry={setSelectedCountry}
                            />
                          </Box>
                        )}
                        <ActivityList activities={filteredActivities} />
                      </>
                    ) : viewMode === "map" ? (
                      <MapView
                        activities={filteredActivities}
                        visitedCountries={visibleCountries}
                        geoJsonData={geoJsonData}
                      />
                    ) : (
                      <HeatmapView
                        activities={filteredActivities}
                        visitedCountries={visibleCountries}
                        dateRange={dateRange}
                        year={
                          dateRange === "lastYear"
                            ? new Date().getFullYear() - 1
                            : new Date().getFullYear()
                        }
                      />
                    )}
                  </Box>
                </Stack>
              )}
            </>
          )}
        </Stack>
      </Container>
      <BuyMeCoffeeFab />
      <Footer />
    </Box>
  );
}

export default App;
