import { createTheme, responsiveFontSizes } from "@material-ui/core/styles";
import fonts from "./fonts";
import commonSettings from "./global.js";
import navBg from "../assets/images/exod-sidebar.jpg";

// TODO: Break repeated use color values out into list of consts declared here
// then set the values in darkTheme using the global color variables
//green rgb(70,171,21)
//dark green rgb(91,196,34)
export const darkTheme = {
  color: "#FCFCFC",
  gold: "#46ab15", // Light green
  goldDimmed: "#376e1d",
  goldBright: "#6dd63a",
  gray: "#A3A3A3",
  textHighlightColor: "#5bc422",
  backgroundColor: "#131313",
  paperBg: "#1F1F1F",
  paperBorder: "#323232",
  modalBg: "#24242699",
  popoverBg: "rgba(54, 56, 64, 0.99)",
  menuBg: "#080c00",
  backdropBg: "rgba(3, 10, 0, 0.5)",
  largeTextColor: "#F4D092",
  activeLinkColor: "#F5DDB4",
  activeLinkSvgColor:
    "brightness(0) saturate(100%) invert(84%) sepia(49%) saturate(307%) hue-rotate(326deg) brightness(106%) contrast(92%)",
  primaryButtonColor: "#f9f9f9",
  primaryButtonBG: "#F4D092",
  primaryButtonHoverBG: "#379414", //gold became dark green
  secondaryButtonHoverBG: "rgba(54, 56, 64, 1)",
  outlinedPrimaryButtonHoverBG: "#379414", //gold became dark green
  outlinedPrimaryButtonHoverColor: "#333333",
  outlinedSecondaryButtonHoverBG: "transparent",
  outlinedSecondaryButtonHoverColor: "#379414", //gold became dark green
  containedSecondaryButtonHoverBG: "rgba(255, 255, 255, 0.15)",
  graphStrokeColor: "rgba(255, 255, 255, .1)",
  sidebarBackground: `linear-gradient(0deg, rgba(31,31,31,1) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,0) 100%), url(${navBg})`,
  chartColors: ["#46ab15", "#ebc342", "#fe868c", "#598fb5", "#775bb5", "#42bd8c", "#db3737", "#888888"],
  treasuryColors: {
    EXOD: "#46ab15",
    wsEXOD: "#6dd63a",
    DAI: "#ebc342",
    "DAI-EXOD": "#888888",
    miMATIC: "#fe868c",
    WFTM: "#598fb5",
    gOHM: "#775bb5",
    BEETS: "#db3737",
    fBEETS: "#42bd8c",
    SOLID: "#02E3D9",
    ROCK: "#02E3D9",
    veSOLID: "#02E3D9",
    veROCK: "#02E3D9",
    BRUSH: "#DED0DC",
    SCREAM: "#FFB8D2",
    TAROT: "#AFAFAF",
    xTAROT: "#AFAFAF",
    USDC: "#2775C9",
    BTC: "#F7931A",
    ETH: "#636990",
    BOO: "#6665DD",
    xBOO: "#6665DD",
    SPIRIT: "#52CE84",
    inSPIRIT: "#52CE84",
    xLQDR: "#61ABC8",
    LQDR: "#61ABC8",
    IB: "#2CAA40",
    IRON: "#2CAA40",
    YFI: "#0262C3",
    "The Monolith": "#46ab15",
    DEFAULT: "#0f0f0f",
  },
  trendUp: "#43e055",
  trendDown: "#ed3939",
  mainBackground:
    "linear-gradient(180deg, rgba(8, 35, 23, 0), rgba(10, 13, 10, 0.9)), " +
    "linear-gradient(333deg, rgba(13, 27, 15, 0.2), rgba(18, 25, 17, 0.08)), " +
    "radial-gradient(circle at 77% 89%, rgba(15, 25, 15, 0.8), rgba(15, 23, 19, 0) 50%), " +
    "radial-gradient(circle at 15% 95%, rgba(15, 23, 15, 0.8), rgba(15, 23, 19, 0) 43%), " +
    "radial-gradient(circle at 65% 23%, rgba(20, 42, 19, 0.4), rgba(23, 32, 21, 0) 70%), " +
    "radial-gradient(circle at 10% 0%, rgba(12, 33, 12, 0.33), rgba(17, 21, 14, 0) 35%), " +
    "radial-gradient(circle at 11% 100%, rgba(11, 25, 23, 0.3), rgba(11, 35, 23, 0) 30%)",
};

export const dark = responsiveFontSizes(
  createTheme(
    {
      primary: {
        main: darkTheme.color,
      },
      palette: {
        type: "dark",
        background: {
          default: darkTheme.backgroundColor,
          paper: darkTheme.paperBg,
          mainBackground: darkTheme.mainBackground,
        },
        contrastText: darkTheme.color,
        primary: {
          main: darkTheme.color,
        },
        neutral: {
          main: darkTheme.color,
          secondary: darkTheme.gray,
        },
        text: {
          primary: darkTheme.color,
          secondary: darkTheme.gray,
        },
        border: {
          primary: darkTheme.paperBorder,
        },
        primaryColor: darkTheme.gold,
        primaryColorDimmed: darkTheme.goldDimmed,
        primaryColorBright: darkTheme.goldBright,
        primaryButtonColor: darkTheme.primaryButtonColor,
        chartColors: darkTheme.chartColors,
        treasuryColors: darkTheme.treasuryColors,
        trendUp: darkTheme.trendUp,
        trendDown: darkTheme.trendDown,
        graphStrokeColor: darkTheme.graphStrokeColor,
      },
      typography: {
        fontFamily: "Square",
      },
      props: {
        MuiSvgIcon: {
          color: darkTheme.color,
        },
      },
      overrides: {
        MuiCssBaseline: {
          "@global": {
            "@font-face": fonts,
            body: {
              background: darkTheme.background,
            },
          },
        },
        MuiDrawer: {
          paper: {
            backgroundColor: darkTheme.paperBg,
            zIndex: 7,
          },
        },
        MuiPaper: {
          root: {
            backgroundColor: darkTheme.paperBg,
            "&.ohm-card": {
              backgroundColor: `${darkTheme.paperBg}AA`,
              border: "1px solid " + darkTheme.paperBorder,
            },
            "&.ohm-modal": {
              backgroundColor: darkTheme.modalBg,
            },
            "&.ohm-menu": {
              backgroundColor: darkTheme.menuBg,
              backdropFilter: "blur(33px)",
            },
            "&.ohm-popover": {
              color: darkTheme.color,
              backdropFilter: "blur(15px)",
            },
            "&.tooltip-container": {
              backgroundColor: `${darkTheme.paperBg}DD`,
            },
          },
        },
        MuiTooltip: {
          tooltip: {
            fontSize: "1.1em",
          },
        },
        MuiBackdrop: {
          root: {
            backgroundColor: darkTheme.backdropBg,
          },
        },
        MuiLink: {
          root: {
            color: darkTheme.color,
            "&:hover": {
              color: darkTheme.textHighlightColor,
              textDecoration: "none",
              "&.active": {
                color: darkTheme.color,
              },
            },
            "&.active": {
              color: darkTheme.color,
              textDecoration: "underline",
            },
          },
        },
        MuiTableCell: {
          root: {
            color: darkTheme.color,
          },
        },
        MuiInputBase: {
          root: {
            // color: darkTheme.gold,
          },
        },

        MuiOutlinedInput: {
          root: {
            "&:hover $notchedOutline": {
              borderColor: darkTheme.goldDimmed,
            },
            "&$focused $notchedOutline": {
              borderColor: darkTheme.gold,
            },
          },
        },
        MuiTab: {
          textColorPrimary: {
            color: darkTheme.gray,
            "&$selected": {
              color: darkTheme.gold,
            },
          },
        },
        PrivateTabIndicator: {
          colorPrimary: {
            backgroundColor: darkTheme.gold,
          },
        },
        MuiToggleButton: {
          root: {
            backgroundColor: darkTheme.paperBg,
            "&:hover": {
              color: darkTheme.color,
              backgroundColor: `${darkTheme.containedSecondaryButtonHoverBG} !important`,
            },
            selected: {
              backgroundColor: darkTheme.containedSecondaryButtonHoverBG,
            },
            "@media (hover:none)": {
              "&:hover": {
                color: darkTheme.color,
                backgroundColor: darkTheme.paperBg,
              },
              "&:focus": {
                color: darkTheme.color,
                backgroundColor: darkTheme.paperBg,
                borderColor: "transparent",
                outline: "#00000000",
              },
            },
          },
        },
        MuiButton: {
          root: {
            "&$disabled": {
              boxShadow: "none",
            },
          },
          containedPrimary: {
            color: darkTheme.primaryButtonColor,
            backgroundColor: darkTheme.gold,
            boxShadow: `0px 0px 10px 5px rgba(70,171,21,0.3)`,
            "@media (hover:none)": {
              color: darkTheme.primaryButtonColor,
              backgroundColor: darkTheme.gold,
            },
            "&:hover": {
              backgroundColor: darkTheme.primaryButtonHoverBG,
              color: darkTheme.primaryButtonHoverColor,
              boxShadow: `0px 0px 5px 3px rgba(70,171,21,0.3)`,
              "@media (hover:none)": {
                backgroundColor: `${darkTheme.primaryButtonHoverBG} !important`,
              },
            },
            "&:active": {
              backgroundColor: darkTheme.primaryButtonHoverBG,
              color: darkTheme.primaryButtonHoverColor,
            },
          },
          containedSecondary: {
            backgroundColor: darkTheme.paperBg,
            color: darkTheme.color,
            "&:hover": {
              backgroundColor: `${darkTheme.containedSecondaryButtonHoverBG} !important`,
            },
            "&:active": {
              backgroundColor: darkTheme.containedSecondaryButtonHoverBG,
            },
            "&:focus": {
              backgroundColor: darkTheme.paperBg,
            },
            "@media (hover:none)": {
              color: darkTheme.color,
              backgroundColor: darkTheme.paperBg,
              "&:hover": {
                backgroundColor: `${darkTheme.containedSecondaryButtonHoverBG} !important`,
              },
            },
          },
          outlinedPrimary: {
            color: darkTheme.gold,
            borderColor: darkTheme.gold,
            "&:hover": {
              color: darkTheme.outlinedPrimaryButtonHoverColor,
              backgroundColor: darkTheme.primaryButtonHoverBG,
            },
            "@media (hover:none)": {
              color: darkTheme.gold,
              borderColor: darkTheme.gold,
              "&:hover": {
                color: darkTheme.outlinedPrimaryButtonHoverColor,
                backgroundColor: `${darkTheme.primaryButtonHoverBG} !important`,
                textDecoration: "none !important",
              },
            },
          },
          outlinedSecondary: {
            color: darkTheme.color,
            borderColor: darkTheme.color,
            "&:hover": {
              color: darkTheme.outlinedSecondaryButtonHoverColor,
              backgroundColor: darkTheme.outlinedSecondaryButtonHoverBG,
              borderColor: darkTheme.gold,
            },
          },
          textPrimary: {
            color: "#A3A3A3",
            "&:hover": {
              color: darkTheme.gold,
              backgroundColor: "#00000000",
            },
            "&:active": {
              color: darkTheme.gold,
              borderBottom: "#F8CC82",
            },
          },
          textSecondary: {
            color: darkTheme.color,
            "&:hover": {
              color: darkTheme.textHighlightColor,
            },
          },
          disabled: {
            boxShadow: "none",
          },
        },
        MuiRadio: {
          colorPrimary: {
            color: darkTheme.color,
            "&$checked": {
              color: darkTheme.gold,
            },
            "&:hover": {
              color: darkTheme.gold,
            },
          },
        },
        MuiSelect: {
          selectMenu: {
            color: darkTheme.gold,
          },
        },
        MuiSlider: {
          thumb: {
            border: `2px solid ${darkTheme.gold}`,
            color: darkTheme.paperBg,
            boxShadow: `0px 0px 10px ${darkTheme.gold}`,
            height: 18,
            width: 18,
          },
          track: {
            background: `linear-gradient(90deg,${darkTheme.goldBright},${darkTheme.gold} 90%)`,
            boxShadow: `0px 0px 10px ${darkTheme.gold}`,
            height: 8,
            borderRadius: 7,
          },
          rail: {
            border: `2px solid ${darkTheme.gold}`,
            color: darkTheme.paperBg,
            height: 5,
            borderRadius: 7,
          },
        },
      },
    },
    commonSettings,
  ),
);
