import { useMemo, useRef, useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  Stack,
  Typography,
  Tooltip,
  useTheme,
  Chip,
  useMediaQuery,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
} from "@mui/material";
import {
  Download as DownloadIcon,
  Share as ShareIcon,
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
import {
  formatDistance,
  formatDurationHoursOnly,
} from "../utils/format";
import type { DateRange } from "./DateFilter";
import { ActivityDetailDialog } from "./ActivityDetailDialog";
import { CountryFlags } from "./CountryFlags";
import { getActivityLabel } from "../utils/getActivityLabel";
import { getActivityIcon } from "../utils/getActivityIcon";
import logoFull from "../assets/justdorecap-logo.png";

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
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const exportRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"classic" | "story">(
    isMobile ? "story" : "classic"
  );

  useEffect(() => {
    if (isMobile) setViewMode("story");
  }, [isMobile]);

  type StoryTheme = "midnight" | "paper" | "sunset" | "forest" | "amber";

  const STORY_THEMES: Record<
    StoryTheme,
    {
      label: string;
      bg: string;
      text: string;
      mutedText: string;
      accent: string;
      emptyCell: string;
      overlayGradient: string;
      chipColor: "default" | "primary";
    }
  > = {
    midnight: {
      label: "Midnight",
      bg: "#081427",
      text: "#ffffff",
      mutedText: "rgba(255,255,255,0.78)",
      accent: theme.palette.primary.main,
      emptyCell: "rgba(255,255,255,0.14)",
      overlayGradient:
        "linear-gradient(180deg, rgba(3,10,22,0.62) 0%, rgba(3,10,22,0.40) 45%, rgba(3,10,22,0.70) 100%)",
      chipColor: "primary",
    },
    paper: {
      label: "Paper",
      bg: "#f7f7fb",
      text: "#0b0f14",
      mutedText: "rgba(11,15,20,0.65)",
      accent: "#3f51b5",
      emptyCell: "rgba(11,15,20,0.10)",
      overlayGradient:
        "linear-gradient(180deg, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.15) 45%, rgba(0,0,0,0.32) 100%)",
      chipColor: "default",
    },
    sunset: {
      label: "Sunset",
      bg: "#24111a",
      text: "#fff7f9",
      mutedText: "rgba(255,247,249,0.75)",
      accent: "#ff5c93",
      emptyCell: "rgba(255,247,249,0.12)",
      overlayGradient:
        "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0.60) 100%)",
      chipColor: "default",
    },
    forest: {
      label: "Forest",
      bg: "#071910",
      text: "#eafff3",
      mutedText: "rgba(234,255,243,0.72)",
      accent: "#2ee59d",
      emptyCell: "rgba(234,255,243,0.12)",
      overlayGradient:
        "linear-gradient(180deg, rgba(0,0,0,0.60) 0%, rgba(0,0,0,0.40) 45%, rgba(0,0,0,0.66) 100%)",
      chipColor: "default",
    },
    amber: {
      label: "Amber",
      bg: "#1a1406",
      text: "#fff7e0",
      mutedText: "rgba(255,247,224,0.78)",
      accent: "#ffb300",
      emptyCell: "rgba(255,247,224,0.12)",
      overlayGradient:
        "linear-gradient(180deg, rgba(0,0,0,0.58) 0%, rgba(0,0,0,0.38) 45%, rgba(0,0,0,0.66) 100%)",
      chipColor: "default",
    },
  };

  const [storyTheme, setStoryTheme] = useState<StoryTheme>("midnight");
  const [storyBackgroundImage, setStoryBackgroundImage] = useState<string | null>(
    null
  );

  const activeStoryTheme = STORY_THEMES[storyTheme];

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
  const MAX_SPORTS = 9;
  const displayedSports = sportTypes.slice(0, MAX_SPORTS);
  const hiddenCount = sportTypes.length - MAX_SPORTS;

  const handleExport = async () => {
    const targetRef =
      viewMode === "story" ? storyRef.current : exportRef.current;
    if (!targetRef) return;

    try {
      const canvas = await html2canvas(targetRef, {
        backgroundColor: theme.palette.background.default,
        scale: 2, // Higher quality
        useCORS: true,
      });

      const link = document.createElement("a");
      link.download = `recap-${year}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Export failed", err);
    }
  };

  const handleShare = async () => {
    const targetRef =
      viewMode === "story" ? storyRef.current : exportRef.current;
    if (!targetRef) return;

    try {
      const canvas = await html2canvas(targetRef, {
        backgroundColor: theme.palette.background.default,
        scale: 2,
        useCORS: true,
      });

      // Convert to DataURL first (synchronous)
      const dataUrl = canvas.toDataURL("image/png");

      // Convert DataURL to Blob synchronously to avoid async toBlob callback
      // which might cause "user activation" to expire on iOS
      const byteString = atob(dataUrl.split(",")[1]);
      const mimeString = dataUrl.split(",")[0].split(":")[1].split(";")[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });

      const file = new File([blob], `strava-heatmap-${year}.png`, {
        type: "image/png",
      });

      const shareData = {
        files: [file],
        title: `My sports year ${year}`,
        text: `Check out my activities in ${year}!`,
      };

      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare(shareData)
      ) {
        try {
          await navigator.share(shareData);
        } catch (err) {
          // Ignore AbortError (user cancelled share)
          if ((err as Error).name !== "AbortError") {
            console.error("Share failed", err);
            // Fallback to download using the ALREADY generated dataUrl
            const link = document.createElement("a");
            link.download = `recap-${year}.png`;
            link.href = dataUrl;
            link.click();
          }
        }
      } else {
        // Fallback to download
        const link = document.createElement("a");
        link.download = `recap-${year}.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch (err) {
      console.error("Share generation failed", err);
    }
  };

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
    if (dayActivities.length === 0)
      return viewMode === "story"
        ? activeStoryTheme.emptyCell
        : "rgba(255,255,255,0.05)";

    // Story view: theme-aware (accent) and readable on photo backgrounds
    if (viewMode === "story") {
      const count = dayActivities.length;

      // Paper: use black-ish heatmap for better contrast on light background
      if (storyTheme === "paper") {
        const alpha =
          count >= 4 ? 0.85 : count === 3 ? 0.65 : count === 2 ? 0.48 : 0.34;
        return `rgba(11, 15, 20, ${alpha})`;
      }

      // Convert hex accent (#rrggbb) to rgba so we can vary intensity.
      const hex = activeStoryTheme.accent?.trim();
      const isHex = typeof hex === "string" && /^#([0-9a-f]{6})$/i.test(hex);
      const r = isHex ? parseInt(hex!.slice(1, 3), 16) : 255;
      const g = isHex ? parseInt(hex!.slice(3, 5), 16) : 255;
      const b = isHex ? parseInt(hex!.slice(5, 7), 16) : 255;

      const alpha =
        count >= 4 ? 0.95 : count === 3 ? 0.8 : count === 2 ? 0.65 : 0.5;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    // Classic view
    const count = dayActivities.length;
    if (count >= 2) return theme.palette.primary.main;
    return theme.palette.primary.light;
  };

  const getTitle = () => {
    if (dateRange === "week") return "Weekly Overview";
    if (dateRange === "month") return "Monthly Overview";
    return "Yearly Activity Overview";
  };

  const buildTooltipTitle = (day: Date, dayActivities: Activity[]) => {
    if (dayActivities.length === 0) {
      return format(day, "d. MMMM yyyy", { locale: enUS });
    }

    return (
      <Box sx={{ textAlign: "center" }}>
        <Typography variant="body2" fontWeight="bold">
          {format(day, "d. MMMM yyyy", { locale: enUS })}
        </Typography>
        <Typography variant="caption">
          {dayActivities.length} activities
          <br />
          {formatDistance(
            dayActivities.reduce((acc, a) => acc + (a.distance || 0), 0)
          )}
        </Typography>
      </Box>
    );
  };

  const MonthLabel = ({
    label,
    sx,
  }: {
    label: string | null;
    sx?: Record<string, unknown>;
  }) => {
    if (!label) return null;
    return (
      <Typography
        variant="caption"
        sx={{
          fontWeight: "bold",
          color: "text.secondary",
          textTransform: "uppercase",
          fontFamily: "'Montserrat', sans-serif",
          ...sx,
        }}
      >
        {label}
      </Typography>
    );
  };

  const HeatmapCell = ({
    day,
    size,
    emptyColor,
    show,
    enableHover,
  }: {
    day: Date;
    size: number;
    emptyColor: string;
    show: boolean;
    enableHover: boolean;
  }) => {
    const dateStr = format(day, "yyyy-MM-dd");
    const dayActivities = activityMap.get(dateStr) || [];
    const hasActivity = dayActivities.length > 0;
    const isFuture = day > new Date();

    if (!show) return <Box sx={{ width: size, height: size }} />;

    const isStory = viewMode === "story";
    const hasImageBg = isStory && Boolean(storyBackgroundImage);

    const storyBorder = hasImageBg
      ? "1px solid rgba(255,255,255,0.34)"
      : storyTheme === "paper"
        ? "1px solid rgba(11,15,20,0.28)"
        : "1px solid rgba(255,255,255,0.22)";

    const storyShadow = hasImageBg
      ? "0 0 0 1px rgba(0,0,0,0.55), 0 2px 6px rgba(0,0,0,0.45)"
      : storyTheme === "paper"
        ? "0 0 0 1px rgba(255,255,255,0.55), 0 1px 3px rgba(0,0,0,0.18)"
        : "0 0 0 1px rgba(0,0,0,0.35), 0 1px 3px rgba(0,0,0,0.28)";

    // Slightly lift empty cells on Story so the grid is always visible
    const storyEmpty = hasImageBg
      ? "rgba(255,255,255,0.22)"
      : storyTheme === "paper"
        ? "rgba(11,15,20,0.14)"
        : "rgba(255,255,255,0.16)";

    return (
      <Tooltip key={dateStr} title={buildTooltipTitle(day, dayActivities)}>
        <Box
          sx={{
            width: size,
            height: size,
            bgcolor: hasActivity
              ? getIntensityColor(dayActivities)
              : isStory
                ? storyEmpty
                : emptyColor,
            borderRadius: isStory ? "999px" : 0.5,
            opacity: isFuture ? 0.3 : 1,
            cursor: hasActivity ? "pointer" : "default",
            transition: enableHover ? "all 0.2s" : undefined,

            border: isStory ? storyBorder : undefined,
            boxShadow: isStory ? storyShadow : undefined,

            "&:hover": enableHover
              ? {
                  transform: hasActivity ? "scale(1.2)" : "none",
                  zIndex: 1,
                  border: hasActivity ? "1px solid white" : "none",
                }
              : undefined,
          }}
          onClick={() => {
            if (hasActivity) {
              setSelectedDate(day);
              setDetailOpen(true);
            }
          }}
        />
      </Tooltip>
    );
  };

  const StatsPanel = ({
    variant,
  }: {
    variant: "mobile" | "desktop";
  }) => {
    const showTitle = variant === "desktop";

    const isStory = viewMode === "story";
    const isPaperStory = isStory && storyTheme === "paper";
    const storyHeadingColor = isPaperStory ? "#0b0f14" : activeStoryTheme.accent;
    const storyValueColor = isPaperStory ? "#0b0f14" : activeStoryTheme.text;

    if (variant === "mobile") {
      return (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          <Typography
            variant="h3"
            fontWeight="bold"
            sx={{
              fontFamily: "'Montserrat', sans-serif",
              color: isStory ? storyHeadingColor : undefined,
            }}
          >
            {year}
          </Typography>

          {visitedCountries.size > 0 && (
            <CountryFlags
              countries={visitedCountries}
              selectedCountry={null}
              onSelectCountry={() => {}}
              flagSize={15}
              tone={isPaperStory ? "light" : "dark"}
            />
          )}

          <Box>
            <Typography
              variant="body2"
              sx={{
                fontFamily: "'Montserrat', sans-serif",
                color: isStory ? activeStoryTheme.mutedText : undefined,
              }}
            >
              Total Distance:
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "4rem",
                lineHeight: 1,
                color: isStory ? storyValueColor : undefined,
              }}
            >
              {formatDistance(stats.distance)}
              <span
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "1rem",
                  marginLeft: "4px",
                }}
              >
                km
              </span>
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="body2"
              sx={{
                fontFamily: "'Montserrat', sans-serif",
                color: isStory ? activeStoryTheme.mutedText : undefined,
              }}
            >
              Total Time:
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontFamily: "'Bebas Neue', sans-serif",
                lineHeight: 1,
                fontSize: "4rem",
                color: isStory ? storyValueColor : undefined,
              }}
            >
              {formatDurationHoursOnly(stats.time)}
              <span
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "1rem",
                  marginLeft: "4px",
                }}
              >
                hrs
              </span>
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="body2"
              sx={{
                fontFamily: "'Montserrat', sans-serif",
                color: isStory ? activeStoryTheme.mutedText : undefined,
              }}
            >
              Number of Activities:
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontFamily: "'Bebas Neue', sans-serif",
                lineHeight: 1,
                fontSize: "4rem",
                color: isStory ? storyValueColor : undefined,
              }}
            >
              {stats.count}
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="body2"
              sx={{
                fontFamily: "'Montserrat', sans-serif",
                mb: 1,
                color: isStory ? activeStoryTheme.mutedText : undefined,
              }}
            >
              Activities:
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {displayedSports.map((type) => (
                <Chip
                  key={type}
                  label={getActivityLabel(type as SportType)}
                  size="small"
                  variant="outlined"
                  color={viewMode === "story" ? activeStoryTheme.chipColor : "primary"}
                  icon={getActivityIcon(type as SportType)}
                  sx={{
                    fontSize: "0.7rem",
                    borderColor:
                      viewMode === "story" ? activeStoryTheme.mutedText : undefined,
                    color: viewMode === "story" ? activeStoryTheme.text : undefined,
                    "& .MuiChip-icon": {
                      color: viewMode === "story" ? activeStoryTheme.text : undefined,
                    },
                  }}
                />
              ))}
              {hiddenCount > 0 && (
                <Chip
                  label={`+${hiddenCount} more`}
                  color={viewMode === "story" ? activeStoryTheme.chipColor : "primary"}
                  variant="outlined"
                  size="small"
                  sx={{
                    fontSize: "0.7rem",
                    opacity: 0.85,
                    borderColor:
                      viewMode === "story" ? activeStoryTheme.mutedText : undefined,
                    color: viewMode === "story" ? activeStoryTheme.text : undefined,
                  }}
                />
              )}
            </Box>
          </Box>
        </Box>
      );
    }

    return (
      <>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={{ xs: 2, sm: 3 }}
        >
          <Box>
            <Typography
              variant="h4"
              fontWeight="bold"
              color="primary"
              fontSize={"2.5rem"}
              sx={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              {year}
            </Typography>
            {showTitle && (
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                {getTitle()}
              </Typography>
            )}
          </Box>

          <Stack
            direction="row"
            spacing={{ xs: 2, sm: 3 }}
            width={{ xs: "100%", sm: "auto" }}
            justifyContent={{ xs: "space-between", sm: "flex-start" }}
          >
            <Box textAlign="center">
              <Typography
                variant="h4"
                fontWeight="bold"
                sx={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: "2.5rem",
                }}
              >
                {formatDistance(stats.distance)}
                <span
                  style={{
                    fontFamily: "'Montserrat'",
                    fontSize: "1rem",
                    fontWeight: "normal",
                    color: "#fff",
                    marginLeft: "0.3em",
                  }}
                >
                  km
                </span>
              </Typography>
              <Stack
                direction="row"
                spacing={0.5}
                alignItems="center"
                justifyContent="center"
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  Distance
                </Typography>
              </Stack>
            </Box>
            <Box textAlign="center">
              <Typography
                variant="h4"
                fontWeight="bold"
                sx={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: "2.5rem",
                }}
              >
                {formatDurationHoursOnly(stats.time)}
                <span
                  style={{
                    fontFamily: "'Montserrat'",
                    fontSize: "1rem",
                    fontWeight: "normal",
                    color: "#fff",
                    marginLeft: "0.3em",
                  }}
                >
                  hrs
                </span>
              </Typography>
              <Stack
                direction="row"
                spacing={0.5}
                alignItems="center"
                justifyContent="center"
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  Time
                </Typography>
              </Stack>
            </Box>
            <Box textAlign="center">
              <Typography
                variant="h4"
                fontWeight="bold"
                sx={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: "2.5rem",
                }}
              >
                {stats.count}
              </Typography>
              <Stack
                direction="row"
                spacing={0.5}
                alignItems="center"
                justifyContent="center"
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  Activities
                </Typography>
              </Stack>
            </Box>
          </Stack>
        </Stack>

        {visitedCountries.size > 0 && (
          <Box>
            <CountryFlags
              countries={visitedCountries}
              selectedCountry={null}
              onSelectCountry={() => {}}
              tone={isPaperStory ? "light" : "dark"}
            />
          </Box>
        )}
      </>
    );
  };

  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={1}
      >
        {!isMobile ? (
          <ToggleButtonGroup
            size="small"
            exclusive
            value={viewMode}
            onChange={(_, next) => {
              if (next) setViewMode(next);
            }}
            sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}
          >
            <ToggleButton value="classic">Classic</ToggleButton>
            <ToggleButton value="story">Story</ToggleButton>
          </ToggleButtonGroup>
        ) : (
          <Box />
        )}

        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <Button
            startIcon={<ShareIcon />}
            variant="outlined"
            size="small"
            onClick={handleShare}
          >
            Share
          </Button>
          <Button
            startIcon={<DownloadIcon />}
            variant="outlined"
            size="small"
            onClick={handleExport}
          >
            Download
          </Button>
        </Stack>
      </Stack>

      {viewMode === "story" ? (
        <>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            alignItems={{ xs: "stretch", sm: "center" }}
            justifyContent="space-between"
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              alignItems={{ xs: "stretch", sm: "center" }}
            >
              <ToggleButtonGroup
                size="small"
                exclusive
                value={storyTheme}
                onChange={(_, next) => {
                  if (next) setStoryTheme(next);
                }}
              >
                <ToggleButton value="midnight">Midnight</ToggleButton>
                <ToggleButton value="sunset">Sunset</ToggleButton>
                <ToggleButton value="forest">Forest</ToggleButton>
                <ToggleButton value="amber">Amber</ToggleButton>
                <ToggleButton value="paper">Paper</ToggleButton>
              </ToggleButtonGroup>

              <Stack direction="row" spacing={1} alignItems="center">
                <Button component="label" variant="outlined" size="small">
                  Upload background
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                      const inputEl = e.currentTarget;
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        setStoryBackgroundImage(
                          typeof reader.result === "string" ? reader.result : null
                        );
                      };
                      reader.readAsDataURL(file);
                      inputEl.value = "";
                    }}
                  />
                </Button>

                {storyBackgroundImage ? (
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => setStoryBackgroundImage(null)}
                  >
                    Clear
                  </Button>
                ) : null}
              </Stack>
            </Stack>

            <Divider sx={{ display: { xs: "block", sm: "none" } }} />
          </Stack>

          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Box
              sx={{
                width: "100%",
                maxWidth: 420,
                aspectRatio: "9 / 16",
                borderRadius: 3,
                overflow: "hidden",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              {/* Story Preview (export/share source) */}
              <Box
                ref={storyRef}
                sx={{
                  width: "100%",
                  height: "100%",
                  bgcolor: activeStoryTheme.bg,
                  color: activeStoryTheme.text,
                  backgroundImage: storyBackgroundImage
                    ? `url(${storyBackgroundImage})`
                    : "none",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  p: 4,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  fontFamily: "'Montserrat', sans-serif",
                  position: "relative",
                }}
              >
                {/* Darken uploaded image background for readability */}
                {storyBackgroundImage ? (
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      background: activeStoryTheme.overlayGradient,
                      zIndex: 0,
                      pointerEvents: "none",
                    }}
                  />
                ) : null}

                {/* ...existing story content... */}

                <Box
                  pt={4}
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    flex: 1,
                    width: "100%",
                    alignItems: "flex-start",
                    justifyContent: "center",
                    gap: 4,
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  <Box
                    sx={{
                      minWidth: 140,
                      pl: 0,
                      pt:0,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px",
                        width: "100%",
                        alignItems: "center",
                      }}
                    >
                      {weeks.map((week, i) => {
                        const firstDayOfWeek = week[0];
                        const isFirstWeekOfMonth = firstDayOfWeek.getDate() <= 7;
                        const showMonthLabel =
                          isFirstWeekOfMonth ||
                          (i === 0 &&
                            dateRange !== "year" &&
                            dateRange !== "lastYear");

                        const monthLabel = showMonthLabel
                          ? format(firstDayOfWeek, "MMM", { locale: enUS })
                          : null;

                        return (
                          <Box
                            key={i}
                            sx={{
                              display: "grid",
                              gridTemplateColumns: "18px repeat(7, 9px)",
                              gap: "1px",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-end",
                                pr: 0.25,
                              }}
                            >
                              {monthLabel ? (
                                <MonthLabel
                                  label={monthLabel}
                                  sx={{
                                    fontSize: "0.35rem",
                                    color: activeStoryTheme.mutedText,
                                  }}
                                />
                              ) : null}
                            </Box>

                            {week.map((day) => {
                              const isCurrentYear = day.getFullYear() === year;
                              const shouldShow =
                                dateRange === "year" || dateRange === "lastYear"
                                  ? isCurrentYear
                                  : true;

                              return (
                                <HeatmapCell
                                  key={format(day, "yyyy-MM-dd")}
                                  day={day}
                                  size={9}
                                  emptyColor={activeStoryTheme.emptyCell}
                                  show={shouldShow}
                                  enableHover={false}
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
                      pl: 0,
                    }}
                  >
                    <StatsPanel variant="mobile" />
                  </Box>
                </Box>

                <Box
                  sx={{
                    width: "100%",
                    textAlign: "center",
                    pb: 4,
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Box
                      component="img"
                      src={logoFull}
                      alt="justDoRecap logo"
                      sx={{ height: 26, width: "auto" }}
                    />
                    <Typography
                      variant="body1"
                      sx={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 800,
                        fontStyle: "italic",
                        letterSpacing: 0.5,
                        color: activeStoryTheme.mutedText,
                      }}
                    >
                      justDoRecap.com
                    </Typography>
                  </Stack>
                </Box>
              </Box>
            </Box>
          </Box>
        </>
      ) : null}

      {viewMode === "classic" ? (
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
            <>
              <StatsPanel variant={isMobile ? "mobile" : "desktop"} />

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
                          sx={{
                            width: 14,
                            flexShrink: 0,
                            position: "relative",
                          }}
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
                                fontFamily: "'Montserrat', sans-serif",
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
                          const isCurrentYear = day.getFullYear() === year;
                          const shouldShow =
                            dateRange === "year" || dateRange === "lastYear"
                              ? isCurrentYear
                              : true;

                          return (
                            <HeatmapCell
                              key={format(day, "yyyy-MM-dd")}
                              day={day}
                              size={12}
                              emptyColor="rgba(255,255,255,0.05)"
                              show={shouldShow}
                              enableHover={!isMobile}
                            />
                          );
                        })}
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            </>
          </Stack>
        </Card>
      ) : null}

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
  </Stack>
  );
}
