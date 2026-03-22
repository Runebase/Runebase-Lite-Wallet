
import { createTheme } from '@mui/material/styles';

const px = (value: number): string => value.toString().concat('px');

/* Colors */
const colorWhite = '#FFFFFF';
const colorGray = '#747474';
const colorOrange = '#F5A623';
const colorRed = '#D0021B';
const colorGold = '#FFD700';

const primaryColor = '#5539DF';
const primaryColorDark = '#3D28A8';
const primaryColorLight = '#8E6BF1';

/* Padding */
const spacingMultiplier = 4;
const spacingHalfUnit = px(spacingMultiplier * 0.5); // 2
const spacingUnit = px(spacingMultiplier * 1); // 4
const spacingXs = px(spacingMultiplier * 2); // 8
const spacingSm = px(spacingMultiplier * 3); // 12
const spacingMd = px(spacingMultiplier * 4); // 16
const spacingLg = px(spacingMultiplier * 5); // 20
const spacingXl = px(spacingMultiplier * 6); // 24

/* Fonts */
const fontMontserrat = 'Montserrat, sans-serif';
const fontSizeXs = px(10);
const fontSizeSm = px(12);
const fontSizeMd = px(14);
const fontSizeLg = px(16);
const fontSizeXl = px(18);

const fontWeightBold = 'bold';

const lineHeightXs = px(12);
const lineHeightSm = px(16);
const lineHeightMd = px(20);
const lineHeightLg = px(24);
const lineHeightXl = px(32);

/* Border */
const borderRadius = px(4);

/* Icons */
const iconSize = px(24);

/* Button */
const buttonRadiusSm = px(16);
const buttonRadiusLg = px(24);

const buttonHeightSm = px(32);
const buttonHeightLg = px(48);

/* Shared component overrides */
const getComponentOverrides = () => ({
  MuiPaper: {
    styleOverrides: {
      root: {
        transition: 'background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease',
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        transition: 'background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease',
      },
    },
  },
  MuiCardContent: {
    styleOverrides: {
      root: {
        padding: '12px',
        '&:last-child': {
          paddingBottom: '12px',
        },
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        padding: spacingXs,
        fontWeight: fontWeightBold,
        borderRadius: buttonRadiusSm,
        minHeight: 44, // Ensure touch-friendly tap targets on mobile
      },
    },
  },
  MuiInput: {
    styleOverrides: {
      root: {
        fontFamily: fontMontserrat,
        fontSize: fontSizeMd,
      },
    },
  },
  MuiSelect: {
    defaultProps: {
      variant: 'outlined' as const,
    },
    styleOverrides: {
      select: {
        padding: `${spacingSm} ${spacingMd}`,
        display: 'flex',
        alignItems: 'center',
        minHeight: '1.4375em', // Match default MUI line height
      },
    },
  },
  MuiFormControl: {
    styleOverrides: {
      root: {
        // Let Stack spacing handle vertical rhythm instead of per-control margins
        marginBottom: 0,
      },
    },
  },
  MuiTab: {
    styleOverrides: {
      root: {
        padding: 0,
        fontFamily: fontMontserrat,
        fontSize: fontSizeSm,
        fontWeight: fontWeightBold,
        minHeight: 44, // Touch-friendly tab targets
      },
    },
  },
  MuiSkeleton: {
    styleOverrides: {
      root: {
        borderRadius: borderRadius,
      },
    },
  },
  MuiListItemButton: {
    styleOverrides: {
      root: {
        minHeight: 44, // Touch-friendly list item targets
      },
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: {
        minWidth: 44, // Touch-friendly icon button targets
        minHeight: 44,
      },
    },
  },
  MuiMenuItem: {
    styleOverrides: {
      root: {
        minHeight: 44, // Touch-friendly menu item targets
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        minHeight: 32,
      },
    },
  },
});

/* Shared custom properties */
const customProperties = {
  color: {
    gray: colorGray,
    orange: colorOrange,
    red: colorRed,
    gold: colorGold,
    gradientPurple: `linear-gradient(300.29deg, ${primaryColorLight} -9.7%, ${primaryColor} 85.28%)`,
  },
  padding: {
    halfUnit: spacingHalfUnit,
    unit: spacingUnit,
    xs: spacingXs,
    sm: spacingSm,
    md: spacingMd,
    lg: spacingLg,
    xl: spacingXl,
    custom: (multiplier: number) => px(spacingMultiplier * multiplier),
  },
  font: {
    xs: fontSizeXs,
    sm: fontSizeSm,
    md: fontSizeMd,
    lg: fontSizeLg,
    xl: fontSizeXl,
  },
  fontWeight: {
    bold: fontWeightBold,
  },
  lineHeight: {
    xs: lineHeightXs,
    sm: lineHeightSm,
    md: lineHeightMd,
    lg: lineHeightLg,
    xl: lineHeightXl,
  },
  border: {
    root: '',
    radius: borderRadius,
  },
  icon: {
    size: iconSize,
  },
  button: {
    sm: {
      height: buttonHeightSm,
      radius: buttonRadiusSm,
    },
    lg: {
      height: buttonHeightLg,
      radius: buttonRadiusLg,
    },
  },
};

/* Light theme */
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      light: primaryColorLight,
      main: primaryColor,
      dark: primaryColorDark,
      contrastText: colorWhite,
    },
    secondary: {
      light: '#E8E8EE',
      main: '#B0B0BE',
      dark: '#8A8A9A',
      contrastText: '#1A1A2E',
    },
    success: { main: '#4caf50' },
    warning: { main: '#ff9800' },
    error: { main: '#f44336' },
    info: { main: '#2196f3' },
    background: {
      default: colorWhite,
      paper: '#f7f7f7',
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.8)',
      secondary: 'rgba(0, 0, 0, 0.5)',
    },
    divider: '#CCCCCC',
  },
  typography: {
    fontFamily: fontMontserrat,
    fontSize: 14,
  },
  components: getComponentOverrides(),
  ...customProperties,
  border: {
    root: `#CCCCCC solid ${px(1)}`,
    radius: borderRadius,
  },
});

/* Dark theme */
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      light: primaryColorLight,
      main: '#7C5CFC',
      dark: primaryColor,
      contrastText: colorWhite,
    },
    secondary: {
      light: '#9E9EAE',
      main: '#6E6E7E',
      dark: '#4E4E5E',
      contrastText: '#FFFFFF',
    },
    success: { main: '#66bb6a' },
    warning: { main: '#ffa726' },
    error: { main: '#ef5350' },
    info: { main: '#42a5f5' },
    background: {
      default: '#121214',
      paper: '#1E1E22',
    },
    text: {
      primary: 'rgba(255, 255, 255, 0.9)',
      secondary: 'rgba(255, 255, 255, 0.72)',
    },
    divider: '#333338',
  },
  typography: {
    fontFamily: fontMontserrat,
    fontSize: 14,
  },
  components: getComponentOverrides(),
  ...customProperties,
  border: {
    root: `#333338 solid ${px(1)}`,
    radius: borderRadius,
  },
});

// Default export for backward compatibility
const theme = lightTheme;
export default theme;
