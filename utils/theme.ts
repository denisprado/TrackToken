// Tokens Primitivos
const primitiveTokens = {
  colors: {
    black: "#000000",
    white: "#FFFFFF",
    gray: {
      100: "#F8F9FA",
      200: "#E9ECEF",
      300: "#DEE2E6",
      400: "#CED4DA",
      500: "#ADB5BD",
      600: "#6C757D",
      700: "#495057",
      800: "#343A40",
      900: "#212529",
    },
    blue: {
      100: "#80C7FF", // Ligeiramente claro
      200: "#66B2FF",
      300: "#4D9EFF",
      400: "#3399FF",
      500: "#007BFF", // Cor primária
      600: "#006FDB",
      700: "#0058A8",
      800: "#004180",
      900: "#002A59",
    },
    green: {
      100: "#A5D8A5", // Ligeiramente claro
      200: "#7CC77C",
      300: "#58B358",
      400: "#3F9F3F",
      500: "#28A745", // Cor de destaque
      600: "#228636",
      700: "#1A6930",
      800: "#124C29",
      900: "#0C3521",
    },
    red: {
      100: "#FFB3B3", // Ligeiramente claro
      200: "#FF9999",
      300: "#FF7F7F",
      400: "#FF6666",
      500: "#DC3545", // Cor secundária
      600: "#B02A3D",
      700: "#8B1F33",
      800: "#661524",
      900: "#4A0F1B",
    },
  },
  fontFamilies: {
    monospace: "monospace",
    sans: "Helvetica",
  },
  fontSizes: {
    small: 12,
    medium: 14,
    large: 16,
    xlarge: 24,
  },
  spacing: {
    small: 5,
    medium: 10,
    large: 15,
    xlarge: 20,
  },
  borderRadius: {
    small: 5,
    medium: 10,
    large: 15,
  },
  shadows: {
    small: {
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
  },
};

// Tokens Semânticos
const semanticTokens = {
  colors: {
    text: primitiveTokens.colors.gray[900],
    secondaryText: primitiveTokens.colors.gray[600],
    primary: primitiveTokens.colors.blue[500],
    secondary: primitiveTokens.colors.red[500],
    accent: primitiveTokens.colors.green[400],
    inputBackground: primitiveTokens.colors.gray[400],
    inputText: primitiveTokens.colors.gray[200],
    border: primitiveTokens.colors.gray[400],
    error: primitiveTokens.colors.red[500],
    background: primitiveTokens.colors.gray[200],
    cardBackground: primitiveTokens.colors.white,
  },
  fontSizes: {
    small: primitiveTokens.fontSizes.small,
    medium: primitiveTokens.fontSizes.medium,
    large: primitiveTokens.fontSizes.large,
    xlarge: primitiveTokens.fontSizes.xlarge,
  },
  spacing: {
    small: primitiveTokens.spacing.small,
    medium: primitiveTokens.spacing.medium,
    large: primitiveTokens.spacing.large,
    xlarge: primitiveTokens.spacing.xlarge,
  },
  borderRadius: {
    small: primitiveTokens.borderRadius.small,
    medium: primitiveTokens.borderRadius.medium,
    large: primitiveTokens.borderRadius.large,
  },
  shadows: {
    small: primitiveTokens.shadows.small,
  },
};

// Tokens Semânticos para Tema Escuro
const darkSemanticTokens = {
  colors: {
    text: primitiveTokens.colors.gray[100],
    secondaryText: primitiveTokens.colors.gray[500],
    primary: primitiveTokens.colors.blue[500],
    secondary: primitiveTokens.colors.red[200],
    accent: primitiveTokens.colors.green[300],
    inputBackground: primitiveTokens.colors.gray[400],
    inputText: primitiveTokens.colors.gray[800],
    border: primitiveTokens.colors.gray[800],
    error: primitiveTokens.colors.red[300],
    background: primitiveTokens.colors.gray[800],
    cardBackground: primitiveTokens.colors.gray[700],
  },
  fontSizes: {
    small: primitiveTokens.fontSizes.small,
    medium: primitiveTokens.fontSizes.medium,
    large: primitiveTokens.fontSizes.large,
    xlarge: primitiveTokens.fontSizes.xlarge,
  },
  spacing: {
    small: primitiveTokens.spacing.small,
    medium: primitiveTokens.spacing.medium,
    large: primitiveTokens.spacing.large,
    xlarge: primitiveTokens.spacing.xlarge,
  },
  borderRadius: {
    small: primitiveTokens.borderRadius.small,
    medium: primitiveTokens.borderRadius.medium,
    large: primitiveTokens.borderRadius.large,
  },
  shadows: {
    small: primitiveTokens.shadows.small,
  },
};

// Exportando os temas
export const theme = {
  ...primitiveTokens,
  ...semanticTokens,
};

export const darkTheme = {
  ...primitiveTokens,
  ...darkSemanticTokens,
};

export default { theme, darkTheme };
