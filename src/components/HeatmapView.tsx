import { useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Card,
  Stack,
  Typography,
  Tooltip,
  useTheme,
  Chip,
} from "@mui/material";
import {
  Download as DownloadIcon,
  DirectionsRun as RunIcon,
  AccessTime as TimeIcon,
} from "@mui/icons-material";
import {
  eachDayOfInterval,
  endOfYear,
  format,
  startOfYear,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { enUS } from "date-fns/locale";
import html2canvas from "html2canvas";
import type { Activity, SportType } from "../types";
import { formatDistance, formatDuration, formatDurationHoursOnly } from "../utils/format";
import type { DateRange } from "./DateFilter";
import { ActivityDetailDialog } from "./ActivityDetailDialog";
import { CountryFlags } from "./CountryFlags";
import { getActivityLabel } from "../utils/getActivityLabel";
import { getActivityIcon } from "../utils/getActivityIcon";

interface HeatmapViewProps {
  activities: Activity[];
  year?: number;
  dateRange?: DateRange;
  visitedCountries?: Set<string>;
}

export function HeatmapView({
  activities,
  year = new Date().getFullYear(),
  dateRange = "year",
  visitedCountries = new Set(),
}: HeatmapViewProps) {
  const theme = useTheme();
  const exportRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { days, stats, activityMap } = useMemo(() => {
    const now = new Date();
    let start: Date, end: Date;

    if (dateRange === "week") {
      start = startOfWeek(now, { weekStartsOn: 1 });
      end = endOfWeek(now, { weekStartsOn: 1 });
    } else if (dateRange === "month") {
      start = startOfWeek(startOfMonth(now), { weekStartsOn: 1 });
      end = endOfWeek(endOfMonth(now), { weekStartsOn: 1 });
    } else {
      // year or all
      start = startOfWeek(startOfYear(new Date(year, 0, 1)), {
        weekStartsOn: 1,
      });
      end = endOfWeek(endOfYear(new Date(year, 11, 31)), {
        weekStartsOn: 1,
      });
    }

    const daysRange = eachDayOfInterval({ start, end });

    // Filter activities for the selected range
    // Note: activities passed prop is already filtered by App.tsx,
    // but we double check to map them correctly to days
    const rangeActivities = activities.filter((a) => {
      if (!a.start_date) return false;
      const d = new Date(a.start_date);
      return d >= start && d <= end;
    });

    const map = new Map<string, Activity[]>();
    let totalDistance = 0;
    let totalTime = 0;
    let totalCalories = 0;
    let maxDistance = 0;

    rangeActivities.forEach((a) => {
      if (!a.start_date) return;
      const dateStr = format(new Date(a.start_date), "yyyy-MM-dd");
      const current = map.get(dateStr) || [];
      map.set(dateStr, [...current, a]);

      totalDistance += a.distance || 0;
      totalTime += a.moving_time || 0;
      totalCalories += a.calories || 0;
      maxDistance = Math.max(maxDistance, a.distance || 0);
    });

    return {
      days: daysRange,
      stats: {
        count: rangeActivities.length,
        distance: totalDistance,
        time: totalTime,
        calories: totalCalories,
      },
      activityMap: map,
    };
  }, [activities, year, dateRange]);

  const sportTypes = useMemo(
    () => Array.from(new Set(activities.map((a) => a.sport_type))),
    [activities]
  );
  const MAX_SPORTS = 10;
  const displayedSports = sportTypes.slice(0, MAX_SPORTS);
  const hiddenCount = sportTypes.length - MAX_SPORTS;

  const handleExport = async () => {
    // Use storyRef if available, otherwise fallback to exportRef
    const targetRef = storyRef.current || exportRef.current;
    if (!targetRef) return;

    try {
      const canvas = await html2canvas(targetRef, {
        backgroundColor: theme.palette.background.default,
        scale: 2, // Higher quality
        useCORS: true,
      });

      const link = document.createElement("a");
      link.download = `strava-heatmap-${year}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Export failed", err);
    }
  };

  // const handleShare = async () => {
  //   const targetRef = storyRef.current || exportRef.current;
  //   if (!targetRef) return;

  //   try {
  //     const canvas = await html2canvas(targetRef, {
  //       backgroundColor: theme.palette.background.default,
  //       scale: 2,
  //       useCORS: true,
  //     });

  //     canvas.toBlob(async (blob) => {
  //       if (!blob) return;
  //       const file = new File([blob], `strava-heatmap-${year}.png`, {
  //         type: "image/png",
  //       });

  //       if (navigator.share && navigator.canShare({ files: [file] })) {
  //         await navigator.share({
  //           files: [file],
  //           title: `My sports year ${year}`,
  //           text: `Check out my activities in ${year}!`,
  //         });
  //       } else {
  //         // Fallback to download
  //         handleExport();
  //       }
  //     });
  //   } catch (err) {
  //     console.error("Share failed", err);
  //   }
  // };

  // Group days by weeks for rendering
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];

  days.forEach((day) => {
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(day);
  });
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  const getIntensityColor = (dayActivities: Activity[]) => {
    if (dayActivities.length === 0) return "rgba(255,255,255,0.05)";
    // Simple logic: more activities = darker color, or use distance?
    // Let's use count for now, or just a solid color if active as requested
    // "Ak v dany den ma user zaznamenanu aktivitu vyfarbis"

    // Let's add some nuance based on count or distance
    const count = dayActivities.length;
    if (count >= 2) return theme.palette.primary.main;
    return theme.palette.primary.light;
  };

  const getTitle = () => {
    if (dateRange === "week") return "Weekly Overview";
    if (dateRange === "month") return "Monthly Overview";
    return "Yearly Activity Overview";
  };

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="flex-end" spacing={1}>
        {/* <Button
          startIcon={<ShareIcon />}
          variant="outlined"
          size="small"
          onClick={handleShare}
        >
          Share
        </Button> */}
        <Button
          startIcon={<DownloadIcon />}
          variant="outlined"
          size="small"
          onClick={handleExport}
        >
          Download
        </Button>
      </Stack>

      <Card
        ref={exportRef}
        sx={{
          p: { xs: 2, sm: 3 },
          bgcolor: "background.paper",
          backgroundImage: "none",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack spacing={{ xs: 2, sm: 4 }}>
          {/* Header Stats */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={{ xs: 2, sm: 3 }}
          >
            <Box>
              <Typography variant="h4" fontWeight="bold" color="primary">
                {year}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                {getTitle()}
              </Typography>
            </Box>

            <Stack
              direction="row"
              spacing={{ xs: 2, sm: 3 }}
              width={{ xs: "100%", sm: "auto" }}
              justifyContent={{ xs: "space-between", sm: "flex-start" }}
            >
              <Box textAlign="center">
                <Typography variant="h6" fontWeight="bold">
                  {formatDistance(stats.distance)}
                </Typography>
                <Stack
                  direction="row"
                  spacing={0.5}
                  alignItems="center"
                  justifyContent="center"
                >
                  <RunIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                  <Typography variant="caption" color="text.secondary">
                    Distance
                  </Typography>
                </Stack>
              </Box>
              <Box textAlign="center">
                <Typography variant="h6" fontWeight="bold">
                  {formatDuration(stats.time)}
                </Typography>
                <Stack
                  direction="row"
                  spacing={0.5}
                  alignItems="center"
                  justifyContent="center"
                >
                  <TimeIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                  <Typography variant="caption" color="text.secondary">
                    Time
                  </Typography>
                </Stack>
              </Box>
              <Box textAlign="center">
                <Typography variant="h6" fontWeight="bold">
                  {stats.count}
                </Typography>
                <Stack
                  direction="row"
                  spacing={0.5}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Typography variant="caption" color="text.secondary">
                    Activities
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          </Stack>

          {/* Country Flags */}
          {visitedCountries.size > 0 && (
            <Box>
              <CountryFlags
                countries={visitedCountries}
                selectedCountry={null}
                onSelectCountry={() => {}}
              />
            </Box>
          )}

          {/* Heatmap Grid */}
          <Box sx={{ overflowX: "auto" }}>
            <Box
              sx={{
                display: "inline-flex",
                flexDirection: "column",
                gap: 1,
                minWidth: "min-content",
                pb: 1,
              }}
            >
              {/* Month Labels */}
              <Box sx={{ display: "flex", ml: 0 }}>
                {weeks.map((week, i) => {
                  const firstDay = week[0];
                  const isFirstWeekOfMonth = firstDay.getDate() <= 7;
                  const showLabel =
                    isFirstWeekOfMonth ||
                    (i === 0 &&
                      dateRange !== "year" &&
                      dateRange !== "lastYear");
                  const monthLabel = showLabel
                    ? format(firstDay, "MMM", { locale: enUS })
                    : null;

                  return (
                    <Box
                      key={i}
                      sx={{ width: 14, flexShrink: 0, position: "relative" }}
                    >
                      {monthLabel && (
                        <Typography
                          variant="caption"
                          sx={{
                            position: "absolute",
                            bottom: 0,
                            fontSize: "0.65rem",
                            color: "text.secondary",
                            fontWeight: "bold",
                            lineHeight: 1,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {monthLabel}
                        </Typography>
                      )}
                    </Box>
                  );
                })}
              </Box>

              <Box sx={{ display: "flex", gap: "2px" }}>
                {/* Weeks Columns */}
                {weeks.map((week, i) => (
                  <Box
                    key={i}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "2px",
                    }}
                  >
                    {week.map((day) => {
                      const dateStr = format(day, "yyyy-MM-dd");
                      const dayActivities = activityMap.get(dateStr) || [];
                      const hasActivity = dayActivities.length > 0;
                      const isFuture = day > new Date();
                      const isCurrentYear = day.getFullYear() === year;
                      const shouldShow =
                        dateRange === "year" || dateRange === "lastYear"
                          ? isCurrentYear
                          : true;

                      return (
                        <Tooltip
                          key={dateStr}
                          title={
                            hasActivity ? (
                              <Box sx={{ textAlign: "center" }}>
                                <Typography variant="body2" fontWeight="bold">
                                  {format(day, "d. MMMM yyyy", {
                                    locale: enUS,
                                  })}
                                </Typography>
                                <Typography variant="caption">
                                  {dayActivities.length} activities
                                  <br />
                                  {formatDistance(
                                    dayActivities.reduce(
                                      (acc, a) => acc + (a.distance || 0),
                                      0
                                    )
                                  )}
                                </Typography>
                              </Box>
                            ) : (
                              format(day, "d. MMMM yyyy", { locale: enUS })
                            )
                          }
                        >
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              bgcolor: shouldShow
                                ? hasActivity
                                  ? getIntensityColor(dayActivities)
                                  : "rgba(255,255,255,0.05)"
                                : "transparent",
                              borderRadius: 0.5,
                              cursor:
                                shouldShow && hasActivity
                                  ? "pointer"
                                  : "default",
                              opacity: isFuture ? 0.3 : 1,
                              transition: "all 0.2s",
                              "&:hover": {
                                transform: shouldShow ? "scale(1.2)" : "none",
                                zIndex: 1,
                                border: shouldShow ? "1px solid white" : "none",
                              },
                            }}
                            onClick={() => {
                              if (shouldShow && hasActivity) {
                                setSelectedDate(day);
                                setDetailOpen(true);
                              }
                            }}
                          />
                        </Tooltip>
                      );
                    })}
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Stack>
      </Card>

      <ActivityDetailDialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        date={selectedDate}
        activities={
          selectedDate
            ? activityMap.get(format(selectedDate, "yyyy-MM-dd")) || []
            : []
        }
      />

      {/* Hidden Story Export View */}
      <Box
        ref={storyRef}
        sx={{
          position: "fixed",
          left: -9999,
          top: 0,
          width: 1080,
          height: 1920,
          bgcolor: "background.paper",
          p: 8,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          fontFamily: "'Montserrat', sans-serif",
        }}
      >
        <Box
          pt={16}
          sx={{
            display: "flex",
            flexDirection: "row",
            flex: 1,
            width: "100%",
            alignItems: "flex-start",
            justifyContent: "center",
            gap: 10,
          }}
        >
          <Box sx={{ minWidth: 260, pl: 8, pt: 2 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                width: "100%",
                alignItems: "center",
              }}
            >
              {weeks.map((week, i) => {
                const firstDayOfWeek = week[0];
                const isFirstWeekOfMonth = firstDayOfWeek.getDate() <= 7;
                const showMonthLabel =
                  isFirstWeekOfMonth ||
                  (i === 0 && dateRange !== "year" && dateRange !== "lastYear");

                const monthLabel = showMonthLabel
                  ? format(firstDayOfWeek, "MMM", { locale: enUS })
                  : null;

                return (
                  <Box
                    key={i}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "44px repeat(7, 22px)",
                      gap: "4px",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        pr: 0.75,
                      }}
                    >
                      {monthLabel && (
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: "bold",
                            color: "text.secondary",
                            textTransform: "uppercase",
                            fontSize: "0.9rem",
                          }}
                        >
                          {monthLabel}
                        </Typography>
                      )}
                    </Box>
                    {week.map((day) => {
                      const dateStr = format(day, "yyyy-MM-dd");
                      const dayActivities = activityMap.get(dateStr) || [];
                      const hasActivity = dayActivities.length > 0;
                      const isFuture = day > new Date();
                      const isCurrentYear = day.getFullYear() === year;
                      const shouldShow =
                        dateRange === "year" || dateRange === "lastYear"
                          ? isCurrentYear
                          : true;

                      if (!shouldShow) return <Box key={dateStr} />;

                      return (
                        <Box
                          key={dateStr}
                          sx={{
                            width: 22,
                            height: 22,
                            bgcolor: hasActivity
                              ? getIntensityColor(dayActivities)
                              : "rgba(128,128,128,0.1)",
                            borderRadius: 0.5,
                            opacity: isFuture ? 0.3 : 1,
                          }}
                        />
                      );
                    })}
                  </Box>
                );
              })}
            </Box>
          </Box>
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              pl: 8,
            }}
          >
            <Typography
              variant="h1"
              sx={{
                fontWeight: 800,
                fontSize: "9rem",
                fontFamily: "'Montserrat', sans-serif",
                color: "#fff",
                lineHeight: 1,
                mb: 4,
              }}
            >
              {year}
            </Typography>

            {visitedCountries.size > 0 && (
              <Box
                sx={{
                  mb: 6,
                }}
              >
                <CountryFlags
                  countries={visitedCountries}
                  selectedCountry={null}
                  onSelectCountry={() => {}}
                  flagSize={42}
                />
              </Box>
            )}

            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" sx={{ color: "#fff" }}>
                Total Distance:
              </Typography>
              <Typography
                variant="h2"
                sx={{
                  mb: 2,
                  fontFamily: "'Bebas Neue'",
                  fontWeight: 500,
                  fontSize: "10rem",
                  color: "#fff",
                }}
              >
                {formatDistance(stats.distance)}
                <span
                  style={{
                    fontFamily: "'Montserrat'",
                    fontSize: "2rem",
                    color: "#fff",
                    marginLeft: "0.5em",
                  }}
                >
                  km
                </span>
              </Typography>
              <Typography variant="h4" sx={{ color: "#fff" }}>
                Total Time:
              </Typography>
              <Typography
                variant="h2"
                sx={{
                  fontFamily: "'Bebas Neue'",
                  fontWeight: 500,
                  fontSize: "10rem",
                  color: "#fff",
                  mb: 2,
                }}
              >
                {formatDurationHoursOnly(stats.time)}
                <span
                  style={{
                    fontFamily: "'Montserrat'",
                    fontSize: "2rem",
                    color: "#fff",
                    marginLeft: "0.5em",
                  }}
                >
                  hrs
                </span>
              </Typography>
              <Typography variant="h4" sx={{ color: "#fff" }}>
                Number of Activities:
              </Typography>
              <Typography
                variant="h2"
                sx={{
                  fontFamily: "'Bebas Neue'",
                  fontWeight: 500,
                  fontSize: "10rem",
                  color: "#fff",
                }}
              >
                {stats.count}
              </Typography>
            </Box>

            <Box sx={{ mb: 6 }}>
              <Typography variant="h4" sx={{ color: "#fff", mb: 2 }}>
                Activities:
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                {displayedSports.map((type) => (
                  <Chip
                    key={type}
                    label={getActivityLabel(type as SportType)}
                    color="primary"
                    variant="outlined"
                    clickable={false}
                    icon={getActivityIcon(type as SportType)}
                    sx={{
                      fontSize: "1.7rem",
                      height: 56,
                    }}
                  />
                ))}
                {hiddenCount > 0 && (
                  <Chip
                    label={`+${hiddenCount} more`}
                    color="primary"
                    variant="outlined"
                    sx={{
                      fontSize: "1.7rem",
                      height: 56,
                      opacity: 0.7,
                    }}
                  />
                )}
              </Box>
            </Box>
          </Box>
        </Box>
        <Box sx={{ width: "100%", textAlign: "center", pb: 16 }}>
          <Typography
            variant="h3"
            color="#fff"
            sx={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 1000,
              fontStyle: "italic",
              opacity: 0.8,
            }}
          >
            Just Do Recap
          </Typography>
        </Box>
      </Box>
    </Stack>
  );
}
