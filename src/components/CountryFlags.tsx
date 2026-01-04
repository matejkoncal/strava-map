import { Chip, Stack, Box } from "@mui/material";

export function CountryFlags({
  countries,
  selectedCountry,
  onSelectCountry,
  flagSize = 20,
}: {
  countries: Set<string>;
  selectedCountry: string | null;
  onSelectCountry: (country: string | null) => void;
  flagSize?: number;
}) {
  const allCountries = Array.from(countries);

  if (allCountries.length === 0) return null;

  return (
    <Stack
      direction="row"
      spacing={1}
      flexWrap="wrap"
      useFlexGap
      sx={{ py: 1 }}
    >
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
                px: 1,
                height: flagSize + 12,
                fontSize: flagSize * 0.6,
                bgcolor: isSelected ? undefined : "rgba(255,255,255,0.05)",
                borderColor: "rgba(255,255,255,0.1)",
                fontFamily: "monospace",
                "&:hover": {
                  bgcolor: isSelected ? undefined : "rgba(255,255,255,0.1)",
                },
              }}
            />
          );
        })}
    </Stack>
  );
}
