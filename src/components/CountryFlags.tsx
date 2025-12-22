import { Chip, Stack, Box } from "@mui/material";

export function CountryFlags({
  countries,
  selectedCountry,
  onSelectCountry,
}: {
  countries: Set<string>;
  selectedCountry: string | null;
  onSelectCountry: (country: string | null) => void;
}) {
  if (countries.size === 0) return null;

  return (
    <Stack
      direction="row"
      spacing={1}
      flexWrap="wrap"
      useFlexGap
      sx={{ py: 1 }}
    >
      {Array.from(countries)
        .sort()
        .map((code) => {
          const isSelected = selectedCountry === code;
          return (
            <Chip
              key={code}
              label={code}
              icon={
                <Box
                  component="img"
                  src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`}
                  srcSet={`https://flagcdn.com/w80/${code.toLowerCase()}.png 2x`}
                  alt={code}
                  sx={{
                    width: 20,
                    height: 15,
                    borderRadius: "2px",
                    objectFit: "cover",
                  }}
                />
              }
              variant={isSelected ? "filled" : "outlined"}
              color={isSelected ? "primary" : "default"}
              onClick={() => onSelectCountry(isSelected ? null : code)}
              size="small"
              sx={{
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
