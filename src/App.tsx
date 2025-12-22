import { useMemo, useState, useEffect } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Stack,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import {
  ErrorOutline as ErrorIcon,
  Timeline as TimelineIcon,
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

  const [viewMode, setViewMode] = useState<"list" | "map" | "heatmap">("heatmap");
  const [filterType, setFilterType] = useState<string>("All");
  const [dateRange, setDateRange] = useState<DateRange>("year");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  // Load previous year if selected
  useEffect(() => {
    if (dateRange === "lastYear" && accessToken) {
      void loadActivitiesForYear(accessToken, new Date().getFullYear() - 1);
    }
  }, [dateRange, accessToken, loadActivitiesForYear]);

  const filteredActivities = useMemo(() => {
    let filtered = activities;

    // Filter by Type
    if (filterType !== "All") {
      filtered = filtered.filter((a) => a.type === filterType);
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
      activities.map((a) => a.type).filter((t): t is string => !!t)
    );
    return ["All", ...Array.from(types)];
  }, [activities]);

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

          {!isLoggedIn && (
            <Hero onLoginClick={() => (window.location.href = authUrl)} />
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

          {status === "ready" && activities.length > 0 && (
            <Stack spacing={{ xs: 2, md: 3 }}>
              <Stack spacing={2}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
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

                  <Box sx={{ display: { xs: "none", md: "block" } }}>
                    <DateFilter
                      selectedRange={dateRange}
                      onSelectRange={setDateRange}
                    />
                  </Box>
                </Stack>

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
              </Stack>

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
                    label={type}
                    onClick={() => setFilterType(type)}
                    color={filterType === type ? "primary" : "default"}
                    variant={filterType === type ? "filled" : "outlined"}
                    clickable
                  />
                ))}
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

          {status === "ready" && activities.length === 0 && (
            <Card
              variant="outlined"
              sx={{ borderStyle: "dashed", bgcolor: "transparent" }}
            >
              <CardContent sx={{ py: 6, textAlign: "center" }}>
                <Stack spacing={2} alignItems="center">
                  <Box
                    sx={{ p: 2, borderRadius: "50%", bgcolor: "action.hover" }}
                  >
                    <TimelineIcon color="primary" sx={{ fontSize: 40 }} />
                  </Box>
                  <Typography variant="h5" fontWeight="bold">
                    No activities yet
                  </Typography>
                  <Typography color="text.secondary">
                    Go for a walk or run a test workout.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          )}
        </Stack>
      </Container>
      <BuyMeCoffeeFab />
      <Footer />
    </Box>
  );
}

export default App;
