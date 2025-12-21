import { Chip, Stack } from "@mui/material";
import { CalendarMonth as CalendarIcon } from "@mui/icons-material";

export type DateRange = "all" | "week" | "month" | "year";

interface DateFilterProps {
  selectedRange: DateRange;
  onSelectRange: (range: DateRange) => void;
}

export function DateFilter({ selectedRange, onSelectRange }: DateFilterProps) {
  const ranges: { value: DateRange; label: string }[] = [
    { value: "all", label: "All" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "year", label: "This Year" },
  ];

  return (
    <Stack direction="row" spacing={1} alignItems="center" overflow="auto">
      <CalendarIcon color="action" fontSize="small" />
      {ranges.map((range) => (
        <Chip
          key={range.value}
          label={range.label}
          onClick={() => onSelectRange(range.value)}
          color={selectedRange === range.value ? "secondary" : "default"}
          variant={selectedRange === range.value ? "filled" : "outlined"}
          size="small"
          clickable
        />
      ))}
    </Stack>
  );
}
