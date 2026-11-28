import {createTheme} from '@mui/material/styles';

export const PALETA = {
  // Paleta principal solicitada
  punchRed: '#e63946',
  honeydew: '#f1faee',
  frostedBlue: '#a8dadc',
  cerulean: '#457b9d',
  oxfordNavy: '#1d3557',

  // Variantes tonales y de contraste WCAG AA (>= 4.5:1)
  oxfordNavyDark: '#13243B',
  ceruleanDark: '#2E5B78',
  frostedBlueHover: '#92CED1',
  honeydewSoft: '#F6FCF4',
  punchRedAccessible: '#B81D2A',
  punchRedDark: '#941621',
  punchRedTint: '#FEF2F3',
  punchRedBorder: '#F2B5BA',
  border: '#C9D9DC',
  divider: '#E1ECE9',
  ink: '#1d3557',
  inkMuted: '#415A77',
  paper: '#FFFFFF',
} as const;

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: PALETA.oxfordNavy,
      dark: PALETA.oxfordNavyDark,
      light: PALETA.cerulean,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: PALETA.frostedBlue,
      dark: PALETA.frostedBlueHover,
      light: '#CBEAEC',
      contrastText: PALETA.oxfordNavy,
    },
    info: {
      main: PALETA.cerulean,
      dark: PALETA.ceruleanDark,
      light: PALETA.frostedBlue,
      contrastText: '#FFFFFF',
    },
    success: {
      main: PALETA.ceruleanDark,
      light: PALETA.cerulean,
      dark: PALETA.oxfordNavy,
      contrastText: '#FFFFFF',
    },
    error: {
      main: PALETA.punchRedAccessible,
      dark: PALETA.punchRedDark,
      light: PALETA.punchRed,
      contrastText: '#FFFFFF',
    },
    background: {
      default: PALETA.honeydew,
      paper: PALETA.paper,
    },
    text: {
      primary: PALETA.ink,
      secondary: PALETA.inkMuted,
    },
    divider: PALETA.divider,
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", sans-serif',
    h1: {
      fontFamily: '"Bricolage Grotesque", sans-serif',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      color: PALETA.ink,
    },
    h2: {
      fontFamily: '"Bricolage Grotesque", sans-serif',
      fontWeight: 600,
      letterSpacing: '-0.015em',
      color: PALETA.ink,
    },
    h3: {
      fontFamily: '"Bricolage Grotesque", sans-serif',
      fontWeight: 600,
      color: PALETA.ink,
    },
    button: {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          backgroundColor: PALETA.honeydew,
          color: PALETA.ink,
          scrollPaddingTop: '84px',
        },
        body: {
          backgroundColor: PALETA.honeydew,
          color: PALETA.ink,
          minHeight: '100vh',
        },
      },
    },
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          minHeight: 44,
          borderRadius: 8,
          paddingInline: 18,
          transition:
            'background-color 150ms cubic-bezier(0.16, 1, 0.3, 1), border-color 150ms cubic-bezier(0.16, 1, 0.3, 1), transform 150ms cubic-bezier(0.16, 1, 0.3, 1)',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: PALETA.paper,
          borderRadius: 8,
          minHeight: 44,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: PALETA.border,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: PALETA.cerulean,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: PALETA.oxfordNavy,
            borderWidth: 2,
          },
          '&.Mui-error .MuiOutlinedInput-notchedOutline': {
            borderColor: PALETA.punchRed,
          },
        },
        input: {
          paddingTop: 10.5,
          paddingBottom: 10.5,
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: PALETA.inkMuted,
          fontWeight: 600,
          '&.Mui-focused': {
            color: PALETA.oxfordNavy,
          },
          '&.Mui-error': {
            color: PALETA.punchRedAccessible,
          },
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          marginLeft: 2,
          marginTop: 5,
          fontSize: '0.75rem',
          color: PALETA.inkMuted,
          '&.Mui-error': {
            color: PALETA.punchRedAccessible,
            fontWeight: 500,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottomColor: PALETA.divider,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: 52,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
});
