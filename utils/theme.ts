// Tokens Primitivos
const primitiveTokens = {
  colors: {
    black: "#000000",
    white: "#FFFFFF",
    gray100: "#F8F9FA",
    gray200: "#E9ECEF",
    gray300: "#DEE2E6",
    gray400: "#CED4DA",
    gray500: "#ADB5BD",
    gray600: "#6C757D",
    gray700: "#495057",
    gray800: "#343A40",
    gray900: "#212529",
    blue: "#007BFF",
    green: "#28A745",
    red: "#DC3545",
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

// Tokens Primitivos para Tema Escuro
const darkPrimitiveTokens = {
  colors: {
    black: "#FFFFFF",
    white: "#000000",
    gray100: "#212529",
    gray200: "#343A40",
    gray300: "#495057",
    gray400: "#6C757D",
    gray500: "#ADB5BD",
    gray600: "#CED4DA",
    gray700: "#DEE2E6",
    gray800: "#E9ECEF",
    gray900: "#F8F9FA",
    blue: "#007BFF",
    green: "#28A745",
    red: "#DC3545",
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
    text: primitiveTokens.colors.gray900,
    secondaryText: primitiveTokens.colors.gray600,
    primary: primitiveTokens.colors.blue,
    secondary: primitiveTokens.colors.red,
    accent: primitiveTokens.colors.green,
    inputBackground: primitiveTokens.colors.gray100,
    border: primitiveTokens.colors.gray400,
    error: primitiveTokens.colors.red,
    background: primitiveTokens.colors.gray200,
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
    text: darkPrimitiveTokens.colors.gray100,
    secondaryText: darkPrimitiveTokens.colors.gray400,
    primary: darkPrimitiveTokens.colors.blue,
    secondary: darkPrimitiveTokens.colors.red,
    accent: darkPrimitiveTokens.colors.green,
    inputBackground: darkPrimitiveTokens.colors.gray800,
    border: darkPrimitiveTokens.colors.gray600,
    error: darkPrimitiveTokens.colors.red,
    background: darkPrimitiveTokens.colors.gray900,
    cardBackground: darkPrimitiveTokens.colors.gray700,
  },
  fontSizes: {
    small: darkPrimitiveTokens.fontSizes.small,
    medium: darkPrimitiveTokens.fontSizes.medium,
    large: darkPrimitiveTokens.fontSizes.large,
    xlarge: darkPrimitiveTokens.fontSizes.xlarge,
  },
  spacing: {
    small: darkPrimitiveTokens.spacing.small,
    medium: darkPrimitiveTokens.spacing.medium,
    large: darkPrimitiveTokens.spacing.large,
    xlarge: darkPrimitiveTokens.spacing.xlarge,
  },
  borderRadius: {
    small: darkPrimitiveTokens.borderRadius.small,
    medium: darkPrimitiveTokens.borderRadius.medium,
    large: darkPrimitiveTokens.borderRadius.large,
  },
  shadows: {
    small: darkPrimitiveTokens.shadows.small,
  },
};

// Exportando os temas
export const theme = {
  ...primitiveTokens,
  ...semanticTokens,
};

export const darkTheme = {
  ...darkPrimitiveTokens,
  ...darkSemanticTokens,
};

export default { theme, darkTheme };
