import { useTheme } from "../context/ThemeContext";
import { StyleSheet } from "react-native";

const useThemedStyles = () => {
  const { theme } = useTheme();

  return StyleSheet.create({
    container: {
      flex: 1,
      padding: theme.spacing.large,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: theme.spacing.xlarge,
    },
    title: {
      fontSize: theme.fontSizes.xlarge,
      fontWeight: "bold",
      color: theme.colors.text,
      flex: 1,
    },
    iconButton: {
      display: "flex",
      flexDirection: "row",
      gap: theme.spacing.medium,
      padding: theme.spacing.small,
    },
    iconButtonText: {
      color: theme.colors.secondaryText,
    },

    tokenImagesContainer: {
      flexDirection: "row",
      marginTop: theme.spacing.small,
    },
    tokenImage: {
      width: theme.spacing.xlarge,
      height: theme.spacing.xlarge,
      marginRight: theme.spacing.small,
    },
    walletTotal: {
      fontSize: theme.fontSizes.small,
      color: theme.colors.text,
      fontWeight: "normal",
    },
    createButton: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: theme.spacing.xlarge,
    },
    createButtonText: {
      fontSize: theme.fontSizes.large,
      marginLeft: theme.spacing.medium,
      color: theme.colors.text,
    },

    /** TokensScreen */
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    centeredView: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.background,
    },
    modalView: {
      margin: theme.spacing.xlarge,
      backgroundColor: theme.colors.cardBackground,
      borderRadius: theme.spacing.medium,
      padding: theme.spacing.xlarge,
      shadowColor: theme.colors.background,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: theme.spacing.small,
    },
    modalClose: {
      position: "absolute",
      top: theme.spacing.medium,
      right: theme.spacing.medium,
    },
    modalTitle: {
      fontSize: theme.fontSizes.xlarge,
      fontWeight: "bold",
      color: theme.colors.text,
      marginBottom: theme.spacing.medium,
    },
    inputContainer: {
      marginBottom: theme.spacing.medium,
    },
    label: {
      fontSize: theme.fontSizes.large,
      color: theme.colors.text,
      marginBottom: theme.spacing.small,
    },
    input: {
      height: 40,
      backgroundColor: theme.colors.inputBackground,
      borderColor: theme.colors.border,
      borderWidth: 1,
      padding: theme.spacing.medium,
      borderRadius: theme.spacing.small,
    },
    listStyle: {
      marginHorizontal: -theme.spacing.xlarge,
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: theme.spacing.medium,
    },
    picker: {
      height: 50,
      backgroundColor: theme.colors.inputBackground,
      color: theme.colors.text,
    },
    confirmButton: {
      backgroundColor: theme.colors.primary,
      padding: theme.spacing.medium,
      borderRadius: theme.spacing.small,
      marginTop: theme.spacing.medium,
      alignItems: "center",
      zIndex: 1,
    },
    confirmButtonText: {
      color: theme.colors.text,
      fontWeight: "bold",
    },
    selectText: {
      fontSize: theme.fontSizes.large,
      color: theme.colors.text,
      padding: theme.spacing.medium,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.spacing.small,
      textAlign: "center",
      marginBottom: theme.spacing.medium,
    },

    /** Tokens Details Screen */

    headerToken: {
      display: "flex",
      justifyContent: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.xlarge,
      flex: 1,
    },

    additionTimestamp: {
      color: theme.colors.secondaryText,
      fontSize: theme.fontSizes.small,
    },
    noTokenText: {
      color: theme.colors.secondaryText,
      textAlign: "center",
      fontSize: theme.fontSizes.large,
    },
    redeemButton: {
      padding: theme.spacing.small,
    },

    /** Swap Token Screen */

    calculatedAmount: {
      fontSize: theme.fontSizes.large,
    },

    selectButton: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      height: 40,
      backgroundColor: theme.colors.inputBackground,
      borderColor: theme.colors.border,
      borderWidth: 1,
      padding: theme.spacing.medium,
      borderRadius: theme.spacing.small,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderBottomWidth: 1,
      borderBottomColor: "#eee",
      marginBottom: theme.spacing.medium,
    },
    searchIcon: {
      marginRight: theme.spacing.medium,
    },
    searchInput: {
      flex: 1,
      height: 40,
      paddingVertical: theme.spacing.small,
    },
    tokenItem: {
      padding: theme.spacing.medium,
      borderBottomWidth: 1,
      borderBottomColor: "#eee",
    },
    tokenItemText: {
      fontSize: theme.fontSizes.large,
    },
    pickerContainer: {
      marginBottom: theme.spacing.medium,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.spacing.small,
    },
    /** Add token Screen */

    value: {
      fontSize: theme.fontSizes.large,
      color: theme.colors.text,
      fontWeight: "bold",
    },

    /** TokenItem */

    itemContainer: {
      paddingVertical: theme.spacing.medium,
      paddingLeft: theme.spacing.medium,
      marginHorizontal: theme.spacing.large,
      marginVertical: theme.spacing.small,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: theme.colors.cardBackground,
      borderRadius: theme.spacing.medium,
    },
    imageContainer: {
      width: 54,
      height: 48,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    leftContainer: {
      width: "30%",
      paddingLeft: theme.spacing.small,
    },
    centerContainer: {
      flex: 1,
      paddingLeft: theme.spacing.small,
      flexDirection: "column",
      alignItems: "flex-end",
    },
    rightContainer: {
      flex: 1,
      paddingLeft: theme.spacing.small,
      flexDirection: "column",
      alignItems: "flex-end",
      paddingRight: theme.spacing.medium,
    },
    currencyValueContainer: {
      alignItems: "flex-end",
    },
    name: {
      fontSize: theme.fontSizes.large,
      color: theme.colors.text,
      textAlign: "left",
      fontWeight: "bold",
    },
    amount: {
      fontSize: theme.fontSizes.medium,
      color: theme.colors.secondaryText,
      fontFamily: theme.fontFamilies.monospace,
    },
    currencyPercentageChange: {
      fontSize: theme.fontSizes.small,
      marginLeft: theme.spacing.small,
      fontFamily: theme.fontFamilies.monospace,
    },
    gain: {
      color: theme.colors.accent,
    },
    loss: {
      color: theme.colors.error,
    },
    currency: {
      textTransform: "uppercase",
      paddingRight: theme.spacing.small,
      fontSize: theme.fontSizes.small,
      color: theme.colors.secondaryText,
      fontFamily: theme.fontFamilies.monospace,
    },
    detailsButton: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: theme.spacing.xlarge,
    },
    percentageBarContainer: {
      display: "flex",
      flexDirection: "row",
      width: "100%",
      height: 8,
      backgroundColor: theme.colors.border,
      borderRadius: 4,
      marginTop: theme.spacing.small,
    },
    percentageBar: {
      height: "100%",
      backgroundColor: "#fff", // Cor da barra, pode ser ajustada
      borderRadius: 4,
    },

    /** Token Addition Item */
    percentageChange: {
      fontSize: theme.fontSizes.small,
      fontFamily: theme.fontFamilies.monospace,
    },

    /** Settings */
  });
};

export default useThemedStyles;
