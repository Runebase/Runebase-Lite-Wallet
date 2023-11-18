/* eslint-disable no-unused-vars */
import { createTheme } from '@mui/material/styles';

const px = (value: number): string => value.toString().concat('px');

/* Colors */
const colorWhite = '#FFFFFF';
const colorGray = '#747474';
const colorOrange = '#F5A623';
const colorRed = '#D0021B';

const primaryColor = '#5539DF';
const primaryColorDark = '#5539DF';
const primaryColorLight = '#8E6BF1';

const secondaryColor = colorWhite;
const secondaryColorLight = colorWhite;
const secondaryColorDark = colorWhite;

const textColorPrimary = 'rgba(0, 0, 0, 0.8)';
const textColorSecondary = 'rgba(0, 0, 0, 0.5)';

const gradientPurple = `linear-gradient(300.29deg, ${primaryColorLight} -9.7%, ${primaryColor} 85.28%)`;

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
const borderColor = '#CCCCCC';
const borderSize = px(1);
const borderRadius = px(4);

/* Icons */
const iconSize = px(24);

/* Button */
const buttonRadiusSm = px(16);
const buttonRadiusLg = px(24);

const buttonHeightSm = px(32);
const buttonHeightLg = px(48);

const theme = createTheme({
  /* Material color overrides */
  palette: {
    primary: {
      light: primaryColorLight,
      main: primaryColor,
      dark: primaryColorDark,
      contrastText: colorWhite,
    },
    secondary: {
      light: secondaryColorLight,
      main: secondaryColor,
      dark: secondaryColorDark,
      contrastText: primaryColor,
    },
    background: {
      default: colorWhite,
    },
    text: {
      primary: textColorPrimary,
      secondary: textColorSecondary,
      hint: textColorSecondary,
    },
    divider: borderColor,
  },

  /* Material font overrides */
  typography: {
    fontFamily: fontMontserrat,
    fontSize: 14,
  },

  /* Material component overrides */
  overrides: {
    MuiCardContent: {
      root: {
        padding: '0px !important',
      },
    },
    MuiButton: {
      root: {
        padding: spacingXs,
        fontWeight: fontWeightBold,
        borderRadius: buttonRadiusSm,
      },
    },
    MuiInput: {
      root: {
        fontFamily: fontMontserrat,
        fontSize: fontSizeMd,
      },
    },
    MuiSelect: {
      select: {
        padding: 0,
      },
    },
    MuiTab: {
      root: {
        padding: 0,
      },
      label: {
        fontFamily: fontMontserrat,
        fontSize: fontSizeSm,
        fontWeight: fontWeightBold,
      },
    },
  },

  /* User-defined variables */
  color: {
    gray: colorGray,
    orange: colorOrange,
    red: colorRed,
    gradientPurple,
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
    root: `${borderColor} solid ${borderSize}`,
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
} as any);

export default theme;
