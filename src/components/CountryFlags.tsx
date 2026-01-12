import { Box, Chip, Stack } from "@mui/material";

export type CountryFlagsTone = "dark" | "light";

export interface CountryFlagsProps {
  countries: Set<string>;
  selectedCountry: string | null;
  onSelectCountry: (country: string | null) => void;
  flagSize?: number;
  tone?: CountryFlagsTone;
}

export function CountryFlags({
  countries,
  selectedCountry,
  onSelectCountry,
  flagSize = 20,
  tone = "dark",
}: CountryFlagsProps) {
  const allCountries = Array.from(countries);
  if (allCountries.length === 0) return null;

  const isLight = tone === "light";
  const baseBg = isLight ? "rgba(11,15,20,0.04)" : "rgba(255,255,255,0.05)";
  const hoverBg = isLight ? "rgba(11,15,20,0.08)" : "rgba(255,255,255,0.10)";
  const borderColor = isLight ? "rgba(11,15,20,0.18)" : "rgba(255,255,255,0.10)";
  const textColor = isLight ? "#0b0f14" : "#ffffff";

  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ py: 1 }}>
      {allCountries
        .sort()
        .map((code) => {
          const trimmed = (code ?? "").trim();
          const isValidIso = /^[A-Z]{2,3}$/i.test(trimmed);
          const label = isValidIso ? trimmed : "Unknown";
          const isSelected = selectedCountry === code;

          return (
            <Chip
              key={code}
              label={label}
              icon={
                isValidIso ? (
                  <Box
                    component="img"
                    src={`https://flagcdn.com/w40/${trimmed.toLowerCase()}.png`}
                    srcSet={`https://flagcdn.com/w80/${trimmed.toLowerCase()}.png 2x`}
                    alt={trimmed}
                    sx={{
                      width: flagSize,
                      height: Math.round(flagSize * 0.75),
                      borderRadius: "2px",
                      objectFit: "cover",
                    }}
                  />
                ) : undefined
              }
              variant={isSelected ? "filled" : "outlined"}
              color={isSelected ? "primary" : "default"}
              onClick={() => onSelectCountry(isSelected ? null : code)}
              size="small"
              sx={{
                px: 0.25,
                height: flagSize + 4,
                fontSize: Math.max(9, Math.round(flagSize * 0.45)),
                bgcolor: isSelected ? undefined : baseBg,
                borderColor,
                color: isSelected ? undefined : textColor,
                fontFamily: "monospace",
                "& .MuiChip-label": {
                  px: 0.25,
                  color: isSelected ? undefined : textColor,
                },
                "& .MuiChip-icon": {
                  ml: 0.25,
                  mr: 0,
                },
                "&:hover": {
                  bgcolor: isSelected ? undefined : hoverBg,
                },
              }}
            />
          );
        })}
    </Stack>
  );
}