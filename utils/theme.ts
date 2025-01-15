// Tokens Primitivos
const primitiveTokens = {
  colors: {
    black: "#000000",
    white: "#FFFFFF",
    gray: {
      100: "hsl(240, 0%, 96%)",
      200: "hsl(240, 8%, 97%)",
      300: "hsl(240, 6%, 90%)",
      400: "hsl(240, 2%, 69%)",
      500: "hsl(240, 4%, 39%)",
      600: "hsl(240, 10%, 29%)",
      700: "hsl(240, 9%, 22%)",
      800: "hsl(240, 11%, 17%)",
      900: "hsl(240, 0%, 12%)",
    },
    blue: {
      100: "hsl(178, 100%, 75%)", // Ligeiramente claro
      200: "hsl(178, 100%, 70%)",
      300: "hsl(178, 100%, 65%)",
      400: "hsl(178, 100%, 60%)",
      500: "hsl(178, 100%, 50%)", // Cor primária
      600: "hsl(178, 100%, 43%)",
      700: "hsl(178, 100%, 33%)",
      800: "hsl(178, 100%, 25%)",
      900: "hsl(178, 100%, 17%)",
    },
    green: {
      100: "hsl(160, 40%, 75%)", // Ligeiramente claro
      200: "hsl(160, 40%, 63%)",
      300: "hsl(160, 37%, 52%)",
      400: "hsl(160, 43%, 44%)",
      500: "hsl(160, 61%, 41%)", // Cor de destaque
      600: "hsl(160, 60%, 33%)",
      700: "hsl(160, 60%, 26%)",
      800: "hsl(160, 62%, 18%)",
      900: "hsl(160, 63%, 13%)",
    },
    red: {
      100: "hsl(360, 100%, 85%)", // Ligeiramente claro
      200: "hsl(360, 100%, 80%)",
      300: "hsl(360, 100%, 75%)",
      400: "hsl(360, 100%, 70%)",
      500: "hsl(360, 70%, 54%)", // Cor secundária
      600: "hsl(360, 61%, 43%)",
      700: "hsl(360, 64%, 33%)",
      800: "hsl(360, 66%, 24%)",
      900: "hsl(360, 66%, 17%)",
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
    primary: primitiveTokens.colors.blue[700],
    secondary: primitiveTokens.colors.gray[500],
    accent: primitiveTokens.colors.green[400],
    inputBackground: primitiveTokens.colors.white,
    inputText: primitiveTokens.colors.gray[200],
    border: primitiveTokens.colors.gray[300],
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
    secondaryText: primitiveTokens.colors.gray[100],
    primary: primitiveTokens.colors.blue[600],
    secondary: primitiveTokens.colors.gray[200],
    accent: primitiveTokens.colors.green[400],
    inputBackground: primitiveTokens.colors.gray[400],
    inputText: primitiveTokens.colors.gray[100],
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
